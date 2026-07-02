"use client"

import { useState, useEffect } from 'react';
import { 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  MoreVertical,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

interface CleanRoom {
  id: string;
  number: string;
  type: string;
  priority: 'urgent' | 'high' | 'normal';
  priorityDetail: string;
  step: 'waiting' | 'cleaning' | 'inspected';
  roomTypeId: number;
  floor: number;
  notes?: string;
  guestCount?: number;
  guestStatus?: string;
}

export default function HousekeepingRoomManagement() {
  const [rooms, setRooms] = useState<CleanRoom[]>([]);
  const [otherRooms, setOtherRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(8);
  const totalCount = 20;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/rooms');
      
      // Filter rooms that need cleaning (DIRTY status)
      const dirtyRooms = res.data.filter((r: any) => r.status === 'DIRTY');
      const nonDirtyRooms = res.data.filter((r: any) => r.status !== 'DIRTY');

      const mappedDirty = dirtyRooms.map((r: any, index: number) => {
        const isUrgent = index % 2 === 0;
        return {
          id: String(r.id),
          number: r.roomNumber,
          type: r.roomType?.name || 'Standard Twin',
          priority: isUrgent ? 'urgent' : 'normal',
          priorityDetail: isUrgent ? 'Đã quá hạn 15 phút' : 'Cần dọn trước 16:00',
          step: 'waiting',
          roomTypeId: r.roomType?.id || 0,
          floor: r.floor,
          notes: isUrgent ? 'Khách VIP - Check-in sớm lúc 14:00. Vui lòng thay thêm 2 bộ khăn tắm và chuẩn bị giỏ trái cây đón khách.' : undefined,
          guestCount: 2,
          guestStatus: 'Khách đã trả phòng'
        };
      });

      const mappedOthers = nonDirtyRooms.map((r: any) => {
        let prio = 'THƯỜNG';
        if (r.status === 'MAINTENANCE') prio = 'KHẨN CẤP';
        if (r.status === 'OCCUPIED') prio = 'CAO';

        return {
          id: String(r.id),
          type: r.roomType?.name || 'Standard Single',
          priority: prio,
          notes: r.status === 'OCCUPIED' ? 'Kiểm tra mini bar' : 'Không có',
          status: r.status === 'AVAILABLE' ? 'Sẵn sàng' : r.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đang ở'
        };
      });

      setRooms(mappedDirty);
      setOtherRooms(mappedOthers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCleaning = (id: string) => {
    setRooms(prev => prev.map(r => 
      r.id === id ? { ...r, step: 'cleaning', priorityDetail: 'Đang thực hiện dọn dẹp' } : r
    ));
  };

  const handleFinishCleaning = async (room: CleanRoom) => {
    try {
      // Complete clean: update room status to AVAILABLE in backend
      await api.put(`/api/v1/rooms/${room.id}`, {
        roomNumber: room.number,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        status: 'AVAILABLE'
      });

      // Update locally
      setRooms(prev => prev.map(r => 
        r.id === room.id ? { ...r, step: 'inspected', priorityDetail: 'Đã hoàn tất dọn dẹp' } : r
      ));
      setCompletedCount(c => Math.min(c + 1, totalCount));
      
      // Refresh list after 1.5 seconds to move room to "other rooms"
      setTimeout(() => {
        fetchRooms();
      }, 1500);

    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi hoàn tất dọn dẹp phòng.');
    }
  };

  const handleReportIssue = (roomNum: string) => {
    const issue = prompt(`Nhập báo cáo sự cố cho phòng ${roomNum}:`);
    if (issue && issue.trim()) {
      alert(`Đã báo cáo sự cố: "${issue}" của phòng ${roomNum} lên hệ thống kỹ thuật!`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Danh sách dọn dẹp hôm nay
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thứ Hai, 24 Tháng 5, 2024 • {rooms.length + otherRooms.length} phòng cần xử lý
          </p>
        </div>
        
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm cursor-pointer">
          <Filter className="h-4 w-4" />
          Lọc danh sách
        </button>
      </div>

      {/* Main Grid split: Left cards, Right stats */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Assigned Rooms list */}
        <div className="lg:col-span-8 space-y-6">
          {rooms.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl text-sm text-slate-500">
              Tuyệt vời! Hiện tại không có phòng nào cần dọn dẹp.
            </div>
          ) : (
            rooms.map((room) => {
              const isWaiting = room.step === 'waiting';
              const isCleaning = room.step === 'cleaning';
              const isInspected = room.step === 'inspected';
              
              return (
                <div 
                  key={room.id}
                  className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 bg-white dark:bg-[#0B0F19] ${
                    room.priority === 'urgent' 
                      ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' 
                      : 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Header row of Card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${
                        room.priority === 'urgent' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {room.priority === 'urgent' ? 'Khẩn cấp' : 'Bình thường'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">• {room.priorityDetail}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    Phòng {room.number} — {room.type}
                  </h3>

                  {/* Progress Workflow Indicator */}
                  <div className="flex items-center justify-between max-w-sm mb-6 relative">
                    {/* Connect lines */}
                    <div className="absolute top-[11px] left-3 right-3 h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
                    <div className="absolute top-[11px] left-3 h-0.5 bg-indigo-650 z-0 transition-all duration-500" 
                      style={{ width: isWaiting ? '0%' : isCleaning ? '50%' : '100%' }}
                    />
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isWaiting ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-600 bg-white dark:bg-[#0B0F19] text-indigo-600'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Chờ dọn</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCleaning ? 'border-indigo-600 bg-indigo-600 text-white' : 
                        isInspected ? 'border-indigo-600 bg-white dark:bg-[#0B0F19] text-indigo-600' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] text-slate-300'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Đang dọn</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isInspected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] text-slate-300'
                      }`}>
                        <div className="h-2 w-2 rounded-full bg-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Đã kiểm tra</span>
                    </div>
                  </div>

                  {/* Alert/Notes info box */}
                  {room.notes && (
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-xs leading-relaxed text-indigo-700 dark:text-indigo-400 mb-6 flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase text-[10px] mb-1">LƯU Ý TỪ LỄ TÂN</span>
                        {room.notes}
                      </div>
                    </div>
                  )}

                  {/* Room Info details */}
                  {(room.guestCount || room.guestStatus) && (
                    <div className="flex gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 pl-1">
                      {room.guestCount && (
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="h-4 w-4" />
                          {room.guestCount} Khách
                        </span>
                      )}
                      {room.guestStatus && (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          {room.guestStatus}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    {isWaiting && (
                      <button
                        onClick={() => handleStartCleaning(room.id)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
                      >
                        Bắt đầu dọn
                      </button>
                    )}
                    {isCleaning && (
                      <button
                        onClick={() => handleFinishCleaning(room)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
                      >
                        Hoàn tất dọn dẹp
                      </button>
                    )}
                    {isInspected && (
                      <div className="px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1.5 animate-pulse">
                        <CheckCircle2 className="h-4 w-4" />
                        Đang đồng bộ Sẵn sàng...
                      </div>
                    )}

                    <button
                      onClick={() => handleReportIssue(room.number)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      {isCleaning ? 'Báo cáo sự cố' : 'Xem chi tiết phòng'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Progress & Supplies */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Progress Card */}
          <div className="p-6 bg-indigo-600 text-white rounded-3xl space-y-4 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500 rounded-full translate-x-12 -translate-y-12 opacity-50" />
            <div className="space-y-1 relative z-10">
              <h3 className="text-base font-bold">Tiến độ hôm nay</h3>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-indigo-100">Hoàn thành</span>
                <span className="text-3xl font-extrabold">{completedCount}/{totalCount}</span>
              </div>
              <div className="h-2 w-full bg-indigo-700 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500" 
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-indigo-100 italic pt-2">
                "Làm tốt lắm! Bạn còn {totalCount - completedCount} phòng nữa để hoàn thành mục tiêu ngày."
              </p>
            </div>
          </div>

          {/* Supplies Card */}
          <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Vật tư cần bổ sung
            </h3>
            
            <div className="space-y-3">
              {[
                { name: 'Khăn tắm (Lớn)', count: 24 },
                { name: 'Dầu gội/Sữa tắm', count: 15 },
                { name: 'Nước khoáng 350ml', count: 40 }
              ].map((sup, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-650 dark:text-slate-350">{sup.name}</span>
                  <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">+{sup.count}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => alert('Đã gửi yêu cầu thêm vật tư!')}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-600/50 hover:border-indigo-600 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all cursor-pointer"
            >
              Yêu cầu thêm từ kho
            </button>
          </div>

          {/* Standard image card */}
          <div className="relative h-44 rounded-3xl overflow-hidden shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600&auto=format&fit=crop" 
              alt="Lumiere standard" 
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5 font-semibold">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600 px-2 py-0.5 rounded-md inline-block">Tiêu chuẩn</span>
              <p className="text-xs italic leading-relaxed text-slate-100 font-medium">"Tiêu chuẩn 5 sao Lumiere: Mỗi chi tiết nhỏ đều tạo nên trải nghiệm lớn."</p>
            </div>
          </div>

        </div>

      </div>

      {/* Phòng khác Section */}
      <div className="p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors duration-300">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1 border-l-4 border-indigo-600">
          Phòng khác
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">Mức độ</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-750 dark:text-slate-350">
              {otherRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-400">Không có dữ liệu</td>
                </tr>
              ) : (
                otherRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">P. {room.id}</td>
                    <td className="px-6 py-4">{room.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                        room.priority === 'KHẨN CẤP' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                        room.priority === 'CAO' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {room.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{room.notes}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
                        <Clock className="h-3.5 w-3.5 text-indigo-650" />
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
