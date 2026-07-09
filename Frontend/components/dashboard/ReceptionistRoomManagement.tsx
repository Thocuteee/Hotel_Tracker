"use client"

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  LogIn,
  LogOut,
  User,
  Loader2,
  X,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  Printer,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ScanLine
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

const PREDEFINED_SERVICES = [
  { name: 'Nước suối Aquafina', price: 15000 },
  { name: 'Giặt là (Laundry)', price: 50000 },
  { name: 'Snack khoai tây', price: 25000 },
  { name: 'Dịch vụ Spa / Massage', price: 350000 },
  { name: 'Nước ngọt Coca-Cola', price: 20000 },
  { name: 'Mì ly ăn liền', price: 20000 }
];

export default function ReceptionistRoomManagement() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  // Tabs: 'rooms' or 'bookings'
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');

  // simulated Bookings State
  const [simulatedBookings, setSimulatedBookings] = useState<SimulatedBooking[]>([]);

  // dialog and search states for assigning rooms
  const [assigningBooking, setAssigningBooking] = useState<SimulatedBooking | null>(null);
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  // Checkin CCCD states
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [guestInputName, setGuestInputName] = useState('');
  const [guestInputPhone, setGuestInputPhone] = useState('');
  const [guestInputCCCD, setGuestInputCCCD] = useState('');
  const [scanningCCCD, setScanningCCCD] = useState(false);

  // Checkout states
  const [checkoutRoom, setCheckoutRoom] = useState<Room | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<{ id: string; serviceName: string; price: number; quantity: number }[]>([]);
  const [isInvoicePrinted, setIsInvoicePrinted] = useState(false);

  // Late webhook overbooking alert states
  const [overbookingAlert, setOverbookingAlert] = useState<SimulatedBooking | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    fetchRooms();
    loadSimulatedBookings();

    // Listen to simulated booking updates or overbooking events
    const interval = setInterval(() => {
      loadSimulatedBookings();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Listen to tab query parameter changes from sidebar
  const urlTab = searchParams ? searchParams.get('tab') : null;
  useEffect(() => {
    const hasBookingsKeyword = typeof window !== 'undefined' && window.location.href.includes('bookings');
    if (urlTab === 'bookings' || hasBookingsKeyword) {
      setActiveTab('bookings');
    } else {
      setActiveTab('rooms');
    }
  }, [urlTab]);

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
        osc.frequency.value = 800; // Hz
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else {
        // Alarm sound
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
    let data = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
    if (data.length === 0) {
      data = [
        {
          id: "BK-99210",
          roomTypeName: "Luxury Ocean View Room",
          guestName: "Trần Anh Tuấn",
          guestPhone: "0905123456",
          guestEmail: "tuan.tran@gmail.com",
          checkIn: "15/07/2026",
          checkOut: "17/07/2026",
          totalPrice: "6.270.000 đ",
          status: "PENDING",
          paymentMethod: "MOMO"
        },
        {
          id: "BK-99209",
          roomTypeName: "Standard Suite Garden View",
          guestName: "Lê Mỹ Linh",
          guestPhone: "0912987654",
          guestEmail: "linh.le@yahoo.com",
          checkIn: "18/07/2026",
          checkOut: "20/07/2026",
          totalPrice: "3.520.000 đ",
          status: "CONFIRMED",
          paymentMethod: "VNPAY",
          assignedRoomNumber: "122"
        }
      ];
      localStorage.setItem('simulated_bookings', JSON.stringify(data));
    }
    setSimulatedBookings(data);

    // Look for late payments (PENDING_LATE) that receptionist hasn't handled yet
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

  // CCCD Scanner simulator
  const handleScanCCCD = () => {
    setScanningCCCD(true);
    playAlertSound('beep');
    setTimeout(() => {
      setScanningCCCD(false);
      setGuestInputName('Nguyễn Tuấn Kiệt');
      setGuestInputPhone('0938555231');
      setGuestInputCCCD('038096007412');
      playAlertSound('beep');
      showToast('success', 'Quét CCCD thành công', 'Thông tin khách hàng đã được điền tự động.');
    }, 1500);
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
            cleaningStaff: newStatus === 'cleaning' ? 'Nhân viên dọn dẹp' : undefined,
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
      setGuestInputPhone('');
      setGuestInputCCCD('');
    }
  };

  const executeCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !guestInputName.trim()) return;
    handleUpdateStatus(checkInRoom, 'occupied', guestInputName.trim());
  };

  // Predefined service values and dynamic invoice logic
  const invoiceSubtotal = useMemo(() => {
    const servicesTotal = invoiceItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const roomCost = checkoutRoom ? (checkoutRoom.vip ? 5700000 : 3200000) : 0;
    return servicesTotal + roomCost;
  }, [invoiceItems, checkoutRoom]);

  const invoiceTax = useMemo(() => {
    return Math.round(invoiceSubtotal * 0.1);
  }, [invoiceSubtotal]);

  const invoiceGrandTotal = useMemo(() => {
    return invoiceSubtotal + invoiceTax;
  }, [invoiceSubtotal, invoiceTax]);

  const handleAddInvoiceItem = () => {
    const defaultService = PREDEFINED_SERVICES[0];
    const newItem = {
      id: Date.now().toString(),
      serviceName: defaultService.name,
      price: defaultService.price,
      quantity: 1
    };
    setInvoiceItems(prev => [...prev, newItem]);
  };

  const handleInvoiceItemChange = (itemId: string, field: 'serviceName' | 'quantity', value: any) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === itemId) {
        if (field === 'serviceName') {
          const selected = PREDEFINED_SERVICES.find(s => s.name === value);
          return {
            ...item,
            serviceName: value,
            price: selected ? selected.price : 0
          };
        } else {
          return {
            ...item,
            quantity: Math.max(1, Number(value))
          };
        }
      }
      return item;
    }));
  };

  const handleRemoveInvoiceItem = (itemId: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
  };

  const executeCheckOut = () => {
    if (!checkoutRoom) return;
    handleUpdateStatus(checkoutRoom, 'cleaning');
    setCheckoutRoom(null);
    setInvoiceItems([]);
    setIsInvoicePrinted(false);
  };

  // Search filter for room assignment Dialog
  const availableRoomsForType = useMemo(() => {
    if (!assigningBooking) return [];
    return rooms.filter(r =>
      r.status === 'ready' &&
      (roomSearchQuery.trim() === '' || r.number.includes(roomSearchQuery))
    );
  }, [rooms, assigningBooking, roomSearchQuery]);

  const handleAssignRoom = (room: Room) => {
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
    handleUpdateStatus(room, 'occupied', assigningBooking.guestName);
    setAssigningBooking(null);
    setRoomSearchQuery('');
    showToast('success', 'Gán phòng thành công', `Đã duyệt đơn và xếp khách ${assigningBooking.guestName} vào phòng ${room.number}`);
  };

  // Handle overbooking room upgrade
  const handleApproveUpgrade = () => {
    if (!overbookingAlert) return;

    // Simulate upgrading booking to Penthouse and assign a clean room
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

    // Remove PENDING_LATE from local storage
    localStorage.setItem('simulated_bookings', JSON.stringify(updatedBookings.filter(b => b.status !== 'PENDING_LATE')));
    setSimulatedBookings(updatedBookings);
    handleUpdateStatus(upgradeRoom, 'occupied', overbookingAlert.guestName);
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

    // Save as canceled (representing Refunded)
    localStorage.setItem('simulated_bookings', JSON.stringify(updated.filter(b => b.status !== 'PENDING_LATE')));
    setSimulatedBookings(updated);
    setOverbookingAlert(null);
    showToast('info', 'Đã hủy và hoàn tiền', `Đã gửi lệnh Refund thành công cho khách hàng ${overbookingAlert.guestName}.`);
  };

  const filteredRooms = rooms.filter(room => {
    if (floorFilter !== 'all' && room.floor !== floorFilter) return false;
    if (typeFilter !== 'all' && room.type !== typeFilter) return false;
    return true;
  });

  const readyCount = rooms.filter(r => r.status === 'ready').length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const cleaningCount = rooms.filter(r => r.status === 'cleaning').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

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
              className="flex-1 md:flex-none h-10 px-4 bg-white text-red-650 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
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

      {/* Sơ đồ phòng layout */}
      {activeTab === 'rooms' ? (
        <>
          {/* Metric Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lượt đến (Sẵn sàng)</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{readyCount}</span>
                <span className="text-[10px] font-bold text-emerald-600">Phòng sẵn sàng check-in</span>
              </div>
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đang sử dụng</span>
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{occupiedCount}</span>
                <span className="text-[10px] font-bold text-slate-500">Phòng có khách lưu trú</span>
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
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${occupancyRate}%` }} />
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đang dọn dẹp</span>
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 block leading-none">{cleaningCount}</span>
                <span className="text-[10px] font-bold text-rose-500">Phòng đang làm vệ sinh</span>
              </div>
            </div>
          </div>

          {/* Filter Row and Floor Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-2">
            <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200/20 w-fit">
              {[
                { id: 'all', label: 'Tất cả tầng' },
                { id: 1, label: 'Tầng 1' },
                { id: 2, label: 'Tầng 2' },
                { id: 5, label: 'Tầng thượng' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFloorFilter(opt.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${floorFilter === opt.id
                      ? 'bg-white dark:bg-[#0B0F19] text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
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
              <span className="text-slate-600 dark:text-slate-400">Có khách</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Sẵn sàng</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Đang dọn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Bảo trì</span>
            </div>
          </div>

          {/* Sơ đồ phòng grid */}
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
                    className={`flex flex-col text-left p-4.5 rounded-2xl border bg-white dark:bg-[#0B0F19] transition-all relative cursor-pointer ${isOccupied ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-600/10' :
                        isReady ? 'border-emerald-500' :
                          isCleaning ? 'border-amber-500' :
                            'border-rose-500'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xl font-extrabold ${isOccupied ? 'text-indigo-600 dark:text-indigo-400' :
                          isReady ? 'text-emerald-600 dark:text-emerald-400' :
                            isCleaning ? 'text-amber-600 dark:text-amber-500' :
                              'text-rose-600 dark:text-rose-400'
                        }`}>
                        {room.number}
                      </span>

                      <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded ${isOccupied ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30' :
                          isReady ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                            isCleaning ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                              'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                        }`}>
                        {room.status === 'ready' ? 'READY' :
                          room.status === 'occupied' ? 'OCCUPIED' :
                            room.status === 'cleaning' ? 'CLEANING' : 'MAINTENANCE'}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {room.type}
                    </span>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full text-xs font-semibold">
                      {isOccupied && (
                        <div className="space-y-2">
                          <p className="text-slate-800 dark:text-white truncate font-extrabold">{room.guestName}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCheckoutRoom(room); }}
                            className="w-full h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-red-600 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer text-[10px]"
                          >
                            <LogOut className="h-3.5 w-3.5" /> Check-out
                          </button>
                        </div>
                      )}

                      {isReady && (
                        <div className="space-y-1">
                          <p className="text-slate-450 font-bold">Trống</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCheckInRoom(room); }}
                            className="text-[10px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <LogIn className="h-3 w-3" /> Check-in
                          </button>
                        </div>
                      )}

                      {isCleaning && (
                        <div className="space-y-1">
                          <p className="text-slate-800 dark:text-white font-extrabold">{room.cleaningStaff || 'Lao công'}</p>
                          <p className="text-[10px] text-amber-600 font-bold">Dự kiến xong: {room.cleaningTime || '17:00'}</p>
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
        </>
      ) : (
        /* DUYỆT ĐẶT PHÒNG TAB */
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Danh sách yêu cầu đặt phòng (Simulated)</h2>
            <span className="text-xs text-slate-400">Realtime synced via localStorage</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-250/20 text-slate-450 uppercase tracking-wider text-[10px] font-extrabold">
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
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-medium">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{b.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{b.guestName}</div>
                      <div className="text-[10px] text-slate-450 mt-0.5">{b.guestPhone}</div>
                    </td>
                    <td className="py-4 px-4">{b.roomTypeName}</td>
                    <td className="py-4 px-4">{b.checkIn} - {b.checkOut}</td>
                    <td className="py-4 px-4 font-bold text-indigo-650 dark:text-indigo-400">{b.totalPrice}</td>
                    <td className="py-4 px-4 uppercase font-bold text-slate-500">{b.paymentMethod}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
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
                            className="h-8 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Nâng hạng
                          </button>
                          <button
                            onClick={() => { setOverbookingAlert(b); handleRejectLateBooking(); }}
                            className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
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
                    <td colSpan={8} className="text-center py-12 text-slate-450">
                      Chưa có đơn đặt phòng nào trên hệ thống. Khách hàng có thể chuyển sang trang Checkout để bắt đầu đặt phòng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHECK-IN CCCD SCAN MODAL */}
      {checkInRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setCheckInRoom(null); setGuestInputName(''); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Duyệt Check-in
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thực hiện nhận phòng cho **Phòng {checkInRoom.number}** ({checkInRoom.type}).
              </p>
            </div>

            {/* Simulated CCCD Scanner UI */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Giả lập máy quét CCCD / Hộ chiếu</p>
                <p className="text-[10px] text-slate-400">Đặt căn cước công dân vào khay quét</p>
              </div>
              <button
                type="button"
                onClick={handleScanCCCD}
                disabled={scanningCCCD}
                className="h-10 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {scanningCCCD ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Quét...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" /> Quét nhanh
                  </>
                )}
              </button>
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
                  placeholder="Nhập thủ công hoặc quét CCCD"
                  className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={guestInputPhone}
                    onChange={(e) => setGuestInputPhone(e.target.value)}
                    placeholder="09xxx..."
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Số CCCD / Passport
                  </label>
                  <input
                    type="text"
                    value={guestInputCCCD}
                    onChange={(e) => setGuestInputCCCD(e.target.value)}
                    placeholder="0380..."
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors"
                  />
                </div>
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
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-1.5"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Xác nhận Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC CHECK-OUT & INVOICE GENERATOR MODAL */}
      {checkoutRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setCheckoutRoom(null); setInvoiceItems([]); setIsInvoicePrinted(false); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="h-5 w-5 text-indigo-500" />
                Hóa đơn Check-out & Thanh toán Phụ thu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thanh toán tổng chi phí và kết thúc kỳ nghỉ phòng **{checkoutRoom.number}** ({checkoutRoom.type}).
              </p>
            </div>

            {/* Realtime calculation spreadsheet */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">Danh sách chi phí dịch vụ</h3>
                <button
                  type="button"
                  onClick={handleAddInvoiceItem}
                  className="h-8 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm phụ thu
                </button>
              </div>

              {/* Dynamic spreadsheet items grid */}
              <div className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900/50 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                      <th className="py-3 px-4">Dịch vụ phụ thu</th>
                      <th className="py-3 px-4 w-28">Đơn giá</th>
                      <th className="py-3 px-4 w-24">Số lượng</th>
                      <th className="py-3 px-4 w-28">Thành tiền</th>
                      <th className="py-3 px-4 text-right w-12">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850">
                    {/* Fixed Room Charge */}
                    <tr className="bg-white dark:bg-transparent">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        Tiền phòng ({checkoutRoom.vip ? 'V.I.P Room' : 'Standard Room'}) - 2 Đêm
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {checkoutRoom.vip ? '2.850.000 đ' : '1.600.000 đ'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">1</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {checkoutRoom.vip ? '5.700.000 đ' : '3.200.000 đ'}
                      </td>
                      <td className="py-3.5 px-4 text-right"></td>
                    </tr>

                    {/* Dynamic line items */}
                    {invoiceItems.map((item) => (
                      <tr key={item.id} className="bg-white dark:bg-transparent">
                        <td className="py-2.5 px-4">
                          <select
                            value={item.serviceName}
                            onChange={(e) => handleInvoiceItemChange(item.id, 'serviceName', e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 text-xs font-bold text-slate-650 focus:outline-none w-full cursor-pointer"
                          >
                            {PREDEFINED_SERVICES.map(s => (
                              <option key={s.name} value={s.name}>{s.name} ({s.price.toLocaleString('vi-VN')}đ)</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4 font-bold">
                          {item.price.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 text-xs font-bold text-slate-800 dark:text-white w-16 text-center"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-extrabold text-slate-900 dark:text-white">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveInvoiceItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {invoiceItems.length === 0 && (
                      <tr className="bg-slate-50/20 dark:bg-transparent">
                        <td colSpan={5} className="py-3 px-4 text-center text-slate-450 italic text-[10px]">
                          Chưa có phụ thu dịch vụ (Mini-bar, Giặt là...). Nhấn "Thêm phụ thu" để điền.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total display with live calculations */}
              <div className="w-full md:w-80 ml-auto bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-2.5 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Cộng phụ thu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{invoiceSubtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Thuế GTGT / Phí dịch vụ (10%):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{invoiceTax.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold border-t border-slate-200 dark:border-slate-850 pt-2.5 text-slate-900 dark:text-white">
                  <span>Tổng cộng thanh toán:</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{invoiceGrandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Print layout section */}
            {isInvoicePrinted && (
              <div className="p-6 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4 text-slate-900 dark:text-slate-300 font-mono text-[10px] text-left leading-relaxed relative bg-amber-50/5 border-dashed">
                <div className="absolute right-4 top-4 bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded text-[8px]">MẪU PHIẾU IN</div>
                <p className="text-center font-bold text-xs">HOTEL TRACKER RECEIPT</p>
                <p className="text-center">Số hóa đơn: INV-{(100000 + Math.floor(Math.random() * 900000))}</p>
                <p className="text-center">--------------------------------------------------</p>
                <p>Khách hàng: {checkoutRoom.guestName}</p>
                <p>Phòng: {checkoutRoom.number} ({checkoutRoom.type})</p>
                <p>Ngày Check-in: 15/07/2026  - Check-out: 17/07/2026</p>
                <p className="text-center">--------------------------------------------------</p>
                <p className="font-bold">DANH MỤC THANH TOÁN:</p>
                <p>1. Tiền phòng (2 đêm): ............... {checkoutRoom.vip ? '5.700.000 đ' : '3.200.000 đ'}</p>
                {invoiceItems.map((item, idx) => (
                  <p key={item.id}>{idx + 2}. {item.serviceName} (SL: {item.quantity}): ............... {(item.price * item.quantity).toLocaleString('vi-VN')} đ</p>
                ))}
                <p className="text-center">--------------------------------------------------</p>
                <p className="font-bold">TỔNG CỘNG THANH TOÁN: {invoiceGrandTotal.toLocaleString('vi-VN')} đ (Đã bao gồm 10% VAT)</p>
                <p className="text-center mt-3 text-[8px]">CẢM ƠN QUÝ KHÁCH HẸN GẶP LẠI!</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsInvoicePrinted(true)}
                className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-350 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="h-4 w-4" /> In hóa đơn tạm
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setCheckoutRoom(null); setInvoiceItems([]); setIsInvoicePrinted(false); }}
                  className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={executeCheckOut}
                  className="h-11 px-5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  Xác nhận Check-out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCHABLE ASSIGN ROOM DIALOG */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <button
              onClick={() => { setAssigningBooking(null); setRoomSearchQuery(''); }}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">Phòng {room.number}</span>
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
                className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
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
