"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

const routePermissions: Record<string, string[]> = {
  '/admin/employees': ['ADMIN'],
};

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return undefined;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    const cookieToken = getCookie('accessToken');
    const localToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!cookieToken || !localToken) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      setIsAuthenticated(false);
      window.location.href = '/login';
      return;
    }

    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      window.location.href = '/login';
    } else if (user.role === 'CUSTOMER') {
      window.location.href = '/';
    } else {
      const allowedRoles = routePermissions[pathname];
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/admin');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router, pathname]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full flex h-screen overflow-hidden w-full">
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
