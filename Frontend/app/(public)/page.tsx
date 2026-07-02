"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Heart, Sparkles, ShieldCheck, Headphones, CircleDollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const destinations = [
  { name: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1589779261529-6a8c439f37c7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Hà Nội', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Đà Nẵng', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' },
  { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600&auto=format&fit=crop' },
  { name: 'Kyoto', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop' },
  { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop' },
];

const featuredRooms = [
  {
    id: "RM-011",
    name: "Azure Cliff Villa",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=600&auto=format&fit=crop",
    price: "$450",
    rating: 4.9,
    status: "AVAILABLE",
    badge: "CÒN PHÒNG",
    badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
  },
  {
    id: "RM-012",
    name: "Neo-Tokyo Loft",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop",
    price: "$210",
    rating: 4.8,
    status: "AVAILABLE",
    badge: "CÒN PHÒNG",
    badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
  },
  {
    id: "RM-013",
    name: "Jungle Sanctuary",
    location: "Ubud, Bali",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop",
    price: "$340",
    rating: 5.0,
    status: "LIMITED",
    badge: "CHỈ CÒN 1 PHÒNG",
    badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
  },
  {
    id: "RM-014",
    name: "Alpine Peak Suite",
    location: "Zermatt, Swiss",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=600&auto=format&fit=crop",
    price: "$520",
    rating: 4.7,
    status: "AVAILABLE",
    badge: "CÒN PHÒNG",
    badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
  }
];

export default function PublicLandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [guests, setGuests] = useState('2 khách, 1 phòng');
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleBook = (roomId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      alert('Đang chuyển hướng tới cổng thanh toán và xác nhận đặt phòng...');
      router.push('/bookings');
    }
  };

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Banner Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative w-full h-[580px] rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop"
            alt="Premium Hotel Pool"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px]" />
          
          <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 space-y-6 max-w-4xl mx-auto text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              Trải nghiệm kỳ nghỉ thượng lưu
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Tìm nơi dừng chân lý tưởng cho chuyến đi của bạn
            </h1>
            <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
              Hàng ngàn khách sạn & ưu đãi đặc biệt đang chờ đón bạn. Đặt phòng nhanh chóng chỉ trong 1 phút.
            </p>

            {/* Search Box Widget (Airbnb Style) */}
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between mt-8 animate-in slide-in-from-bottom-8 duration-500">
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="flex items-center gap-3 px-2 py-1 text-left">
                  <MapPin className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Địa điểm</label>
                    <input 
                      type="text" 
                      placeholder="Bạn muốn đi đâu?" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="text-xs font-bold bg-transparent border-none focus:outline-none placeholder-slate-400 p-0 h-5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 sm:pl-6 py-1 text-left">
                  <Calendar className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nhận - Trả phòng</label>
                    <input 
                      type="text" 
                      placeholder="01/07 - 03/07" 
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      className="text-xs font-bold bg-transparent border-none focus:outline-none placeholder-slate-400 p-0 h-5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 px-2 sm:pl-6 py-1 text-left">
                  <Users className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div className="flex flex-col w-full">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Khách & Phòng</label>
                    <input 
                      type="text" 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="text-xs font-bold bg-transparent border-none focus:outline-none placeholder-slate-400 p-0 h-5"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full lg:w-auto h-11 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-md text-xs uppercase tracking-wider shrink-0">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-row justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Khám phá thế giới</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Điểm đến phổ biến</h2>
          </div>
          <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wider">
            Xem thêm <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {destinations.map((dest, i) => (
            <div key={i} className="flex flex-col items-center space-y-3 group cursor-pointer">
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 group-hover:border-indigo-600 dark:group-hover:border-indigo-400 shadow-sm transition-all duration-300">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                {dest.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-row justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Đề xuất hàng đầu</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Phòng nghỉ cao cấp dành riêng cho bạn</h2>
          </div>
          <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-wider">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredRooms.map((room) => (
            <Card key={room.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-slate-700 hover:text-rose-600 transition-colors">
                  <Heart className="h-4 w-4 fill-transparent" />
                </button>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {room.location}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{room.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
                    {room.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Giá mỗi đêm</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">{room.price} <span className="text-[10px] text-slate-400 font-normal">/đêm</span></span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${room.badgeColor}`}>
                    {room.badge}
                  </span>
                </div>

                <button
                  onClick={() => handleBook(room.id)}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Đặt phòng ngay
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 3: Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-800 overflow-hidden shadow-xl flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 sm:p-12 space-y-6 text-white">
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-200 uppercase bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              Ưu đãi độc quyền
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Ưu đãi cuối tuần: Giảm đến 30%
            </h2>
            <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
              Đặt phòng ngay hôm nay cho chuyến đi cuối tuần này và nhận ngay mức giá ưu đãi đặc biệt dành riêng cho thành viên Lumiere Stay / Hotel Tracker.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => router.push('#rooms')}
                className="rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 py-3 text-xs transition-all active:scale-[0.98]"
              >
                Khám phá ngay
              </button>
              <button className="rounded-xl bg-transparent border border-white hover:bg-white/10 text-white font-semibold px-6 py-3 text-xs transition-all active:scale-[0.98]">
                Xem chi tiết
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-[45%] h-[320px] md:h-[400px] overflow-hidden bg-slate-800 relative">
            <img
              src="https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=800&auto=format&fit=crop"
              alt="Promo Luggage"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Giá trị cốt lõi</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tại sao chọn Lumiere Stay?</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uy tín hàng đầu</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Mọi phòng nghỉ đều được chúng tôi kiểm định nghiêm ngặt về chất lượng dịch vụ trước khi đưa đến bạn.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
              <Headphones className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hỗ trợ 24/7</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Đội ngũ digital concierge luôn sẵn lòng phục vụ bạn bất cứ lúc nào, giải quyết mọi yêu cầu phát sinh.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
              <CircleDollarSign className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Giá tốt nhất</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Cam kết mức giá cạnh tranh nhất thị trường cùng nhiều ưu đãi độc quyền dành riêng cho khách hàng thân thiết.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
