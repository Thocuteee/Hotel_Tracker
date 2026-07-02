"use client"

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Gift, 
  CalendarDays,
  Sparkles
} from 'lucide-react';

interface Room {
  id: string;
  number: string;
  type: string;
  status: 'to_clean' | 'in_progress' | 'stayover' | 'inspected' | 'ready';
  urgent: boolean;
  image: string;
  details: string;
  staff?: string;
  progress?: number;
  eta?: string;
  notes?: string;
  avatars?: string[];
}

const initialRooms: Room[] = [
  {
    id: 'room-1',
    number: '305',
    type: 'Deluxe',
    status: 'to_clean',
    urgent: true,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=400&auto=format&fit=crop',
    details: 'Checkout: 11:00 AM (Còn 2h)',
    avatars: ['NS', 'TD']
  },
  {
    id: 'room-2',
    number: '102',
    type: 'Superior',
    status: 'in_progress',
    urgent: false,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop',
    details: 'Staff: Nguyễn Văn A',
    staff: 'Nguyễn Văn A',
    progress: 65,
    eta: '15p nữa'
  },
  {
    id: 'room-3',
    number: '504',
    type: 'Suite',
    status: 'stayover',
    urgent: false,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400&auto=format&fit=crop',
    details: 'Yêu cầu: Dọn lúc 14:00 PM',
    notes: 'Cần thêm 02 bộ khăn tắm mới'
  },
  {
    id: 'room-4',
    number: '201',
    type: 'Standard',
    status: 'inspected',
    urgent: false,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=400&auto=format&fit=crop',
    details: 'Đã kiểm tra bởi Supervisor lúc 09:45 AM'
  }
];

export default function HousekeepingDashboard() {
  const [userName, setUserName] = useState('Nhân viên');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [activeTab, setActiveTab] = useState<'all' | 'checkout' | 'stayover'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleStartClean = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            status: 'in_progress', 
            details: `Staff: ${userName}`, 
            staff: userName, 
            progress: 10, 
            eta: '45p nữa' 
          } 
        : room
    ));
  };

  const handleSetReady = (roomId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { 
            ...room, 
            status: 'ready', 
            details: 'Sẵn sàng đón khách mới' 
          } 
        : room
    ));
  };

  const filteredRooms = rooms.filter(room => {
    // Tab filter
    if (activeTab === 'checkout' && room.status !== 'to_clean' && room.status !== 'in_progress') return false;
    if (activeTab === 'stayover' && room.status !== 'stayover') return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return room.number.includes(query) || room.type.toLowerCase().includes(query);
    }
    
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản lý buồng phòng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chào mừng trở lại, {userName}. Dưới đây là phân công dọn phòng hôm nay.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm phòng..."
            className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="TỔNG SỐ PHÒNG"
          value="42"
          description="+12% so với hôm qua"
          trend="up"
          colorVariant="indigo"
        />
        <StatCard
          title="CẦN DỌN DẸP"
          value="18"
          description="Hôm nay dọn dẹp"
          trend="up"
          colorVariant="amber"
        />
        <StatCard
          title="ĐANG THỰC HIỆN"
          value="06"
          description="8 phòng chờ dọn"
          trend="down"
          colorVariant="indigo"
        />
        <StatCard
          title="ĐÃ KIỂM TRA"
          value="04"
          description="100% đạt chuẩn"
          trend="up"
          colorVariant="emerald"
        />
      </div>

      {/* Main Grid: Left List, Right Widgets */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column - Room list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Tabs */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Tất cả (18)
              </button>
              <button
                onClick={() => setActiveTab('checkout')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'checkout'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Checkout (12)
              </button>
              <button
                onClick={() => setActiveTab('stayover')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'stayover'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Stayover (6)
              </button>
            </div>

            {/* Dropdown Filters */}
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <Filter className="h-3.5 w-3.5" />
                Lọc theo tầng
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sắp xếp
              </button>
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1 border-l-4 border-indigo-600">
            Ưu tiên: Checkout hôm nay
          </h2>

          {/* Rooms Grid/List */}
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <div 
                key={room.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Left: Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative h-20 w-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                    <img src={room.image} alt={room.number} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">P. {room.number} - {room.type}</span>
                      {room.urgent && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                          Urgent
                        </span>
                      )}
                      
                      {/* Status Badges */}
                      {room.status === 'to_clean' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                          To Clean
                        </span>
                      )}
                      {room.status === 'in_progress' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 animate-pulse">
                          In Progress
                        </span>
                      )}
                      {room.status === 'stayover' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Stayover
                        </span>
                      )}
                      {room.status === 'inspected' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                          Inspected
                        </span>
                      )}
                      {room.status === 'ready' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
                          Ready
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      {room.status === 'to_clean' && <Clock className="h-3.5 w-3.5 text-slate-400" />}
                      {room.status === 'in_progress' && <User className="h-3.5 w-3.5 text-slate-400" />}
                      {room.status === 'stayover' && <Clock className="h-3.5 w-3.5 text-slate-400" />}
                      {room.status === 'inspected' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      {room.status === 'ready' && <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />}
                      {room.details}
                    </p>

                    {/* Progress Bar for In Progress */}
                    {room.status === 'in_progress' && room.progress && (
                      <div className="w-60 pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                          <span>Tiến độ: {room.progress}%</span>
                          <span>Dự kiến: {room.eta}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                            style={{ width: `${room.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Notes for Stayover */}
                    {room.notes && (
                      <p className="text-xs italic text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-900/20 max-w-sm mt-1">
                        "{room.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions / Avatars */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {room.avatars && (
                    <div className="flex -space-x-2">
                      {room.avatars.map((av, index) => (
                        <div 
                          key={index}
                          className="h-7 w-7 rounded-full border-2 border-white dark:border-[#0B0F19] bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300"
                        >
                          {av}
                        </div>
                      ))}
                      <div className="h-7 w-7 rounded-full border-2 border-white dark:border-[#0B0F19] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        +2
                      </div>
                    </div>
                  )}

                  {room.status === 'to_clean' && (
                    <button
                      onClick={() => handleStartClean(room.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
                    >
                      Bắt đầu dọn
                    </button>
                  )}

                  {room.status === 'stayover' && (
                    <button className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                      Phân công
                    </button>
                  )}

                  {room.status === 'inspected' && (
                    <button
                      onClick={() => handleSetReady(room.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                    >
                      Sẵn sàng đón khách
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Lịch trình hôm nay */}
          <div className="p-6 bg-indigo-600 text-white rounded-3xl space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500 rounded-full translate-x-12 -translate-y-12 opacity-50" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className="text-base font-bold">Lịch trình hôm nay</h3>
                <p className="text-[10px] text-indigo-100">Thứ 6, 01/07/2026</p>
              </div>
              <CalendarDays className="h-5 w-5 text-indigo-100" />
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-4">
                <span className="px-2 py-1 rounded-lg bg-indigo-500 text-[10px] font-bold">SÁNG<br/>08h</span>
                <p className="text-xs font-semibold leading-relaxed pt-1">Họp giao ban & Phân công nhiệm vụ</p>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="px-2 py-1 rounded-lg bg-indigo-500 text-[10px] font-bold">TRƯA<br/>10h</span>
                <p className="text-xs font-semibold leading-relaxed pt-1">Dọn 12 phòng Checkout hết hạn</p>
              </div>

              <div className="flex items-start gap-4">
                <span className="px-2 py-1 rounded-lg bg-indigo-500 text-[10px] font-bold">CHIỀU<br/>14h</span>
                <p className="text-xs font-semibold leading-relaxed pt-1">Kiểm kê kho & Đổ tiêu hao định kỳ</p>
              </div>
            </div>
          </div>

          {/* Vật tư tiêu hao */}
          <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Vật tư tiêu hao
            </h3>
            
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Khăn tắm</span>
                  <span className="text-rose-600 font-bold">15/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              {/* Item 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Bộ đồ vệ sinh</span>
                  <span className="text-amber-600 font-bold">45/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              {/* Item 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Nước uống (chai)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">82/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>
            </div>

            <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-600/50 hover:border-indigo-600 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all cursor-pointer">
              <Plus className="h-4 w-4" />
              Yêu cầu thêm vật tư
            </button>
          </div>

          {/* Ghi chú & Sự cố */}
          <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ghi chú & Sự cố
            </h3>

            <div className="space-y-4">
              {/* Alert 1 */}
              <div className="flex gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <div className="h-7 w-7 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">P. 402 - Hư vòi sen</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Vừa xong - Đang chờ kỹ thuật</p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <Gift className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">P. 205 - Khách VIP</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Cần bày trí trái cây lúc 2h</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
