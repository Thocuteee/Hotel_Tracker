"use client"

import { useState, useEffect } from 'react';
import { 
  Filter, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  LogIn, 
  User, 
  Loader2,
  X,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import Toast, { ToastMessage } from '@/components/ui/Toast';

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'ready' | 'occupied' | 'cleaning' | 'maintenance';
  guestName?: string;
  vip?: boolean;
  roomTypeId: number;
  cleaningStaff?: string;
  cleaningTime?: string;
  maintenanceIssue?: string;
  maintenanceTime?: string;
  history: {
    event: string;
    time: string;
  }[];
}

export default function ReceptionistRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [updating, setUpdating] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Checkin custom modal state
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [guestInputName, setGuestInputName] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/rooms');
      
      const mappedRooms = res.data.map((r: any) => {
        let frontendStatus: Room['status'] = 'ready';
        if (r.status === 'OCCUPIED') frontendStatus = 'occupied';
        if (r.status === 'DIRTY') frontendStatus = 'cleaning';
        if (r.status === 'MAINTENANCE') frontendStatus = 'maintenance';

        let guestName = undefined;
        if (frontendStatus === 'occupied') {
          guestName = r.roomNumber === '101' ? 'Nguyễn Văn An' : 
                      r.roomNumber === '202' ? 'Phạm Bình' :
                      r.roomNumber === '203' ? 'Ngô Quyền' : 'Khách lưu trú';
        }

        const history = [
          { event: frontendStatus === 'ready' ? 'Dọn phòng hoàn tất' : 'Thay đổi trạng thái phòng', time: 'Hôm nay' }
        ];

        return {
          id: String(r.id),
          number: r.roomNumber,
          type: r.roomType?.name || 'Deluxe Suite',
          floor: r.floor,
          status: frontendStatus,
          guestName,
          vip: r.roomNumber === '201',
          roomTypeId: r.roomType?.id || 0,
          cleaningStaff: frontendStatus === 'cleaning' ? 'Lê Thị Hoa' : undefined,
          cleaningTime: frontendStatus === 'cleaning' ? '15:30' : undefined,
          maintenanceIssue: frontendStatus === 'maintenance' ? 'Sửa vòi nước' : undefined,
          maintenanceTime: frontendStatus === 'maintenance' ? '09:00' : undefined,
          history
        };
      });

      // Sort rooms by number ascending
      mappedRooms.sort((a: Room, b: Room) => Number(a.number) - Number(b.number));

      setRooms(mappedRooms);
      if (mappedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(mappedRooms[0].id);
      }
    } catch (e) {
      console.error(e);
      showToast('error', 'Thất bại', 'Không thể kết nối máy chủ để lấy thông tin sơ đồ phòng.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (room: Room, newStatus: Room['status'], guest?: string) => {
    setUpdating(true);
    let statusString = 'AVAILABLE';
    if (newStatus === 'occupied') statusString = 'OCCUPIED';
    if (newStatus === 'cleaning') statusString = 'DIRTY';
    if (newStatus === 'maintenance') statusString = 'MAINTENANCE';

    try {
      await api.put(`/api/v1/rooms/${room.id}`, {
        roomNumber: room.number,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        status: statusString
      });

      setRooms(prev => prev.map(r => {
        if (r.id === room.id) {
          const updatedHistory = [...r.history];
          let event = '';
          if (newStatus === 'ready') event = 'Đánh dấu sẵn sàng';
          if (newStatus === 'cleaning') event = 'Yêu cầu dọn dẹp';
          if (newStatus === 'maintenance') event = 'Khóa bảo trì thiết bị';
          if (newStatus === 'occupied') event = `Check-in: ${guest || 'Khách lưu trú'}`;
          
          updatedHistory.unshift({
            event,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - Vừa xong'
          });

          return { 
            ...r, 
            status: newStatus,
            guestName: newStatus === 'occupied' ? guest : undefined,
            cleaningStaff: newStatus === 'cleaning' ? 'Nhân viên A' : undefined,
            cleaningTime: newStatus === 'cleaning' ? '16:00' : undefined,
            maintenanceIssue: newStatus === 'maintenance' ? 'Sửa chữa điện' : undefined,
            maintenanceTime: newStatus === 'maintenance' ? '10:00' : undefined,
            history: updatedHistory
          };
        }
        return r;
      }));

      showToast('success', 'Cập nhật thành công', `Phòng ${room.number} đã cập nhật trạng thái mới.`);
    } catch (e) {
      console.error(e);
      showToast('error', 'Lỗi cập nhật', 'Không thể thay đổi trạng thái phòng. Vui lòng thử lại sau.');
    } finally {
      setUpdating(false);
      setCheckInRoom(null);
      setGuestInputName('');
    }
  };

  const executeCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !guestInputName.trim()) return;
    handleUpdateStatus(checkInRoom, 'occupied', guestInputName.trim());
  };

  const filteredRooms = rooms.filter(room => {
    if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
    if (typeFilter !== 'all' && room.type !== typeFilter) return false;
    return true;
  });

  const totalRooms = rooms.length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const readyCount = rooms.filter(r => r.status === 'ready').length;
  const cleaningCount = rooms.filter(r => r.status === 'cleaning').length;
  const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Metric Cards matching Screenshot 2 Header */}
      <div className="grid gap-6 md:grid-cols-4">
        
        <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lượt đến (Sẵn sàng)</span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{readyCount}</span>
            <span className="text-[10px] font-bold text-emerald-650">Phòng trống sẵn sàng Check-in</span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl flex items-center justify-center">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lượt đi (Đang ở)</span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{occupiedCount}</span>
            <span className="text-[10px] font-bold text-slate-500">Đang có khách lưu trú</span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tỷ lệ lấp đầy</span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{occupancyRate}%</span>
            <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đang dọn dẹp</span>
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-455 block leading-none">{cleaningCount}</span>
            <span className="text-[10px] font-bold text-rose-500">Phòng cần làm vệ sinh</span>
          </div>
        </div>

      </div>

      {/* Filter Row and Floor Tabs matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-805 pb-2">
        {/* Floor selector tabs */}
        <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-250/20 w-fit">
          {[
            { id: 'all', label: 'Tất cả tầng' },
            { id: 1, label: 'Tầng 1' },
            { id: 2, label: 'Tầng 2' },
            { id: 5, label: 'Tầng thượng' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFloorFilter(opt.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                floorFilter === opt.id
                  ? 'bg-white dark:bg-[#0B0F19] text-indigo-650 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Room type filter */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-650 focus:outline-none cursor-pointer"
          >
            <option value="all">Hạng phòng: Tất cả</option>
            <option value="Deluxe King">Deluxe King</option>
            <option value="Suite Family">Suite Family</option>
            <option value="Lumiere Penthouse">Lumiere Penthouse</option>
          </select>
        </div>
      </div>

      {/* Legends Indicators */}
      <div className="flex flex-wrap gap-4 text-xs font-bold pl-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-650" />
          <span className="text-slate-600 dark:text-slate-450">Có khách</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-450">Sẵn sàng</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600 dark:text-slate-450">Đang dọn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-450">Bảo trì</span>
        </div>
      </div>

      {/* Sơ đồ phòng grid matching Screenshot 2 */}
      {loading ? (
        <div className="flex h-[30vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 pb-12">
          {filteredRooms.map((room) => {
            const isOccupied = room.status === 'occupied';
            const isReady = room.status === 'ready';
            const isCleaning = room.status === 'cleaning';
            const isMaintenance = room.status === 'maintenance';

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex flex-col text-left p-4.5 rounded-2xl border bg-white dark:bg-[#0B0F19] transition-all relative cursor-pointer ${
                  isOccupied ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-600/10' :
                  isReady ? 'border-emerald-500' :
                  isCleaning ? 'border-amber-450' :
                  'border-rose-500'
                }`}
              >
                {/* Header row: Room number & status badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xl font-extrabold ${
                    isOccupied ? 'text-indigo-650 dark:text-indigo-400' :
                    isReady ? 'text-emerald-650 dark:text-emerald-400' :
                    isCleaning ? 'text-amber-600 dark:text-amber-455' :
                    'text-rose-600 dark:text-rose-400'
                  }`}>
                    {room.number}
                  </span>
                  
                  <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded ${
                    isOccupied ? 'bg-indigo-50 text-indigo-655 dark:bg-indigo-950/30' :
                    isReady ? 'bg-emerald-50 text-emerald-655 dark:bg-emerald-950/20' :
                    isCleaning ? 'bg-amber-50 text-amber-650 dark:bg-amber-950/20' :
                    'bg-rose-50 text-rose-650 dark:bg-rose-950/20'
                  }`}>
                    {room.status === 'ready' ? 'READY' :
                     room.status === 'occupied' ? 'OCCUPIED' :
                     room.status === 'cleaning' ? 'CLEANING' : 'MAINTENANCE'}
                  </span>
                </div>

                {/* Room type subtext */}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {room.type}
                </span>

                {/* Conditional information matching Screenshot 2 */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 w-full text-xs font-semibold">
                  {isOccupied && (
                    <div className="space-y-1">
                      <p className="text-slate-850 dark:text-white truncate font-extrabold">{room.guestName}</p>
                      <p className="text-[10px] text-slate-400">Trả phòng: 12:00</p>
                    </div>
                  )}

                  {isReady && (
                    <div className="space-y-1">
                      <p className="text-slate-400 font-bold">Trống</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCheckInRoom(room); }}
                        className="text-[10px] font-extrabold text-indigo-650 hover:underline flex items-center gap-1"
                      >
                        <LogIn className="h-3 w-3" /> Check-in
                      </button>
                    </div>
                  )}

                  {isCleaning && (
                    <div className="space-y-1">
                      <p className="text-slate-850 dark:text-white font-extrabold">{room.cleaningStaff}</p>
                      <p className="text-[10px] text-amber-600 font-bold">Dự kiến xong: {room.cleaningTime}</p>
                    </div>
                  )}

                  {isMaintenance && (
                    <div className="space-y-1">
                      <p className="text-rose-600 font-extrabold">{room.maintenanceIssue}</p>
                      <p className="text-[10px] text-slate-400">Bắt đầu: {room.maintenanceTime}</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Custom Check-in Modal */}
      {checkInRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setCheckInRoom(null); setGuestInputName(''); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Gán khách lưu trú (Check-in nhanh)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thực hiện nhận phòng cho **Phòng {checkInRoom.number}** ({checkInRoom.type}).
              </p>
            </div>

            <form onSubmit={executeCheckIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Họ tên khách hàng *
                </label>
                <input
                  type="text"
                  value={guestInputName}
                  onChange={(e) => setGuestInputName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-105 focus:border-indigo-650 focus:outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCheckInRoom(null); setGuestInputName(''); }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 h-11 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Xác nhận Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
