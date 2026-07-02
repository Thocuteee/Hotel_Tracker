"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ShieldAlert, BadgeCent, MapPin, Building, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  roomName: string;
  image: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELED';
  guests: number;
}

const mockBookings: Booking[] = [
  {
    id: "BK-88402",
    roomName: "Luxury Ocean View Room",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2064&auto=format&fit=crop",
    checkIn: "10/07/2026",
    checkOut: "12/07/2026",
    totalPrice: "5,700,000 đ",
    status: "CONFIRMED",
    guests: 2
  },
  {
    id: "BK-88401",
    roomName: "Standard Suite Garden View",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025&auto=format&fit=crop",
    checkIn: "01/06/2026",
    checkOut: "03/06/2026",
    totalPrice: "3,200,000 đ",
    status: "CONFIRMED",
    guests: 1
  }
];

export default function BookingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  const handleCancelBooking = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt phòng này?")) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELED' } : b));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quay về Trang chủ
      </Link>

      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Đơn đặt phòng của tôi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi thông tin và trạng thái thanh toán phòng khách sạn của bạn.</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div 
            key={booking.id}
            className="flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Room Image */}
            <div className="relative w-full md:w-[260px] h-[180px] md:h-auto overflow-hidden bg-slate-100">
              <img 
                src={booking.image} 
                alt={booking.roomName} 
                className="h-full w-full object-cover" 
              />
              <span className="absolute top-4 left-4 inline-flex items-center rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white">
                {booking.id}
              </span>
            </div>

            {/* Content info */}
            <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    booking.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                    booking.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                     booking.status === 'PENDING' ? 'Chờ xác nhận' :
                     'Đã hủy'}
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{booking.totalPrice}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{booking.roomName}</h3>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Nhận phòng: <strong>{booking.checkIn}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Trả phòng: <strong>{booking.checkOut}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-slate-400" />
                    <span>Mức phòng: Standard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-slate-400" />
                    <span>Số lượng: {booking.guests} Khách</span>
                  </div>
                </div>
              </div>

              {booking.status !== 'CANCELED' && (
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-500 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                  >
                    Hủy đặt phòng
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Bạn chưa có đơn đặt phòng nào.</p>
            <Link href="/" className="inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-500">
              Đặt phòng ngay bây giờ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
