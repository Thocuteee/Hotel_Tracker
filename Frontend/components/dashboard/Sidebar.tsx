import Link from 'next/link';
import { Home, BedDouble, CalendarDays, LineChart, Users, FileText, Star, Settings, Bell, StarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Building2 } from 'lucide-react';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: Home, current: true },
  { name: 'Quản lý phòng', href: '#', icon: BedDouble, current: false },
  { name: 'Danh sách đặt phòng', href: '#', icon: CalendarDays, current: false },
  { name: 'Doanh thu', href: '#', icon: LineChart, current: false },
  { name: 'Khách hàng', href: '#', icon: Users, current: false },
  { name: 'Báo cáo', href: '#', icon: FileText, current: false },
  { name: 'Đánh giá', href: '#', icon: Star, current: false },
  { name: 'Cài đặt', href: '#', icon: Settings, current: false },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`hidden bg-white dark:bg-[#0B0F19] md:flex md:flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative ${
      isCollapsed ? 'w-[80px]' : 'w-[280px]'
    }`}>
      {/* Header Sidebar */}
      <div className="flex h-20 shrink-0 items-center px-4 gap-3 justify-between border-b border-slate-100 dark:border-slate-800">
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
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-xl py-3 text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  item.current
                    ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-indigo-800 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    isCollapsed ? '' : 'mr-3'
                  } ${
                    item.current ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-white'
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
        {/* Hotel Upgrade Box */}
        {!isCollapsed && (
          <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 animate-in fade-in duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Khách sạn</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Luxury Hotel & Resort</p>
            <div className="flex text-amber-400 mb-4">
              <StarIcon className="h-3 w-3 fill-current" />
              <StarIcon className="h-3 w-3 fill-current" />
              <StarIcon className="h-3 w-3 fill-current" />
              <StarIcon className="h-3 w-3 fill-current" />
              <StarIcon className="h-3 w-3 fill-current" />
            </div>
            <button className="w-full rounded-lg bg-slate-200/60 dark:bg-white/10 py-2 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
              Nâng cấp gói
            </button>
          </div>
        )}

        {/* User Box */}
        <div className={`flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              AU
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-300">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Admin User</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Quản trị viên</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white relative animate-in fade-in duration-300">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50 dark:ring-[#0B0F19]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
