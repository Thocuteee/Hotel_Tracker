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
  X
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
          guestName = r.roomNumber === '201' ? 'Ms. Kim Thu (VIP)' : 'Mr. Le Hoang (3 nốt)';
        }

        const history = [
          { event: frontendStatus === 'ready' ? 'Dọn phòng hoàn tất' : 'Thay đổi trạng thái phòng', time: 'Hôm nay' }
        ];
        if (frontendStatus === 'occupied') {
          history.unshift({ event: `Check-in: ${guestName || 'Khách lưu trú'}`, time: 'Vừa xong' });
        }

        return {
          id: String(r.id),
          number: r.roomNumber,
          type: r.roomType?.name || 'Standard Suite',
          floor: r.floor,
          status: frontendStatus,
          guestName,
          vip: r.roomNumber === '201',
          roomTypeId: r.roomType?.id || 0,
          history
        };
      });

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

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const roomsByFloor = rooms.reduce((acc, room) => {
    if (floorFilter !== 'all' && room.floor !== floorFilter) return acc;
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sơ đồ trạng thái phòng trực quan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cập nhật thời gian thực tình trạng buồng phòng.
          </p>
        </div>
        
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Tất cả tầng' },
            { id: 1, label: 'Tầng 1' },
            { id: 2, label: 'Tầng 2' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFloorFilter(opt.id as any)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                floorFilter === opt.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <Filter className="h-3 w-3" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Sơ đồ phòng */}
        <div className="lg:col-span-8 space-y-8 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
          
          {Object.keys(roomsByFloor).length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">
              Không có phòng nào ở tầng đã chọn.
            </div>
          ) : (
            Object.keys(roomsByFloor).map((floorStr) => {
              const floor = Number(floorStr);
              return (
                <div key={floor} className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1 border-l-4 border-indigo-600">
                    Tầng {floor}
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {roomsByFloor[floor].map((room) => {
                      const isSelected = room.id === selectedRoomId;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 outline-none relative group cursor-pointer ${
                            isSelected 
                              ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-md bg-indigo-50/10 dark:bg-indigo-950/5' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-600/50 hover:shadow-sm'
                          }`}
                        >
                          {/* Upper row: Room num & Status Badge */}
                          <div className="flex items-center justify-between w-full mb-3">
                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                              {room.number}
                            </span>
                            
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                              room.status === 'ready' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                              room.status === 'occupied' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                              room.status === 'cleaning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {room.status === 'ready' ? 'Ready' :
                               room.status === 'occupied' ? 'Occupied' :
                               room.status === 'cleaning' ? 'Cleaning' : 'Maintenance'}
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            {room.type}
                          </span>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 w-full text-xs flex items-center gap-1.5">
                            {room.status === 'ready' && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Sẵn sàng đón khách
                              </span>
                            )}
                            {room.status === 'occupied' && (
                              <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1 truncate">
                                <User className="h-3.5 w-3.5 text-rose-500" />
                                {room.guestName || 'Khách hàng'}
                              </span>
                            )}
                            {room.status === 'cleaning' && (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Đang dọn dẹp
                              </span>
                            )}
                            {room.status === 'maintenance' && (
                              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                                <Wrench className="h-3.5 w-3.5" />
                                Bảo trì thiết bị
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Right Column: Thao tác & Chi tiết */}
        {selectedRoom && (
          <div className="lg:col-span-4 space-y-6">
            
            <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
              <div className="text-center space-y-1 py-4 border-b border-slate-100 dark:border-slate-800 relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-[#0B0F19]/50 flex items-center justify-center rounded-2xl z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                )}
                <span className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">{selectedRoom.number}</span>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{selectedRoom.type} • TẦNG {selectedRoom.floor}</p>
              </div>

              {/* Quick Actions Panel */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Thao tác nhanh</span>
                
                <button 
                  onClick={() => handleUpdateStatus(selectedRoom, 'ready')}
                  disabled={selectedRoom.status === 'ready' || updating}
                  className="w-full flex h-11 items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/5 text-emerald-600 dark:text-emerald-400 px-4 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span>Đánh dấu Sẵn sàng</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => handleUpdateStatus(selectedRoom, 'cleaning')}
                  disabled={selectedRoom.status === 'cleaning' || updating}
                  className="w-full flex h-11 items-center justify-between rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/10 dark:bg-amber-950/5 text-amber-600 dark:text-amber-400 px-4 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span>Yêu cầu Dọn phòng</span>
                  <Clock className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => handleUpdateStatus(selectedRoom, 'maintenance')}
                  disabled={selectedRoom.status === 'maintenance' || updating}
                  className="w-full flex h-11 items-center justify-between rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/5 text-rose-600 dark:text-rose-400 px-4 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span>Khóa bảo trì</span>
                  <Wrench className="h-4 w-4" />
                </button>

                <button 
                  onClick={() => setCheckInRoom(selectedRoom)}
                  disabled={selectedRoom.status === 'occupied' || updating}
                  className="w-full flex h-11 items-center justify-between rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/10 dark:bg-indigo-950/5 text-indigo-600 dark:text-indigo-400 px-4 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <span>Gán khách (Check-in)</span>
                  <LogIn className="h-4 w-4" />
                </button>
              </div>

              {/* Room History */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Lịch sử phòng</span>
                <div className="space-y-3">
                  {selectedRoom.history.map((hist, i) => (
                    <div key={i} className="flex gap-3 text-xs leading-relaxed items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hist.event}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500">{hist.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend / Chú thích */}
            <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Chú thích trạng thái</span>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-400">Sẵn sàng (Ready)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-400">Có khách (Occupied)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 dark:text-slate-400">Đang dọn (Cleaning)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Bảo trì (Maintenance)</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Custom Check-in Modal */}
      {checkInRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setCheckInRoom(null); setGuestInputName(''); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-605 transition-colors"
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
                  placeholder="Ví dụ: Mr. Nguyễn Văn A"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
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
