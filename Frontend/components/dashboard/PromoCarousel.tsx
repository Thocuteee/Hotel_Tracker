"use client"

import { useState, useEffect } from 'react';
import { X, Star, Sparkles, ChevronRight } from 'lucide-react';

interface PromoSlide {
  id: string;
  tag: string;
  title: string;
  stars: number;
  description: string;
  image: string;
  actionText: string;
  link: string;
}

const slides: PromoSlide[] = [
  {
    id: '1',
    tag: 'NÂNG CẤP GÓI',
    title: 'Lumiere Luxury Hotel & Resort',
    stars: 5,
    description: 'Nâng cấp lên gói hội viên Lumiere Gold để giảm 20% tất cả các dịch vụ Spa, miễn phí đồ uống tại Lounge & đưa đón sân bay.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop',
    actionText: 'Nâng cấp ngay',
    link: '#'
  },
  {
    id: '2',
    tag: 'PHÒNG ĐỀ XUẤT',
    title: 'Lumiere Presidential Suite',
    stars: 5,
    description: 'Phòng Tổng thống hướng biển đang trống. Đề xuất kích hoạt voucher ưu đãi 15% cho các giao dịch check-in VIP trong ngày hôm nay.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400&auto=format&fit=crop',
    actionText: 'Xem sơ đồ phòng',
    link: '/admin/rooms'
  },
  {
    id: '3',
    tag: 'ƯU ĐÃI NỔI BẬT',
    title: 'BBQ Tiệc Bể Bơi Penthouse',
    stars: 5,
    description: 'Ưu đãi đặc biệt mùa hè: Miễn phí dịch vụ phục vụ tiệc nướng BBQ riêng tư tại bể bơi vô cực Penthouse cho các đoàn khách đặt phòng Suite.',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=400&auto=format&fit=crop',
    actionText: 'Đăng ký sự kiện',
    link: '#'
  }
];

export default function PromoCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('promo_carousel_dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Rotate slides every 10 seconds
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('promo_carousel_dismissed', 'true');
  };

  if (!isVisible) return null;

  const activeSlide = slides[currentIdx];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shadow-md transition-all duration-500 animate-in fade-in duration-300">
      
      {/* Absolute Close X Button */}
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-950/20 dark:bg-white/10 text-white hover:bg-slate-950/40 dark:hover:bg-white/20 transition-all z-10 cursor-pointer"
        title="Bỏ qua quảng cáo này"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main Container Grid */}
      <div className="grid md:grid-cols-12 items-center">
        
        {/* Left Side: Text Details */}
        <div className="md:col-span-7 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-full w-fit">
            <Sparkles className="h-3 w-3" />
            {activeSlide.tag}
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {activeSlide.title}
          </h3>

          {/* Stars */}
          <div className="flex text-amber-400 gap-0.5">
            {Array.from({ length: activeSlide.stars }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            {activeSlide.description}
          </p>

          <div className="pt-2 flex items-center gap-4">
            <a
              href={activeSlide.link}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-650 px-5 text-xs font-bold text-white hover:bg-indigo-600 transition-colors shadow-sm cursor-pointer"
            >
              {activeSlide.actionText}
              <ChevronRight className="h-4 w-4" />
            </a>

            {/* Manual Slide Indicators */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIdx === idx 
                      ? 'w-6 bg-indigo-650 dark:bg-indigo-400' 
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Image with cover fit */}
        <div className="md:col-span-5 h-48 md:h-64 relative overflow-hidden shrink-0">
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 transform scale-100 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:bg-gradient-to-r md:from-white dark:md:from-[#0B0F19] md:via-transparent" />
        </div>

      </div>
    </div>
  );
}
