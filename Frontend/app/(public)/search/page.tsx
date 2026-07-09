"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Calendar, Star, Users, ArrowRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';

interface RoomType {
  id: number;
  name: string;
  branchId: number;
  images: string;
  basePrice: number;
  discount: number;
  capacity: number;
  availableRooms?: number;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branchId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    let url = '/api/v1/public/search-rooms?';
    if (branchId) url += `branchId=${branchId}&`;
    if (checkIn) url += `checkInDate=${checkIn}&`;
    if (checkOut) url += `checkOutDate=${checkOut}&`;

    api.get(url)
      .then((res) => {
        setRooms(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch rooms", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [branchId, checkIn, checkOut]);

  const handleBook = (roomId: number) => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push(`/checkout?roomTypeId=${roomId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Kết quả tìm kiếm</h1>
        <p className="text-sm text-slate-500">
          Tìm thấy {rooms.length} hạng phòng trống phù hợp với yêu cầu của bạn.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => {
            const firstImage = room.images ? JSON.parse(room.images)[0] : "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=600&auto=format&fit=crop";
            const isAvailable = room.availableRooms && room.availableRooms > 0;

            return (
              <Card key={room.id} className="group overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={firstImage}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-white/70 hover:bg-white backdrop-blur-md text-slate-700 hover:text-rose-600 transition-colors">
                    <Heart className="h-4 w-4 fill-transparent" />
                  </button>
                  {isAvailable && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-slate-800">
                      Chỉ còn {room.availableRooms} phòng trống
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        Chi nhánh {room.branchId}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">Tối đa {room.capacity}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors">
                      {room.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Giá mỗi đêm</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">${room.basePrice}</span>
                    </div>
                    {isAvailable ? (
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:border-emerald-900/50">
                        CÒN PHÒNG
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-rose-50 text-rose-600">
                        HẾT PHÒNG
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleBook(room.id)}
                    disabled={!isAvailable}
                    className={`w-full rounded-xl font-semibold py-2.5 text-xs transition-all shadow-sm ${
                      isAvailable ? 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] cursor-pointer' : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Đặt phòng ngay' : 'Đã hết phòng'}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Đang tải...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
