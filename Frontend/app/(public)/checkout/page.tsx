"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface RoomType {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  description: string;
  images: string;
  discount?: number;
}

const mockRoomTypes: RoomType[] = [
  {
    id: 1,
    name: "Luxury Ocean View Room",
    basePrice: 2850000,
    capacity: 2,
    description: "Phòng nghỉ sang trọng hướng biển tuyệt đẹp với ban công riêng.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop"])
  },
  {
    id: 2,
    name: "Standard Suite Garden View",
    basePrice: 1600000,
    capacity: 2,
    description: "Phòng Suite tiêu chuẩn hướng vườn yên tĩnh, thoáng mát.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop"])
  },
  {
    id: 3,
    name: "Lumiere Penthouse Room",
    basePrice: 12500000,
    capacity: 4,
    description: "Căn Penthouse thượng lưu rộng rãi bậc nhất với hồ bơi vô cực riêng.",
    images: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop"])
  }
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomTypeId = Number(searchParams.get('roomTypeId') || '1');
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  
  useEffect(() => {
    import('@/lib/api').then(({ default: api }) => {
      api.get(`/api/v1/room-types/${roomTypeId}`)
        .then(res => setRoomType(res.data))
        .catch(err => {
          console.error(err);
          // Fallback to mock if API fails for some reason
          setRoomType(mockRoomTypes.find(t => t.id === roomTypeId) || mockRoomTypes[0]);
        });
    });
  }, [roomTypeId]);

  // States
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'vnpay' | 'cash'>('momo');
  const [isEstablishingLock, setIsEstablishingLock] = useState(false);
  const [lockEstablished, setLockEstablished] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'OVERBOOKED'>('IDLE');
  const [lockKey, setLockKey] = useState<string | null>(null);
  
  // Custom timer speeds for demo purposes
  const [timerSpeed, setTimerSpeed] = useState(1); // multiplier

  // 15-minute Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setBookingStatus('EXPIRED');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - timerSpeed));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, timerSpeed]);

  // Radial progress calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(() => {
    return circumference - (timeLeft / 900) * circumference;
  }, [timeLeft, circumference]);

  const isCriticalTime = timeLeft <= 180; // 3 minutes

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate Lock & payment button
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Vui lòng điền họ tên và số điện thoại.');
      return;
    }
    
    if (!roomType) return;
    setIsEstablishingLock(true);
    
    try {
      const api = (await import('@/lib/api')).default;
      const res = await api.post('/api/v1/bookings/lock', {
        roomTypeId: roomType.id,
        checkInDate: "2026-07-15",
        checkOutDate: "2026-07-17"
      });
      setLockKey(res.data.lockKey);
      
      setIsEstablishingLock(false);
      if (paymentMethod === 'cash') {
        const createRes = await api.post('/api/v1/bookings', {
          roomTypeId: roomType.id,
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-17",
          numAdults: 2,
          numChildren: 0,
          specialRequests: guestName + " - " + guestPhone,
          customerId: 1 // Default customerId for demo
        }, { params: { lockKey: res.data.lockKey } });
        
        setBookingStatus('SUCCESS');
        setTimeout(() => {
          router.push('/bookings');
        }, 2500);
      } else {
        setLockEstablished(true);
        setBookingStatus('PENDING');
      }
    } catch (err: any) {
      setIsEstablishingLock(false);
      alert(err.response?.data?.message || 'Không thể giữ chỗ lúc này!');
    }
  };

  // Webhook Simulation Handlers
  const handleSimulateWebhook = async (type: 'ON_TIME' | 'LATE') => {
    if (!roomType) return;
    
    if (type === 'ON_TIME') {
      if (timeLeft <= 0) {
        alert('Không thể thanh toán đúng hạn vì khóa giữ chỗ đã hết hạn!');
        return;
      }
      try {
        const api = (await import('@/lib/api')).default;
        await api.post('/api/v1/bookings', {
          roomTypeId: roomType.id,
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-17",
          numAdults: 2,
          numChildren: 0,
          specialRequests: guestName + " - " + guestPhone,
          customerId: 1 // Default customerId for demo
        }, { params: { lockKey: lockKey } });
        
        setBookingStatus('SUCCESS');
        setTimeout(() => {
          router.push('/bookings');
        }, 2500);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Lỗi khi tạo booking');
      }
    } else {
      // LATE Webhook
      const newBooking = {
        id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
        roomTypeName: roomType.name,
        guestName,
        guestPhone,
        guestEmail,
        checkIn: "15/07/2026",
        checkOut: "17/07/2026",
        totalPrice: `${(roomType.basePrice * 2).toLocaleString('vi-VN')} đ`,
        status: 'PENDING_LATE', // Late payment status
        paymentMethod: paymentMethod.toUpperCase(),
        timePaid: new Date().toLocaleTimeString('vi-VN'),
        timestamp: Date.now()
      };

      const existing = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('simulated_bookings', JSON.stringify(existing));

      // Trigger a special custom storage event for the receptionist to hear immediately
      window.dispatchEvent(new CustomEvent('simulated_overbooking', { detail: newBooking }));

      setBookingStatus('OVERBOOKED');
    }
  };

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Back to Home */}
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors uppercase tracking-wider">
        <ArrowLeft className="h-4 w-4" /> Quay lại chọn phòng
      </Link>

      {!roomType ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Đặt phòng khách sạn</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hoàn thành thông tin thanh toán để giữ phòng.</p>
          </div>

          {/* Skeletons Loading View */}
          {isEstablishingLock ? (
            <div className="space-y-6 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl" />
                </div>
                <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl" />
              </div>
              <div className="h-24 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
              <div className="h-12 bg-indigo-200 dark:bg-indigo-950/30 rounded-xl" />
            </div>
          ) : lockEstablished ? (
            // Booking has been locked, waiting for payment webhook simulation
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-center py-10">
              {bookingStatus === 'PENDING' && (
                <>
                  <div className="h-16 w-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yêu cầu thanh toán đang chờ xử lý</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Phòng của bạn đang được khóa giữ chỗ trong 15 phút. Vui lòng quét mã QR thanh toán trên ứng dụng {paymentMethod === 'momo' ? 'Momo' : 'VNPay'} của bạn để hoàn tất giao dịch.
                  </p>
                  
                  {/* Fake QR Code */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 w-fit mx-auto shadow-inner">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=HotelTrackerPaymentSimulation-${roomType.name}`} 
                      alt="Mock QR Code"
                      className="rounded-xl dark:invert"
                    />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                    <Info className="h-4 w-4 text-indigo-500" />
                    Sử dụng Bảng điều khiển giả lập bên cạnh để gửi phản hồi thanh toán.
                  </div>
                </>
              )}

              {bookingStatus === 'SUCCESS' && (
                <div className="space-y-4 py-8 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {paymentMethod === 'cash' ? 'Đặt phòng thành công!' : 'Thanh toán thành công!'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {paymentMethod === 'cash'
                      ? 'Yêu cầu đặt phòng đã được ghi nhận. Quý khách vui lòng chuẩn bị tiền mặt thanh toán tại quầy khi check-in. Đang chuyển hướng...'
                      : 'Hệ thống đã nhận được webhook phản hồi. Giao dịch thành công trước thời hạn khóa. Đang chuyển hướng...'}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-650 animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang chuyển hướng...
                  </div>
                </div>
              )}

              {bookingStatus === 'OVERBOOKED' && (
                <div className="space-y-4 py-8 border-2 border-red-500/20 bg-red-500/5 dark:bg-red-950/10 rounded-2xl animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <AlertTriangle className="h-10 w-10" />
                  </div>
                  <h2 className="text-xl font-black text-red-655">Lỗi Thanh Toán Trễ (Hết hạn khóa)</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto px-6 leading-relaxed">
                    Webhook Momo/VNPay báo giao dịch **THÀNH CÔNG** ở phút thứ 16 (sau thời gian khóa 15 phút).
                  </p>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 max-w-md mx-auto text-left space-y-2 text-xs">
                    <p className="text-slate-800 dark:text-slate-200 font-bold">Kế hoạch giải quyết:</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      1. Một lệnh hoàn tiền tự động (**Refund API**) đã được kích hoạt gửi lại tài khoản của bạn.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      2. Đồng thời, một thông báo khẩn cấp được đẩy lên sảnh Lễ Tân để nhân viên sắp xếp **nâng hạng phòng miễn phí** đền bù cho bạn nếu bạn vẫn check-in.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Regular Form Details
            <form onSubmit={handleInitiatePayment} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Thông tin khách hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và Tên *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    placeholder="Ví dụ: 0987654321"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email (Nhận hóa đơn)</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Cổng thanh toán điện tử</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('momo')}
                    className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'momo' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="h-10 w-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-650 font-extrabold text-sm shrink-0">
                      Mo
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Ví MoMo</p>
                      <p className="text-[9px] text-slate-400">Thanh toán online</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'vnpay' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="h-10 w-10 bg-blue-105 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-sm shrink-0">
                      VN
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">VNPay</p>
                      <p className="text-[9px] text-slate-400">Ngân hàng điện tử</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'cash' 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-950/25 rounded-xl flex items-center justify-center text-emerald-600 font-extrabold text-sm shrink-0">
                      TM
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Tiền mặt</p>
                      <p className="text-[9px] text-slate-400">Thanh toán tại quầy</p>
                    </div>
                  </div>
                </div>
              </div>

              {bookingStatus === 'EXPIRED' ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 text-xs font-bold text-center">
                  Hết thời gian giữ chỗ! Vui lòng quay lại màn hình chọn phòng để lấy khóa mới.
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center"
                >
                  Xác nhận đặt phòng & Khóa giữ chỗ
                </button>
              )}
            </form>
          )}
        </div>

        {/* Right Column: Timer & Booking Invoice details */}
        <div className="space-y-6">
          
          {/* Circular Countdown Timer Card */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Thời gian giữ chỗ còn lại</span>
            
            {/* SVG Progress Circle */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90">
                {/* Background Ring */}
                <circle 
                  cx="56" 
                  cy="56" 
                  r={radius} 
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Ring */}
                <circle 
                  cx="56" 
                  cy="56" 
                  r={radius} 
                  className={`transition-all duration-1000 ${
                    isCriticalTime 
                      ? 'stroke-red-500 animate-pulse' 
                      : timeLeft <= 450 
                        ? 'stroke-amber-500' 
                        : 'stroke-indigo-600'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner text countdown */}
              <span className={`absolute text-base font-black tracking-tight ${
                isCriticalTime ? 'text-red-500 animate-ping-slow font-extrabold' : 'text-slate-800 dark:text-white'
              }`}>
                {timeLeft > 0 ? formatTime(timeLeft) : "00:00"}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldAlert className="h-4 w-4 text-slate-400 shrink-0" />
              Khóa tạm thời (Redis Lock) bảo vệ phòng khỏi Overbooking.
            </div>
            
            {/* Demo speed toggle */}
            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setTimerSpeed(1)}
                className={`px-2.5 py-1 text-[9px] font-bold rounded ${timerSpeed === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                1x Tốc độ
              </button>
              <button 
                type="button"
                onClick={() => setTimerSpeed(15)}
                className={`px-2.5 py-1 text-[9px] font-bold rounded ${timerSpeed === 15 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                15x Speed
              </button>
              <button 
                type="button"
                onClick={() => setTimeLeft(175)} // Jump directly to under 3 mins
                className="px-2.5 py-1 text-[9px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded"
              >
                &lt; 3 Phút
              </button>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tóm tắt đơn phòng</h3>
            
            <div className="flex gap-3">
              <div className="h-14 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {(() => {
                  let img = "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=200&auto=format&fit=crop";
                  try {
                    const parsed = JSON.parse(roomType.images);
                    if (parsed.length > 0) img = parsed[0];
                  } catch(e) {}
                  return <img src={img} alt={roomType.name} className="h-full w-full object-cover" />;
                })()}
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{roomType.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Tối đa {roomType.capacity} người lớn
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thời gian ở</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">2 Đêm (15/07 - 17/07)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Giá phòng (2 đêm)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{(roomType.basePrice * 2).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Thuế & Phí dịch vụ (10%)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{(roomType.basePrice * 2 * 0.1).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-900 dark:text-white">
                <span>Tổng số tiền</span>
                <span className="text-indigo-600 dark:text-indigo-400">{(roomType.basePrice * 2 * 1.1).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

        </div>

      </div>
      )}

      {/* Floating Interactive Webhook Simulation Control Panel */}
      {lockEstablished && (
        <div className="fixed bottom-6 left-6 z-40 w-80 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left space-y-4 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-indigo-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              Webhook Simulator
            </span>
            <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded uppercase">DEV MODE</span>
          </div>

          <p className="text-[10px] text-slate-450 leading-relaxed">
            Giả lập cổng thanh toán Momo/VNPay gọi Webhook phản hồi về hệ thống quản lý phòng (Backend):
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleSimulateWebhook('ON_TIME')}
              className="w-full h-10 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              🚀 Webhook thành công (Đúng hạn)
            </button>
            <button
              onClick={() => handleSimulateWebhook('LATE')}
              className="w-full h-10 bg-rose-650 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              ⚠️ Webhook trễ hạn (Phút 16+)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
