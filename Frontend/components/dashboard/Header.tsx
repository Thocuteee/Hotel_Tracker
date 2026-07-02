"use client"

import { useState, useEffect } from 'react';
import { Bell, Search, Calendar, ChevronDown, Sun, Moon } from 'lucide-react';

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Kiểm tra theme lưu trong localStorage hoặc hệ thống
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
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

  return (
    <header className="flex flex-col gap-4 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Xin chào, Admin 👋
          </h2>
          <p className="text-sm text-text-muted mt-1">Dưới đây là tổng quan hoạt động của khách sạn</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="h-10 w-[300px] rounded-full border border-border-color bg-card-bg pl-10 pr-4 text-sm text-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {/* Nút Toggle Theme */}
            <button 
              type="button" 
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-foreground rounded-full border border-border-color bg-card-bg transition-colors"
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button type="button" className="relative p-2 text-text-muted hover:text-foreground rounded-full border border-border-color bg-card-bg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0B0F19]">
                3
              </span>
            </button>
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" alt="Avatar" className="h-full w-full object-cover" />
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-full border border-border-color bg-card-bg px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-bg-hover">
            <Calendar className="h-4 w-4 text-slate-400" />
            01/07/2026 - 07/07/2026
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
