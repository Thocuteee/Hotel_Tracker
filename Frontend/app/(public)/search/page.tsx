"use client"

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Star, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';

interface PropertyCard {
  id: number;
  name: string;
  address: string;
  starRating: number;
  distanceFromCenter?: number;
  reviewScore: number;
  highlightedAmenities?: string[];
  lowestPriceAvailable: number;
  availableRoomCount: number;
  availableRoomsMessage: string;
  imageUrl: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const initPropertyType = searchParams.get('propertyType') || '';

  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('RECOMMENDED');
  const [propertyTypes, setPropertyTypes] = useState<string[]>(initPropertyType ? [initPropertyType] : []);
  const [minStarRating, setMinStarRating] = useState<number | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [destination, checkIn, checkOut, sort, propertyTypes, minStarRating]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/public/search-properties?`;
      if (destination) url += `destination=${encodeURIComponent(destination)}&`;
      if (checkIn) url += `checkInDate=${checkIn}&`;
      if (checkOut) url += `checkOutDate=${checkOut}&`;
      if (sort) url += `sort=${sort}&`;
      if (minStarRating) url += `minStarRating=${minStarRating}&`;
      
      if (propertyTypes.length > 0) {
        url += `propertyTypes=${propertyTypes.join(',')}&`;
      }

      const res = await api.get(url);
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to fetch properties", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyTypeToggle = (type: string) => {
    if (propertyTypes.includes(type)) {
      setPropertyTypes(propertyTypes.filter(t => t !== type));
    } else {
      setPropertyTypes([...propertyTypes, type]);
    }
  };

  const getReviewScoreText = (score: number) => {
    if (score === 0) return 'Chưa có đánh giá';
    if (score >= 9) return 'Tuyệt hảo';
    if (score >= 8) return 'Rất tốt';
    if (score >= 7) return 'Tốt';
    return 'Dễ chịu';
  };

  const handleChooseOptions = (propertyId: number) => {
    router.push(`/hotel/${propertyId}?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tìm kiếm chỗ nghỉ</h1>
        <p className="text-sm text-slate-500">
          Tìm thấy {properties.length} chỗ nghỉ phù hợp với ngày và số lượng khách của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Filters */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-slate-900 dark:text-white">Bộ lọc tìm kiếm</span>
            </div>

            {/* Sort Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp xếp theo</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:border-indigo-600"
              >
                <option value="RECOMMENDED">Đề xuất hàng đầu</option>
                <option value="PRICE_LOW_TO_HIGH">Giá (Thấp đến Cao)</option>
                <option value="PRICE_HIGH_TO_LOW">Giá (Cao đến Thấp)</option>
                <option value="RATING">Điểm đánh giá cao nhất</option>
              </select>
            </div>

            {/* Property Types Checkboxes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loại chỗ nghỉ</label>
              <div className="space-y-2">
                {[
                  { name: 'Khách sạn', type: 'HOTEL' },
                  { name: 'Căn hộ', type: 'APARTMENT' },
                  { name: 'Resort', type: 'RESORT' },
                  { name: 'Biệt thự', type: 'VILLA' },
                  { name: 'Nhà gỗ', type: 'CABIN' }
                ].map((item) => (
                  <label key={item.type} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={propertyTypes.includes(item.type)}
                      onChange={() => handlePropertyTypeToggle(item.type)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stars Filter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xếp hạng sao</label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={minStarRating === stars}
                      onChange={() => setMinStarRating(minStarRating === stars ? null : stars)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      {'★'.repeat(stars)}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy chỗ nghỉ phù hợp</p>
              <p className="text-sm text-slate-500">Vui lòng thay đổi ngày tìm kiếm hoặc giảm bớt bộ lọc.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {properties.map((prop) => {
                return (
                  <Card key={prop.id} className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col md:flex-row h-full">
                    {/* Thumbnail Image */}
                    <div className="relative w-full md:w-80 h-52 bg-slate-100 dark:bg-slate-800 shrink-0">
                      {prop.imageUrl ? (
                        <img
                          src={prop.imageUrl}
                          alt={prop.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="p-6 flex-1 flex flex-col md:flex-row justify-between gap-6">
                      {/* Details Column */}
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                              {prop.name}
                            </h3>
                            {prop.starRating && (
                              <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                                {'★'.repeat(prop.starRating)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{prop.address}</span>
                          </div>
                        </div>

                        {/* Available Rooms Message */}
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl w-fit">
                          {prop.availableRoomsMessage}
                        </div>
                      </div>

                      {/* Score and Price Column */}
                      <div className="w-full md:w-56 flex flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-right">
                        {/* Rating block */}
                        <div>
                          {prop.reviewScore > 0 ? (
                            <div className="flex items-center gap-2 justify-end">
                              <div className="flex flex-col text-right">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {getReviewScoreText(prop.reviewScore)}
                                </span>
                              </div>
                              <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                                {prop.reviewScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                              Chưa có đánh giá
                            </span>
                          )}
                        </div>

                        {/* Price block */}
                        <div className="space-y-3 w-full text-right">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Giá thấp nhất từ</span>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              {prop.lowestPriceAvailable.toLocaleString('vi-VN')} VND
                            </span>
                            <span className="text-[10px] text-slate-500">Đã bao gồm thuế & phí</span>
                          </div>

                          <button
                            onClick={() => handleChooseOptions(prop.id)}
                            className="w-full rounded-xl font-bold py-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            Xem các lựa chọn <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Đang tải kết quả...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
