"use client"

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Heart, ArrowLeft, ShieldCheck, Compass, Info, CheckCircle, Image, Sparkles } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

function HotelDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    checkInParam ? new Date(checkInParam) : new Date()
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    checkOutParam ? new Date(checkOutParam) : new Date(Date.now() + 86400000)
  );

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      const checkInStr = checkIn ? format(checkIn, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      const checkOutStr = checkOut ? format(checkOut, 'yyyy-MM-dd') : format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
      
      setLoading(true);
      api.get(`/api/v1/public/hotels/${params.id}?checkInDate=${checkInStr}&checkOutDate=${checkOutStr}`)
        .then(res => {
          setHotel(res.data);
        })
        .catch(err => {
          console.error("Error loading hotel details", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [params.id, checkIn, checkOut]);

  if (loading && !hotel) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-slate-500 font-medium">Đang tải thông tin chỗ nghỉ...</p></div></div>;
  if (!hotel) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Không tìm thấy chỗ nghỉ</div>;

  const handleBook = (roomId: string | number) => {
    let url = `/checkout?roomTypeId=${roomId}`;
    if (checkIn) url += `&checkIn=${format(checkIn, 'yyyy-MM-dd')}`;
    if (checkOut) url += `&checkOut=${format(checkOut, 'yyyy-MM-dd')}`;
    router.push(url);
  };

  const tabs = [
    { id: 'gallery', label: 'Hình ảnh' },
    { id: 'overview', label: 'Tổng quan' },
    { id: 'amenities', label: 'Tiện nghi' },
    { id: 'services', label: 'Dịch vụ có phí' },
    { id: 'policies', label: 'Chính sách' },
    { id: 'map', label: 'Bản đồ' },
    { id: 'reviews', label: 'Đánh giá' },
    { id: 'rooms', label: 'Hạng phòng' },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-24 scroll-smooth">
      {/* Header Image / Gallery Grid */}
      <div id="gallery" className="relative w-full bg-slate-900 overflow-hidden">
        {hotel.galleryImages && hotel.galleryImages.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[450px] md:h-[550px]">
            {/* Main image */}
            <div className="md:col-span-2 relative h-full">
              <img src={hotel.galleryImages[0] || hotel.imageUrl} className="w-full h-full object-cover animate-in fade-in" alt={hotel.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            </div>
            {/* Sub images */}
            <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
              {hotel.galleryImages.slice(1, 5).map((imgUrl: string, idx: number) => (
                <div key={idx} className="relative h-full overflow-hidden">
                  <img src={imgUrl} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt={`Hotel sub ${idx}`} />
                  {idx === 3 && hotel.galleryImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-black select-none">
                      +{hotel.galleryImages.length - 5} ảnh
                    </div>
                  )}
                </div>
              ))}
              {hotel.galleryImages.length < 5 && Array.from({ length: 5 - hotel.galleryImages.length }).map((_, idx) => (
                <div key={idx} className="bg-slate-800 flex items-center justify-center text-slate-600">
                  <Image className="h-8 w-8 opacity-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[400px] md:h-[500px] relative">
            <img src={hotel.imageUrl || "https://images.unsplash.com/photo-1542314831-c6a4d14272de?q=80&w=1000&auto=format&fit=crop"} alt={hotel.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
          </div>
        )}
        
        <button onClick={() => router.back()} className="absolute top-6 left-6 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all z-10">
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-8 left-6 md:left-12 max-w-3xl z-10">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white">{hotel.name}</h1>
            {hotel.starRating && (
              <div className="flex text-amber-400 text-sm mt-2">
                {'★'.repeat(hotel.starRating)}
              </div>
            )}
          </div>
          <div className="flex items-center text-slate-200 gap-2">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{hotel.address}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="sticky top-[64px] z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`text-sm font-bold pb-1 transition-all whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Overview Section */}
          <section id="overview" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600" /> Tổng quan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {hotel.description || "Khách sạn chưa cập nhật mô tả chi tiết."}
            </p>
          </section>

          {/* Amenities Section */}
          <section id="amenities" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-600" /> Tiện nghi & Dịch vụ nổi bật
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hotel.amenities && hotel.amenities.length > 0 ? (
                hotel.amenities.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm col-span-full">Các dịch vụ đang được cập nhật thêm.</p>
              )}
            </div>
          </section>

          {/* Paid Services Section */}
          <section id="services" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" /> Dịch vụ bổ sung (Có thu phí)
            </h2>
            <p className="text-xs text-slate-500">Khách hàng có thể đặt thêm các dịch vụ này trực tiếp trong quá trình lưu trú</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotel.services && hotel.services.length > 0 ? (
                hotel.services.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="h-14 w-14 rounded-xl object-cover shrink-0" alt={item.name} />
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 shrink-0">
                        <Sparkles className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">{item.name}</span>
                      <p className="text-xs text-slate-500 truncate">{item.description || "Dịch vụ chất lượng cao"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm col-span-full">Chưa có dịch vụ tính phí bổ sung nào được cấu hình.</p>
              )}
            </div>
          </section>

          {/* Policies Section */}
          <section id="policies" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Quy định & Chính sách chung
            </h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Nhận phòng (Check-in)</span>
                  <span>Từ {hotel.checkInTime || "14:00"}</span>
                </div>
                <div>
                  <span className="font-bold block text-slate-900 dark:text-white">Trả phòng (Check-out)</span>
                  <span>Trước {hotel.checkOutTime || "12:00"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="font-bold block text-slate-900 dark:text-white">Chính sách trẻ em và vật nuôi</span>
                <p>Khách hàng vui lòng liên hệ hotline bộ phận CSKH {hotel.phone || ""} hoặc gửi thư qua hòm thư điện tử {hotel.email || ""} để biết thêm chính sách chi tiết.</p>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section id="map" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600" /> Vị trí chỗ nghỉ
            </h2>
            {hotel.latitude && hotel.longitude ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tọa độ địa chỉ</span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vĩ độ: {hotel.latitude} | Kinh độ: {hotel.longitude}</p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all hover:border-rose-500/30 group"
                  >
                    <MapPin className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                    Chỉ đường bằng Google Maps
                  </a>
                </div>
                
                <div className="h-80 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=16&output=embed`}
                    className="w-full h-full border-none"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-2xl bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-800">
                Chưa có tọa độ vị trí thực tế của khách sạn.
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-indigo-600" /> Đánh giá của khách hàng
              </h2>
              {hotel.reviewScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {hotel.reviewScore >= 9 ? 'Tuyệt hảo' : hotel.reviewScore >= 8 ? 'Rất tốt' : 'Tốt'}
                  </span>
                  <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                    {hotel.reviewScore}
                  </span>
                </div>
              )}
            </div>
            {hotel.reviewScore === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                Chưa có đánh giá nào cho chỗ nghỉ này.
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                Các lượt đánh giá thực tế từ khách hàng đã đặt phòng qua hệ thống.
              </div>
            )}
          </section>

          {/* Room Types Section */}
          <section id="rooms" className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Danh sách hạng phòng còn trống
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                hotel.roomTypes.map((room: any) => {
                  const firstImage = room.images ? JSON.parse(room.images)[0] : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600&auto=format&fit=crop";
                  const isAvailable = room.availableRoomCount && room.availableRoomCount > 0;

                  return (
                    <Card key={room.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full">
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={firstImage} alt={room.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-slate-700 hover:text-rose-600 transition-colors">
                          <Heart className="h-4 w-4 fill-transparent" />
                        </button>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">
                            {room.name}
                          </h3>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Diện tích: {room.size || '30m²'} | Sức chứa: {room.capacity} người lớn
                          </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mỗi đêm từ</span>
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              {room.price.toLocaleString('vi-VN')} VND
                            </span>
                          </div>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg">
                            Còn {room.availableRoomCount} phòng
                          </span>
                        </div>

                        <button
                          onClick={() => handleBook(room.id)}
                          disabled={!isAvailable}
                          className={`w-full rounded-xl py-3 text-xs font-bold transition-all shadow-sm ${
                            isAvailable
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] cursor-pointer'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isAvailable ? 'Chọn phòng' : 'Hết phòng'}
                        </button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                  Không có phòng trống nào khả dụng trong ngày được chọn.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Sidebar/Checkout dates selection */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-[136px] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Đặt chỗ nghỉ của bạn</h3>
            <div className="space-y-3">
              <DatePicker date={checkIn} setDate={setCheckIn} label="Ngày nhận phòng" />
              <DatePicker date={checkOut} setDate={setCheckOut} label="Ngày trả phòng" />
            </div>
            <button 
              onClick={() => scrollToSection('rooms')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
            >
              Kiểm tra phòng trống
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function HotelDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
      <HotelDetailPageContent />
    </Suspense>
  );
}
