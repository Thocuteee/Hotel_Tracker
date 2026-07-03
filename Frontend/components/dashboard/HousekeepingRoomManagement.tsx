"use client"

import { useState, useEffect } from 'react';
import { 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  MoreVertical,
  Loader2,
  X,
  Brush,
  ChevronRight,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import Toast, { ToastMessage } from '@/components/ui/Toast';

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
  const [updating, setUpdating] = useState(false);
  const totalCount = 20;

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Issue reporting custom modal state
  const [reportIssueRoomNum, setReportIssueRoomNum] = useState<string | null>(null);
  const [issueText, setIssueText] = useState('');

  // Mobile Swipe/Slide states for mock interaction
  const [slidingRoomId, setSlidingRoomId] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/rooms');
      
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
      showToast('error', 'Thất bại', 'Không thể kết nối máy chủ để tải danh sách dọn dẹp.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCleaning = (id: string) => {
    setRooms(prev => prev.map(r => 
      r.id === id ? { ...r, step: 'cleaning', priorityDetail: 'Đang thực hiện dọn dẹp' } : r
    ));
    showToast('info', 'Bắt đầu', 'Đã ghi nhận bắt đầu dọn phòng.');
  };

  const handleFinishCleaning = async (room: CleanRoom) => {
    setUpdating(true);
    try {
      await api.put(`/api/v1/rooms/${room.id}`, {
        roomNumber: room.number,
        roomTypeId: room.roomTypeId,
        floor: room.floor,
        status: 'AVAILABLE'
      });

      setRooms(prev => prev.map(r => 
        r.id === room.id ? { ...r, step: 'inspected', priorityDetail: 'Đã hoàn tất dọn dẹp' } : r
      ));
      setCompletedCount(c => Math.min(c + 1, totalCount));
      showToast('success', 'Hoàn tất', `Phòng ${room.number} đã dọn dẹp xong và sẵn sàng đón khách.`);
      
      setTimeout(() => {
        fetchRooms();
      }, 1500);

    } catch (e) {
      console.error(e);
      showToast('error', 'Lỗi hoàn tất', 'Không thể cập nhật trạng thái phòng.');
    } finally {
      setUpdating(false);
    }
  };

  const executeReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportIssueRoomNum || !issueText.trim()) return;

    showToast('success', 'Báo cáo thành công', `Đã ghi nhận sự cố: "${issueText}" tại phòng ${reportIssueRoomNum}.`);
    setReportIssueRoomNum(null);
    setIssueText('');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto relative px-2 sm:px-4">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Mobile Sticky Header */}
      <div className="space-y-1 py-2">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Brush className="h-5 w-5 text-indigo-650" />
          Nhiệm vụ dọn dẹp hôm nay
        </h1>
        <p className="text-xs text-slate-500">
          Chạm/Vuốt để đổi trạng thái thời gian thực.
        </p>
      </div>

      {/* Progress Ring / Mini Bar */}
      <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-md space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold">Tiến độ công việc</span>
          <span className="text-sm font-black">{completedCount}/{totalCount} phòng</span>
        </div>
        <div className="h-3 w-full bg-indigo-750 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-450 rounded-full transition-all duration-500" 
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Main room cards optimized for Mobile Vertical Scroll */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-650" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500">
            Tất cả phòng được phân công đã sạch sẽ!
          </div>
        ) : (
          rooms.map((room) => {
            const isWaiting = room.step === 'waiting';
            const isCleaning = room.step === 'cleaning';
            const isInspected = room.step === 'inspected';
            
            return (
              <div 
                key={room.id}
                className={`rounded-2xl border bg-white dark:bg-[#0B0F19] overflow-hidden shadow-sm transition-all duration-300 ${
                  room.priority === 'urgent' 
                    ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' 
                    : 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                
                {/* Card Top Details */}
                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={`px-2 py-0.5 rounded-md ${
                      room.priority === 'urgent' 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-955/20' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {room.priority === 'urgent' ? 'CẦN DỌN GẤP' : 'DỌN THƯỜNG'}
                    </span>
                    <span className="text-slate-400">{room.priorityDetail}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Phòng {room.number} — {room.type}
                  </h3>

                  {/* 3 Step Workflow */}
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-center">
                    <div className={`py-1.5 rounded-lg border ${isWaiting ? 'bg-indigo-650 text-white border-indigo-650' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                      Chờ dọn
                    </div>
                    <div className={`py-1.5 rounded-lg border ${isCleaning ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                      Đang dọn
                    </div>
                    <div className={`py-1.5 rounded-lg border ${isInspected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}>
                      Đã sạch
                    </div>
                  </div>

                  {/* Urgent info bubble */}
                  {room.notes && (
                    <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-100 dark:border-rose-900/30 text-xs text-rose-700 dark:text-rose-400 font-semibold leading-relaxed flex gap-2">
                      <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                      <p>{room.notes}</p>
                    </div>
                  )}

                  {/* Capacity */}
                  <div className="flex gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4 text-slate-400" />
                      {room.guestCount} Khách cũ
                    </span>
                    <span className="flex items-center gap-1 text-emerald-650">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {room.guestStatus}
                    </span>
                  </div>

                </div>

                {/* Tactile Mobile Swipe/Slide Interactive Trigger Block */}
                <div className="border-t border-slate-100 dark:border-slate-850 p-3 bg-slate-50/50 dark:bg-slate-900/10 flex flex-col gap-2">
                  
                  {isWaiting && (
                    <button
                      onClick={() => handleStartCleaning(room.id)}
                      className="w-full h-12 rounded-xl bg-indigo-650 hover:bg-indigo-600 active:scale-[0.98] text-white text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Bắt đầu dọn dẹp
                      <ChevronRight className="h-4 w-4 animate-pulse" />
                    </button>
                  )}

                  {isCleaning && (
                    <button
                      onClick={() => handleFinishCleaning(room)}
                      className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Hoàn thành dọn dẹp
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}

                  {isInspected && (
                    <div className="w-full h-12 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold flex items-center justify-center gap-1.5 animate-pulse">
                      Đang đồng bộ phòng sẵn sàng...
                    </div>
                  )}

                  <button
                    onClick={() => setReportIssueRoomNum(room.number)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50/30 transition-all cursor-pointer"
                  >
                    Báo cáo sự cố phòng
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Other rooms section optimized for compact cards */}
      <div className="space-y-3.5 pt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pl-1 border-l-4 border-indigo-600">
          Phòng chờ phân trực
        </h3>
        
        <div className="space-y-2">
          {otherRooms.slice(0, 5).map((room) => (
            <div key={room.id} className="p-3 bg-white dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-semibold">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 dark:text-white">P. {room.id}</span>
                <span className="text-[10px] text-slate-400 block">{room.type}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                room.priority === 'KHẨN CẤP' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
              }`}>
                {room.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Issue Report Modal */}
      {reportIssueRoomNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-5 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setReportIssueRoomNum(null); setIssueText(''); }}
              className="absolute right-5 top-5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Báo cáo sự cố phòng
              </h2>
              <p className="text-xs text-slate-500">
                Gửi ghi nhận sự cố tại **Phòng {reportIssueRoomNum}**.
              </p>
            </div>

            <form onSubmit={executeReportIssue} className="space-y-4">
              <div className="space-y-1.5">
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="Ví dụ: Hỏng máy lạnh, vòi sen rò nước..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-105 focus:border-indigo-650 focus:outline-none transition-colors resize-none"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setReportIssueRoomNum(null); setIssueText(''); }}
                  className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-indigo-650 hover:bg-indigo-600 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
