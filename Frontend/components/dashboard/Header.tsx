"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Calendar, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check theme
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // Check user info
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

  const getUserName = () => {
    if (!user?.email) return 'Admin';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .split(/[\.\-_]/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="flex flex-col gap-4 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div />
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="h-10 w-[300px] rounded-full border border-border-color bg-card-bg pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            
            {/* Toggle Theme Button */}
            <button 
              type="button" 
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-slate-900 dark:hover:text-white rounded-full border border-border-color bg-card-bg transition-colors"
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Notifications Button */}
            <button type="button" className="relative p-2 text-text-muted hover:text-slate-900 dark:hover:text-white rounded-full border border-border-color bg-card-bg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0B0F19]">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName())}&background=6366f1&color=fff`} 
                alt="Avatar" 
                className="h-full w-full object-cover" 
              />
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-full border border-border-color bg-card-bg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-bg-hover">
            <Calendar className="h-4 w-4 text-slate-400" />
            01/07/2026 - 07/07/2026
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
