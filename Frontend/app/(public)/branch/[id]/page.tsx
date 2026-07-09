"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Heart, ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function BranchPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (params.id) {
      api.get(`/api/v1/branches/${params.id}`)
        .then(res => setBranch(res.data))
        .catch(err => console.error("Error loading branch", err));
        
      api.get(`/api/v1/public/search-rooms?branchId=${params.id}`)
        .then(res => {
          setRooms(res.data);
        })
        .catch(err => console.error("Error loading rooms", err));
    }
  }, [params.id]);

  if (!branch) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-slate-500 font-medium">Đang tải thông tin chi nhánh...</p></div></div>;

  const handleBook = (roomId: string | number) => {
    let url = `/checkout?roomTypeId=${roomId}`;
    if (checkIn) url += `&checkIn=${format(checkIn, 'yyyy-MM-dd')}`;
    if (checkOut) url += `&checkOut=${format(checkOut, 'yyyy-MM-dd')}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] pb-24">
      {/* Header Image */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <img src={branch.imageUrl || "https://images.unsplash.com/photo-1542314831-c6a4d14272de?q=80&w=1000&auto=format&fit=crop"} alt={branch.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        
        <button onClick={() => router.back()} className="absolute top-6 left-6 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all">
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="absolute bottom-8 left-6 md:left-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{branch.name}</h1>
          <div className="flex items-center text-slate-200 gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{branch.address}</span>
          </div>
          <p className="text-slate-300 text-sm md:text-base line-clamp-2 md:line-clamp-none">{branch.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Date Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/3">
            <DatePicker date={checkIn} setDate={setCheckIn} label="Ngày nhận phòng" />
          </div>
          <div className="w-full md:w-1/3">
            <DatePicker date={checkOut} setDate={setCheckOut} label="Ngày trả phòng" />
          </div>
          <button className="w-full md:w-1/3 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
            Kiểm tra phòng trống
          </button>
        </div>

        {/* Room List */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Các hạng phòng tại chi nhánh</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const firstImage = room.images ? JSON.parse(room.images)[0] : "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=600&auto=format&fit=crop";
              const discountedPrice = room.basePrice * (1 - (room.discount || 0) / 100);
              
              return (
                <Card key={room.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full">
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <img src={firstImage} alt={room.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">8.9</span>
                        <span className="text-xs text-slate-500">(124 đánh giá)</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
                      {room.discount > 0 ? (
                        <>
                          <span className="text-sm text-slate-400 line-through">{room.basePrice.toLocaleString('vi-VN')} đ</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white">{discountedPrice.toLocaleString('vi-VN')} đ <span className="text-xs text-slate-400 font-normal">/đêm</span></span>
                        </>
                      ) : (
                        <span className="text-xl font-black text-slate-900 dark:text-white">{room.basePrice.toLocaleString('vi-VN')} đ <span className="text-xs text-slate-400 font-normal">/đêm</span></span>
                      )}
                    </div>

                    <button
                      onClick={() => handleBook(room.id)}
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 text-sm transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                      Chọn phòng
                    </button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
