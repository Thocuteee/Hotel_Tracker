"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, BedDouble, CalendarDays, LineChart, Users, Star, Settings, Bell, ChevronLeft, ChevronRight, UserCheck, LogOut, MapPin, Layers, Sparkles, Percent, LayoutDashboard, Globe } from 'lucide-react';
import { Building2 } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home, roles: ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] },
  { name: 'Branches', href: '/admin/branches', icon: MapPin, roles: ['ADMIN'] },
  { name: 'Room Types', href: '/admin/room-types', icon: Layers, roles: ['ADMIN'] },
  { name: 'Rooms', href: '/admin/rooms', icon: BedDouble, roles: ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Employees', href: '/admin/employees', icon: UserCheck, roles: ['ADMIN'] },
  { name: 'Services', href: '/admin/services', icon: Sparkles, roles: ['ADMIN'] },
  { name: 'Promotions', href: '/admin/promotions', icon: Percent, roles: ['ADMIN'] },
  { name: 'Reviews', href: '/admin/reviews', icon: Star, roles: ['ADMIN', 'RECEPTIONIST'] },
  { name: 'Reports', href: '/admin/reports', icon: LineChart, roles: ['ADMIN'] },
  { name: 'CMS', href: '/admin/cms', icon: LayoutDashboard, roles: ['ADMIN'] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
  { name: 'Về trang khách', href: '/', icon: Globe, roles: ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // Clear cookies for Next.js Middleware route guard
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push('/login');
  };

  const getDisplayName = () => {
    if (!user?.email) return 'Admin User';
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix
      .split(/[\.\-_]/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUserInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRoleLabel = () => {
    if (!user?.role) return 'Quản trị viên';
    if (user.role === 'ADMIN') return 'Quản trị viên';
    if (user.role === 'RECEPTIONIST') return 'Lễ tân';
    if (user.role === 'HOUSEKEEPING') return 'Buồng phòng';
    return 'Nhân viên';
  };

  return (
    <div className={`hidden bg-card-bg md:flex md:flex-col border-r border-border-color transition-all duration-300 relative ${
      isCollapsed ? 'w-[80px]' : 'w-[280px]'
    }`}>
      {/* Header Sidebar */}
      <div className="flex h-20 shrink-0 items-center px-4 gap-3 justify-between border-b border-border-color">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Hotel Tracker</h1>
              <span className="text-xs text-slate-500 dark:text-slate-400">Management System</span>
            </div>
          )}
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={onToggleCollapse}
          className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 border border-slate-200 dark:border-slate-800 text-white hover:bg-indigo-500 transition-colors shadow-md z-10"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto mt-4 scrollbar-hide">
        <nav className="flex-1 space-y-2 px-3">
          {navigation
            .filter((item) => !item.roles || item.roles.includes(user?.role || ''))
            .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-xl py-3 text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isCollapsed ? '' : 'mr-3'
                  } ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="animate-in fade-in duration-300 whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom blocks */}
      <div className="p-3 mt-auto space-y-3">

        {/* User Box */}
        <div className={`flex items-center justify-between rounded-2xl bg-bg-hover border border-border-color p-3 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white uppercase">
              {getUserInitials()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden max-w-[120px] animate-in fade-in duration-300">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={getDisplayName()}>
                  {getDisplayName()}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{getRoleLabel()}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white relative animate-in fade-in duration-300">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-slate-50 dark:ring-[#0B0F19]" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 animate-in fade-in duration-300 cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
