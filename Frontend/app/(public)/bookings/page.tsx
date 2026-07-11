"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, ShieldAlert, MapPin, Building, ArrowLeft, Info, 
  Clock, CreditCard, Sparkles, CheckCircle2, User, HelpCircle, X
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Booking {
  id: number;
  customer: any;
  roomType: any;
  room: any;
  assignedRoomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async (userId: number) => {
    try {
      const res = await api.get(`/api/v1/bookings/customer/${userId}`);
      // Sort bookings by creation date descending
      const sorted = res.data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookings(sorted);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đơn đặt phòng:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    const user = JSON.parse(userStr);

    // Load hotels first to resolve branch names
    api.get('/api/v1/branches')
      .then(res => {
        setBranches(res.data);
        return fetchBookings(user.id);
      })
      .then(() => setLoading(false))
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu đặt phòng này?")) return;
    setCancellingId(id);
    try {
      await api.patch(`/api/v1/bookings/${id}/status`, null, {
        params: { status: 'CANCELLED' }
      });
      alert("Hủy yêu cầu đặt phòng thành công!");
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        await fetchBookings(user.id);
      }
      
      if (selectedBooking?.id === id) {
        setSelectedBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Không thể hủy phòng lúc này. Vui lòng liên hệ hotline khách sạn.");
    } finally {
      setCancellingId(null);
    }
  };

  const getBranchName = (branchId: number) => {
    const found = branches.find(b => b.id === branchId);
    return found ? found.name : "Lumiere Hotel Resort";
  };

  const getBranchAddress = (branchId: number) => {
    const found = branches.find(b => b.id === branchId);
    return found ? found.address : "Khu vực trung tâm";
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Đã xác nhận</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Chờ thanh toán</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Đang lưu trú</span>;
      case 'CHECKED_OUT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Đã trả phòng</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Đã hủy</span>;
      default:
        return null;
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quay về Trang chủ
      </Link>

      <div className="space-y-1 border-b pb-6 border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Đơn đặt phòng của tôi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Theo dõi, quản lý đơn đặt phòng và hủy phòng trực tuyến an toàn.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {bookings.map((booking) => {
          const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
          return (
            <div 
              key={booking.id}
              className="flex flex-col md:flex-row bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Room Image Fallback */}
              <div className="relative w-full md:w-[280px] h-[190px] md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop" 
                  alt={booking.roomType?.name} 
                  className="h-full w-full object-cover" 
                />
                <span className="absolute top-4 left-4 inline-flex items-center rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  HT000{booking.id}
                </span>
              </div>

              {/* Info panel */}
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold">Ngày đặt: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</span>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">{getBranchName(booking.roomType?.branchId)}</h4>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{booking.roomType?.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {getBranchAddress(booking.roomType?.branchId)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Nhận phòng</span>
                      <strong className="text-slate-800 dark:text-slate-200">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Trả phòng</span>
                      <strong className="text-slate-800 dark:text-slate-200">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Số đêm</span>
                      <strong className="text-slate-800 dark:text-slate-200">{nights} đêm</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Phòng vật lý</span>
                      <strong className={`font-semibold ${booking.room?.roomNumber ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 font-normal'}`}>
                        {booking.room?.roomNumber ? `Phòng ${booking.room.roomNumber} (Tầng ${booking.room.floor})` : 'Chờ gán phòng'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Tổng thanh toán</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {booking.totalPrice?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        {cancellingId === booking.id ? 'Đang hủy...' : 'Hủy đơn'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {bookings.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-3xl space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
            <HelpCircle className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Quý khách chưa thực hiện đơn đặt phòng nào trên hệ thống.</p>
            <Link href="/" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all shadow-sm">
              Tìm phòng và đặt ngay
            </Link>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-850 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white">Chi tiết đơn đặt phòng</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Mã đơn: <strong className="text-slate-600 dark:text-slate-350">HT000{selectedBooking.id}</strong> | Đặt ngày: {new Date(selectedBooking.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300">
              
              {/* Hotel & Room Title */}
              <div className="space-y-1 bg-indigo-50/50 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100/40 dark:border-indigo-950/30">
                <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block">Chỗ nghỉ đã chọn</span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">{getBranchName(selectedBooking.roomType?.branchId)}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-indigo-650" /> {getBranchAddress(selectedBooking.roomType?.branchId)}</p>
                <div className="mt-3 pt-3 border-t border-indigo-100/60 dark:border-indigo-950/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400">Hạng phòng:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{selectedBooking.roomType?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Số phòng gán:</span>
                    <p className="font-black text-indigo-600 dark:text-indigo-400">
                      {selectedBooking.room?.roomNumber ? `Phòng ${selectedBooking.room.roomNumber} (Tầng ${selectedBooking.room.floor})` : 'Đang xử lý xếp phòng'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Tiến trình đặt phòng (Timeline)</h4>
                <div className="relative flex items-center justify-between pt-4 pb-2 px-6">
                  {/* Progress Line Background */}
                  <div className="absolute left-[10%] right-[10%] top-[26px] h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>
                  <div 
                    className="absolute top-[26px] left-[10%] h-0.5 bg-indigo-600 dark:bg-indigo-500 -z-10 transition-all duration-500"
                    style={{ 
                      width: selectedBooking.status === 'CANCELLED' ? '0%' :
                             selectedBooking.status === 'PENDING' ? '0%' :
                             selectedBooking.status === 'CONFIRMED' ? '33.33%' :
                             selectedBooking.status === 'CHECKED_IN' ? '66.66%' : '100%' 
                    }}
                  ></div>

                  {/* Step 1: Created */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow">✓</div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Đặt đơn</span>
                  </div>

                  {/* Step 2: Confirmed/Paid */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      (selectedBooking.status !== 'PENDING' && selectedBooking.status !== 'CANCELLED') 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-450'
                    }`}>
                      {(selectedBooking.status !== 'PENDING' && selectedBooking.status !== 'CANCELLED') ? '✓' : '2'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Thanh toán</span>
                  </div>

                  {/* Step 3: Checked In */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      (selectedBooking.status === 'CHECKED_IN' || selectedBooking.status === 'CHECKED_OUT') 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-450'
                    }`}>
                      {(selectedBooking.status === 'CHECKED_IN' || selectedBooking.status === 'CHECKED_OUT') ? '✓' : '3'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Check-in</span>
                  </div>

                  {/* Step 4: Checked Out */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedBooking.status === 'CHECKED_OUT' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-450'
                    }`}>
                      {selectedBooking.status === 'CHECKED_OUT' ? '✓' : '4'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">Check-out</span>
                  </div>
                </div>
                {selectedBooking.status === 'CANCELLED' && (
                  <p className="text-xs text-rose-500 font-medium text-center bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl border border-rose-100 dark:border-rose-950/30">Đơn đặt phòng này đã bị hủy bỏ và không thể tiến hành check-in.</p>
                )}
              </div>

              {/* Guest & Policy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Thông tin lưu trú</h4>
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <p className="text-xs flex items-center gap-2 text-slate-650 dark:text-slate-350"><User className="h-4 w-4 text-slate-400 shrink-0" /> Khách đặt: <strong>{selectedBooking.customer?.name} ({selectedBooking.customer?.phone})</strong></p>
                    <p className="text-xs flex items-center gap-2 text-slate-650 dark:text-slate-350"><Clock className="h-4 w-4 text-slate-400 shrink-0" /> Nhận phòng: <strong>{new Date(selectedBooking.checkInDate).toLocaleDateString('vi-VN')} (Từ 14:00)</strong></p>
                    <p className="text-xs flex items-center gap-2 text-slate-650 dark:text-slate-350"><Clock className="h-4 w-4 text-slate-400 shrink-0" /> Trả phòng: <strong>{new Date(selectedBooking.checkOutDate).toLocaleDateString('vi-VN')} (Trước 12:00)</strong></p>
                    <p className="text-xs flex items-center gap-2 text-slate-650 dark:text-slate-350"><Building className="h-4 w-4 text-slate-400 shrink-0" /> Sức chứa hạng: <strong>{selectedBooking.roomType?.capacity} Người lớn</strong></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Chính sách & Quy định phòng</h4>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-500 leading-relaxed">
                    <p>• Hút thuốc: {selectedBooking.roomType?.allowSmoking ? 'Cho phép hút thuốc' : 'Nghiêm cấm hút thuốc'}</p>
                    <p>• Thú cưng: {selectedBooking.roomType?.allowPets ? 'Được mang theo thú cưng' : 'Không mang theo vật nuôi'}</p>
                    <p>• Giường phụ: {selectedBooking.roomType?.extraBedAllowed ? 'Hỗ trợ kê thêm giường phụ' : 'Không hỗ trợ kê thêm giường phụ'}</p>
                    <p className="text-indigo-650 dark:text-indigo-400 font-semibold mt-1">Hủy đơn: {selectedBooking.roomType?.cancellationPolicy || 'Hủy miễn phí trước 24 giờ nhận phòng.'}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider">Phân tích hóa đơn chi tiết (Invoice)</h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-150 dark:border-slate-855 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600 dark:text-slate-350">
                    <span>Giá cơ bản hạng phòng (1 đêm):</span>
                    <span>{selectedBooking.roomType?.basePrice?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {selectedBooking.roomType?.discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-semibold">
                      <span>Khuyến mãi đặc biệt ({selectedBooking.roomType.discount}%):</span>
                      <span>-{((selectedBooking.roomType.basePrice * selectedBooking.roomType.discount) / 100).toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-650 dark:text-slate-350">
                    <span>Thời gian lưu trú ({calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)} đêm):</span>
                    <span>x {calculateNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-350 border-b pb-2">
                    <span>Thuế & Phí dịch vụ (10%):</span>
                    <span>+{((selectedBooking.totalPrice * 0.1) / 1.1).toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1">
                    <span className="text-slate-900 dark:text-white">Tổng tiền thanh toán thực tế:</span>
                    <span className="text-indigo-650 dark:text-indigo-400">{selectedBooking.totalPrice?.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/60 flex justify-between shrink-0 rounded-b-3xl">
              <div>
                {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
                  <button 
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    disabled={cancellingId === selectedBooking.id}
                    className="h-10 px-4 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                  >
                    {cancellingId === selectedBooking.id ? 'Đang xử lý...' : 'Hủy đơn đặt phòng này'}
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="h-10 px-6 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
