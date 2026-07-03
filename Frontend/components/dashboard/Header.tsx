"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Calendar, 
  ChevronDown, 
  Sun, 
  Moon, 
  Settings, 
  Globe, 
  Building 
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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

    // Click outside handler to close settings
    const clickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
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
    <header className="flex flex-col gap-4 bg-transparent px-4 py-6 sm:px-6 lg:px-8 relative z-20">
      <div className="flex items-start justify-between">
        <div />
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="h-10 w-[240px] sm:w-[300px] rounded-full border border-border-color bg-card-bg pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Notifications Button */}
            <button type="button" className="relative p-2 text-text-muted hover:text-slate-900 dark:hover:text-white rounded-full border border-border-color bg-card-bg cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0B0F19]">
                3
              </span>
            </button>
 
            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden shrink-0">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getUserName())}&background=6366f1&color=fff`} 
                alt="Avatar" 
                className="h-full w-full object-cover" 
              />
            </div>
          </div>

          {/* Action Row: Calendar Filter & Custom Settings Menu next to it */}
          <div className="flex items-center gap-2 relative" ref={settingsRef}>
            <button className="flex items-center gap-2 rounded-full border border-border-color bg-card-bg px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-bg-hover cursor-pointer transition-colors shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              01/07/2026 - 07/07/2026
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Combined Settings Dropdown Button */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-full border border-border-color bg-card-bg hover:bg-bg-hover cursor-pointer transition-all shadow-sm ${
                isSettingsOpen ? 'ring-2 ring-indigo-500/20 border-indigo-550' : ''
              }`}
              title="Cài đặt hệ thống"
            >
              <Settings className="h-4.5 w-4.5 text-slate-550 dark:text-slate-450" />
            </button>

            {/* Custom Settings Popover Card */}
            {isSettingsOpen && (
              <div className="absolute right-0 top-11 w-64 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-850">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">Cài đặt hệ thống</span>
                </div>

                {/* Theme toggle setting row */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-750 dark:text-slate-350">
                  <span>Chế độ giao diện</span>
                  <button 
                    type="button" 
                    onClick={toggleTheme}
                    className="flex h-8 w-14 items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1 transition-colors cursor-pointer relative"
                  >
                    <div 
                      className={`h-6 w-6 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center shadow-md transform transition-transform duration-250 ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      {theme === 'light' ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
                    </div>
                  </button>
                </div>

                {/* Language row */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-750 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <span>Ngôn ngữ</span>
                  </div>
                  <span className="text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-800">
                    Tiếng Việt
                  </span>
                </div>

                {/* Hotel Brand row */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-750 dark:text-slate-350">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>Khách sạn</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold truncate max-w-[100px]">
                    Lumiere
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
