"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Users, Star, ArrowRight, Heart, Sparkles, ShieldCheck, Headphones, CircleDollarSign, CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { format } from 'date-fns';

const BranchLocatorMap = dynamic(() => import('@/components/BranchLocatorMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full rounded-3xl bg-slate-100 animate-pulse"></div>
});

interface RoomType {
  id: number;
  name: string;
  branchId: number;
  images: string;
  basePrice: number;
  discount: number;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  imageUrl: string;
}

const propertyTypes = [
  { name: 'Khách sạn', type: 'HOTEL', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop' },
  { name: 'Căn hộ', type: 'APARTMENT', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop' },
  { name: 'Resort', type: 'RESORT', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop' },
  { name: 'Biệt thự', type: 'VILLA', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop' },
  { name: 'Nhà gỗ', type: 'CABIN', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=600&auto=format&fit=crop' },
];

export default function PublicLandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [destination, setDestination] = useState('');
  
  // Real Date Picker state
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  
  const [guests, setGuests] = useState('2 người lớn · 0 trẻ em · 1 phòng');
  
  const [recommendedRooms, setRecommendedRooms] = useState<RoomType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    // Fetch branches for Trending Destinations
    api.get('/api/v1/branches')
      .then((res) => setBranches(res.data))
      .catch((err) => console.error("Failed to fetch branches", err));

    // Fetch recommended rooms
    api.get('/api/v1/public/recommended-rooms')
      .then((res) => setRecommendedRooms(res.data))
      .catch((err) => console.error("Failed to fetch recommended rooms", err));
  }, []);

  const handleBook = (roomId: string | number) => {
    let url = `/checkout?roomTypeId=${roomId}`;
    if (checkInDate) url += `&checkIn=${format(checkInDate, 'yyyy-MM-dd')}`;
    if (checkOutDate) url += `&checkOut=${format(checkOutDate, 'yyyy-MM-dd')}`;
    
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push(url);
    }
  };

  const handleSearch = () => {
    const checkInStr = checkInDate ? format(checkInDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const checkOutStr = checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
    let query = `/search?destination=${destination}&checkIn=${checkInStr}&checkOut=${checkOutStr}`;
    router.push(query);
  };

  const navigateToBranch = (branchId: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
    router.push(`/hotel/${branchId}?checkIn=${today}&checkOut=${tomorrow}`);
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* Hero Banner Section with Cinematic Video Background */}
      <section className="relative w-full h-[650px] overflow-hidden flex items-center justify-center">
        {/* Luxury Resort Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="https://videos.pexels.com/video-files/3121459/3121459-hd_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950"></div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 space-y-8 max-w-5xl mx-auto text-white mt-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-indigo-100"
          >
            <Sparkles className="h-4 w-4" />
            Trải nghiệm kỳ nghỉ thượng lưu
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight drop-shadow-xl"
          >
            Tìm nơi dừng chân lý tưởng cho chuyến đi của bạn
          </motion.h1>

          {/* Booking.com style Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0.4 }}
            className="w-full max-w-5xl bg-white/20 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 rounded-3xl p-2 shadow-2xl flex flex-col lg:flex-row gap-2 items-center justify-between mt-8 relative z-20"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-1">
              {/* Location Input */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl cursor-pointer">
                <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Bạn muốn đến đâu?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-sm font-bold bg-transparent border-none focus:outline-none placeholder-slate-500 text-slate-900 dark:text-white w-full"
                />
              </div>

              {/* Check-in Date Picker */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl flex items-center w-full px-1 overflow-hidden relative">
                <DatePicker 
                  date={checkInDate} 
                  setDate={setCheckInDate} 
                  label="Ngày nhận phòng"
                  className="text-sm font-bold"
                />
              </div>

              {/* Check-out Date Picker */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl flex items-center w-full px-1 overflow-hidden relative">
                <DatePicker 
                  date={checkOutDate} 
                  setDate={setCheckOutDate} 
                  label="Ngày trả phòng"
                  className="text-sm font-bold"
                />
              </div>

              {/* Guests Input */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl cursor-pointer">
                <Users className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="text-sm font-bold bg-transparent border-none focus:outline-none placeholder-slate-500 text-slate-900 dark:text-white w-full truncate"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              className="w-full lg:w-32 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center transition-colors shadow-md text-base shrink-0 ml-1"
            >
              Tìm
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Property Types (Booking.com style) */}
      <motion.section 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tìm theo loại chỗ nghỉ</h2>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent>
            {propertyTypes.map((type, index) => (
              <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 pl-4">
                <div 
                  onClick={() => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
                    router.push(`/search?propertyType=${type.type}&checkIn=${today}&checkOut=${tomorrow}`);
                  }}
                  className="flex flex-col space-y-3 cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={type.image}
                      alt={type.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {type.name}
                  </span>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </motion.section>

      {/* Section 2: Trending Destinations */}
      <motion.section 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Điểm đến đang thịnh hành</h2>
          <p className="text-sm text-slate-500">Các lựa chọn phổ biến nhất cho du khách từ Việt Nam</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.slice(0, 2).map((branch) => (
            <div 
              key={branch.id} 
              onClick={() => navigateToBranch(branch.id)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img src={branch.imageUrl} alt={branch.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <h3 className="absolute bottom-6 left-6 text-2xl font-black text-white flex items-center gap-2">
                {branch.name} <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VN" className="w-6 rounded-sm shadow-sm" />
              </h3>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.slice(2, 5).map((branch) => (
            <div 
              key={branch.id} 
              onClick={() => navigateToBranch(branch.id)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all"
            >
              <img src={branch.imageUrl} alt={branch.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <h3 className="absolute bottom-6 left-6 text-2xl font-black text-white flex items-center gap-2">
                {branch.name} <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="VN" className="w-6 rounded-sm shadow-sm" />
              </h3>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Section 3: Featured Rooms / Deals */}
      <motion.section 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-row justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ưu đãi nổi bật dành cho bạn</h2>
            <p className="text-sm text-slate-500">Đặt ngay để nhận mức giá tốt nhất</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedRooms.length > 0 ? recommendedRooms.slice(0,4).map((room) => {
            const firstImage = room.images ? JSON.parse(room.images)[0] : "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=600&auto=format&fit=crop";
            const discountedPrice = room.basePrice * (1 - room.discount / 100);
            
            return (
            <Card key={room.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={firstImage}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {room.discount > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    Giảm {room.discount}%
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-slate-700 hover:text-rose-600 transition-colors">
                  <Heart className="h-4 w-4 fill-transparent" />
                </button>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">8.9</span>
                    <span className="text-xs text-slate-500">(124 đánh giá)</span>
                  </div>
                </div>

                <div className="flex flex-col items-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  {room.discount > 0 ? (
                    <>
                      <span className="text-xs text-slate-400 line-through">{room.basePrice.toLocaleString('vi-VN')} đ</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{discountedPrice.toLocaleString('vi-VN')} đ <span className="text-[10px] text-slate-400 font-normal">/đêm</span></span>
                    </>
                  ) : (
                    <span className="text-lg font-black text-slate-900 dark:text-white">{room.basePrice.toLocaleString('vi-VN')} đ <span className="text-[10px] text-slate-400 font-normal">/đêm</span></span>
                  )}
                </div>

                <button
                  onClick={() => handleBook(room.id)}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 text-xs transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                >
                  Chọn phòng
                </button>
              </CardContent>
            </Card>
          )}) : null}
        </div>
      </motion.section>
      
      {/* Map locator as Section 4 */}
      <motion.section 
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="text-center space-y-2 mt-16 mb-8">
          <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Khám phá vị trí</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bản đồ Chi Nhánh</h2>
        </div>
        <BranchLocatorMap />
      </motion.section>
    </div>
  );
}
