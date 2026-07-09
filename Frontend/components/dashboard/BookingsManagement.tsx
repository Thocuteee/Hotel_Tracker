"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  Loader2,
  X,
  Search,
  AlertTriangle,
  Sparkles,
  Printer,
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Trash2,
  LogIn
} from 'lucide-react';
import api from '@/lib/api';
import Toast, { ToastMessage } from '@/components/ui/Toast';

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'ready' | 'occupied' | 'cleaning' | 'maintenance';
  roomTypeId: number;
}

interface SimulatedBooking {
  id: string;
  roomTypeName: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED' | 'PENDING_LATE';
  paymentMethod: string;
  timePaid?: string;
  assignedRoomNumber?: string;
}

export default function BookingsManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [simulatedBookings, setSimulatedBookings] = useState<SimulatedBooking[]>([]);

  // Dialog and search states for assigning rooms
  const [assigningBooking, setAssigningBooking] = useState<SimulatedBooking | null>(null);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  // Late webhook overbooking alert states
  const [overbookingAlert, setOverbookingAlert] = useState<SimulatedBooking | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetchRooms();
    loadSimulatedBookings();

    const interval = setInterval(() => {
      loadSimulatedBookings();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Web Audio Alert sound helper
  const playAlertSound = (type: 'beep' | 'alarm') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      
      if (type === 'beep') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.frequency.value = 520;
        osc2.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.35);
        osc2.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("AudioContext failed", e);
    }
  };

  const loadSimulatedBookings = () => {
    const data = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
    setSimulatedBookings(data);

    // Look for late payments (PENDING_LATE)
    const lateBooking = data.find((b: any) => b.status === 'PENDING_LATE');
    if (lateBooking && (!overbookingAlert || overbookingAlert.id !== lateBooking.id)) {
      setOverbookingAlert(lateBooking);
      playAlertSound('alarm');
      showToast('error', 'Cảnh báo tranh chấp đặt phòng!', `Khách ${lateBooking.guestName} đã gửi thanh toán trễ hạn sau 15 phút.`);
    }
  };

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
      const mappedRooms = res.data.map((r: any) => ({
        id: String(r.id),
        number: r.roomNumber,
        type: r.roomType?.name || 'Deluxe Suite',
        floor: r.floor,
        status: r.status === 'AVAILABLE' ? 'ready' : r.status === 'OCCUPIED' ? 'occupied' : r.status === 'DIRTY' ? 'cleaning' : 'maintenance',
        roomTypeId: r.roomType?.id || 0
      }));
      setRooms(mappedRooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, roomNumber: string, roomTypeId: number, floor: number, guestName: string) => {
    try {
      await api.put(`/api/v1/rooms/${roomId}`, {
        roomNumber,
        roomTypeId,
        floor,
        status: 'OCCUPIED'
      });
    } catch (e) {
      console.error("Failed to update physical room status in database", e);
    }
  };

  // Search filter for room assignment Dialog
  const availableRoomsForType = useMemo(() => {
    if (!assigningBooking) return [];
    return rooms.filter(r => 
      r.status === 'ready' && 
      (roomSearchQuery.trim() === '' || r.number.includes(roomSearchQuery))
    );
  }, [rooms, assigningBooking, roomSearchQuery]);

  const handleAssignRoom = async (room: Room) => {
    if (!assigningBooking) return;
    
    // Assign room and mark booking as confirmed
    const updatedBookings = simulatedBookings.map(b => {
      if (b.id === assigningBooking.id) {
        return { ...b, status: 'CONFIRMED' as const, assignedRoomNumber: room.number };
      }
      return b;
    });

    localStorage.setItem('simulated_bookings', JSON.stringify(updatedBookings));
    setSimulatedBookings(updatedBookings);
    
    // Update the room state in DB
    await handleUpdateRoomStatus(room.id, room.number, room.roomTypeId, room.floor, assigningBooking.guestName);

    setAssigningBooking(null);
    setRoomSearchQuery('');
    showToast('success', 'Gán phòng thành công', `Đã duyệt đơn và xếp khách ${assigningBooking.guestName} vào phòng ${room.number}`);
  };

  const handleApproveUpgrade = async () => {
    if (!overbookingAlert) return;

    const pentRooms = rooms.filter(r => r.status === 'ready' && r.type.includes('Penthouse'));
    if (pentRooms.length === 0) {
      showToast('error', 'Hết phòng để nâng hạng', 'Hiện tại phòng Penthouse trống đã hết. Tiến hành hoàn tiền cho khách.');
      handleRejectLateBooking();
      return;
    }

    const upgradeRoom = pentRooms[0];

    const updatedBookings = simulatedBookings.map(b => {
      if (b.id === overbookingAlert.id) {
        return { 
          ...b, 
          status: 'CONFIRMED' as const, 
          roomTypeName: upgradeRoom.type,
          assignedRoomNumber: upgradeRoom.number 
        };
      }
      return b;
    });

    localStorage.setItem('simulated_bookings', JSON.stringify(updatedBookings.filter(b => b.status !== 'PENDING_LATE')));
    setSimulatedBookings(updatedBookings);

    // Update room status in DB
    await handleUpdateRoomStatus(upgradeRoom.id, upgradeRoom.number, upgradeRoom.roomTypeId, upgradeRoom.floor, overbookingAlert.guestName);

    setOverbookingAlert(null);
    showToast('success', 'Nâng hạng phòng thành công', `Đã nâng hạng lên phòng Penthouse số ${upgradeRoom.number} để đền bù cho khách.`);
  };

  const handleRejectLateBooking = () => {
    if (!overbookingAlert) return;

    const updated = simulatedBookings.map(b => {
      if (b.id === overbookingAlert.id) {
        return { ...b, status: 'CANCELED' as const };
      }
      return b;
    });

    localStorage.setItem('simulated_bookings', JSON.stringify(updated.filter(b => b.status !== 'PENDING_LATE')));
    setSimulatedBookings(updated);
    setOverbookingAlert(null);
    showToast('info', 'Đã hủy và hoàn tiền', `Đã gửi lệnh Refund thành công cho khách hàng ${overbookingAlert.guestName}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative pb-16">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Realtime Overbooking Warning Banner */}
      {overbookingAlert && (
        <div className="bg-red-500 text-white rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg animate-bounce duration-1000 border-2 border-white/20">
          <div className="flex items-center gap-3 text-left">
            <AlertTriangle className="h-8 w-8 animate-pulse shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Cảnh báo Overbooking (Tranh chấp phòng)</h3>
              <p className="text-xs text-red-100 mt-0.5">
                Khách **{overbookingAlert.guestName}** ({overbookingAlert.guestPhone}) đã trả tiền trễ ở phút thứ 16 sau khi hệ thống hủy tạm khóa. Hạng phòng **{overbookingAlert.roomTypeName}** hiện tại đã hết phòng trống!
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleApproveUpgrade}
              className="flex-1 md:flex-none h-10 px-4 bg-white text-red-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
            >
              Nâng hạng phòng (Upgrade)
            </button>
            <button
              onClick={handleRejectLateBooking}
              className="flex-1 md:flex-none h-10 px-4 bg-red-800/60 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all border border-red-700 cursor-pointer uppercase tracking-wider"
            >
              Hoàn tiền tự động (Refund)
            </button>
          </div>
        </div>
      )}

      {/* Bookings View Card */}
      <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-850">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Duyệt & Quản lý yêu cầu đặt phòng</h1>
          </div>
          <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/65 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800/80">
            Trạng thái: Realtime Synced
          </span>
        </div>

        {loading ? (
          <div className="flex h-[30vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-4 px-4">Mã Booking</th>
                  <th className="py-4 px-4">Khách hàng</th>
                  <th className="py-4 px-4">Hạng Phòng</th>
                  <th className="py-4 px-4">Khoảng thời gian</th>
                  <th className="py-4 px-4">Tổng Tiền</th>
                  <th className="py-4 px-4">Cổng thanh toán</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {simulatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-55/50 dark:hover:bg-slate-900/10 font-medium">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{b.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{b.guestName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{b.guestPhone}</div>
                    </td>
                    <td className="py-4 px-4">{b.roomTypeName}</td>
                    <td className="py-4 px-4">{b.checkIn} - {b.checkOut}</td>
                    <td className="py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400">{b.totalPrice}</td>
                    <td className="py-4 px-4 uppercase font-bold text-slate-500">{b.paymentMethod}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                        b.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                        b.status === 'PENDING_LATE' ? 'bg-red-50 text-red-500 dark:bg-red-950/20 animate-pulse' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {b.status === 'CONFIRMED' ? 'Đã xác nhận' :
                         b.status === 'PENDING' ? 'Đang chờ xử lý' :
                         b.status === 'PENDING_LATE' ? 'Thanh toán trễ' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => setAssigningBooking(b)}
                          className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Duyệt & Gán phòng
                        </button>
                      )}
                      {b.status === 'PENDING_LATE' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setOverbookingAlert(b); handleApproveUpgrade(); }}
                            className="h-8 px-2.5 bg-red-650 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Nâng hạng
                          </button>
                          <button
                            onClick={() => { setOverbookingAlert(b); handleRejectLateBooking(); }}
                            className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Hoàn tiền
                          </button>
                        </div>
                      )}
                      {b.status === 'CONFIRMED' && (
                        <span className="text-slate-400 text-[10px] font-bold">
                          Đã xếp phòng {b.assignedRoomNumber}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {simulatedBookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      Chưa có đơn đặt phòng nào trên hệ thống. Khách hàng có thể chuyển sang trang Checkout để bắt đầu đặt phòng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SEARCHABLE ASSIGN ROOM DIALOG */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button 
              onClick={() => { setAssigningBooking(null); setRoomSearchQuery(''); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Duyệt gán số phòng vật lý
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gán phòng trống thuộc hạng **{assigningBooking.roomTypeName}** cho khách **{assigningBooking.guestName}**.
              </p>
            </div>

            {/* Combobox style search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Gõ để tìm kiếm số phòng trống (ví dụ: 101, 202)..."
                value={roomSearchQuery}
                onChange={(e) => setRoomSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-indigo-650 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* List results */}
            <div className="flex-1 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-850 rounded-2xl p-3 bg-slate-50/20 max-h-[300px]">
              {availableRoomsForType.map(room => (
                <div
                  key={room.id}
                  onClick={() => handleAssignRoom(room)}
                  className="p-3 bg-white dark:bg-[#121824] border border-slate-150 dark:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-indigo-650 dark:text-indigo-400">Phòng {room.number}</span>
                    <span className="text-[10px] text-slate-400">Tầng {room.floor}</span>
                  </div>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 font-extrabold px-2 py-0.5 rounded uppercase">Sẵn sàng</span>
                </div>
              ))}

              {availableRoomsForType.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-[10px]">
                  Không tìm thấy phòng trống {roomSearchQuery ? `"${roomSearchQuery}"` : ""} phù hợp với hạng phòng {assigningBooking.roomTypeName}.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setAssigningBooking(null); setRoomSearchQuery(''); }}
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
