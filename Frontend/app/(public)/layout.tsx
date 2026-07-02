"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Sun, Moon, LogOut, User, CalendarDays, Search, ShoppingBag } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial theme
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // Check user session
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Hotel Tracker</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Trang chủ</Link>
            <Link href="#rooms" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Tìm phòng</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Ưu đãi</Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Về chúng tôi</Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Shopping Bag Icon */}
            <Link href="/bookings" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              {user && (
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </Link>

            {/* Toggle Theme */}
            <button 
              type="button" 
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/bookings"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                  <CalendarDays className="h-4 w-4" />
                  Đơn đặt phòng
                </Link>
                {user.role !== 'CUSTOMER' && (
                  <Link 
                    href="/admin"
                    className="text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Vào Dashboard
                  </Link>
                )}
                <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`} 
                    alt={user.name} 
                    className="h-full w-full object-cover" 
                  />
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register"
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Hotel Tracker System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
