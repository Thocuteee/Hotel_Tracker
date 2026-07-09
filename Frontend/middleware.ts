import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const routePermissions: Record<string, string[]> = {
  '/admin/employees': ['ADMIN'],
  '/admin/customers': ['ADMIN', 'RECEPTIONIST'],
  '/admin/bookings': ['ADMIN', 'RECEPTIONIST'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('accessToken')?.value;
  const role = request.cookies.get('userRole')?.value;

  console.log(`[Middleware] Path: ${pathname} | Has Token: ${!!token} | Role: ${role}`);

  // 1. Check if user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (role === 'CUSTOMER') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Role-based permission checks
    const allowedRoles = routePermissions[pathname];
    if (allowedRoles && !allowedRoles.includes(role || '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  // 1b. Check if user is accessing customer booking or checkout routes
  if (pathname.startsWith('/checkout') || pathname.startsWith('/bookings')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 2. If logged in, block accessing login/register pages
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'CUSTOMER' ? '/' : '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout',
    '/bookings',
    '/login',
    '/register'
  ]
};
