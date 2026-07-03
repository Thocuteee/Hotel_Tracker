"use client"

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Wifi, 
  Snowflake, 
  Tv, 
  Coffee, 
  Key, 
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
  Download,
  MoreVertical,
  Bed,
  Users,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import api from '@/lib/api';
import Toast, { ToastMessage } from '@/components/ui/Toast';

interface RoomType {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  description: string;
  images: string; // JSON string
}

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  utilities: string[];
  price: number;
  status: 'ready' | 'occupied' | 'cleaning' | 'maintenance';
  image: string;
  roomTypeId: number;
  description?: string;
}

export default function AdminRoomManagement() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'types'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [floorFilter, typeFilter, statusFilter, searchQuery]);

  // Selected Room for Right Details Panel
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Custom Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Room Modal states (Add/Edit)
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState<'add' | 'edit'>('add');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  
  // Room Type Modal states (Add/Edit)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<'add' | 'edit'>('add');
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);

  // Delete confirm modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<{ id: number; name: string } | null>(null);
  
  // Form states for Rooms
  const [formNumber, setFormNumber] = useState('');
  const [formRoomTypeId, setFormRoomTypeId] = useState<number>(0);
  const [formFloor, setFormFloor] = useState(1);
  const [formStatus, setFormStatus] = useState<Room['status']>('ready');

  // Form states for Room Types
  const [formTypeName, setFormTypeName] = useState('');
  const [formTypePrice, setFormTypePrice] = useState(1000000);
  const [formTypeCapacity, setFormTypeCapacity] = useState(2);
  const [formTypeDescription, setFormTypeDescription] = useState('');
  const [formTypeImage, setFormTypeImage] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
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

  const getUtilitiesForType = (typeName: string): string[] => {
    switch (typeName) {
      case 'Standard Twin': return ['wifi', 'snow', 'tv'];
      case 'Deluxe King': return ['wifi', 'snow', 'tv', 'coffee'];
      case 'Suite Family': return ['wifi', 'snow', 'coffee', 'key'];
      case 'Lumiere Penthouse': return ['wifi', 'snow', 'tv', 'coffee', 'key'];
      default: return ['wifi', 'snow'];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const typesRes = await api.get('/api/v1/room-types');
      const roomsRes = await api.get('/api/v1/rooms');

      setRoomTypes(typesRes.data);

      const mappedRooms = roomsRes.data.map((r: any) => {
        let imageUrl = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop';
        if (r.roomType?.images) {
          try {
            const parsed = JSON.parse(r.roomType.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imageUrl = parsed[0];
            }
          } catch (e) {
            if (typeof r.roomType.images === 'string' && r.roomType.images.startsWith('http')) {
              imageUrl = r.roomType.images;
            }
          }
        }

        let frontendStatus: Room['status'] = 'ready';
        if (r.status === 'OCCUPIED') frontendStatus = 'occupied';
        if (r.status === 'DIRTY') frontendStatus = 'cleaning';
        if (r.status === 'MAINTENANCE') frontendStatus = 'maintenance';

        return {
          id: String(r.id),
          number: r.roomNumber,
          type: r.roomType?.name || 'Standard Twin',
          floor: r.floor,
          utilities: getUtilitiesForType(r.roomType?.name || ''),
          price: r.roomType?.basePrice || 0,
          status: frontendStatus,
          image: imageUrl,
          roomTypeId: r.roomType?.id || 0,
          description: r.roomType?.description || ''
        };
      });

      setRooms(mappedRooms);
      if (selectedRoom) {
        const updatedSelected = mappedRooms.find((r: Room) => r.id === selectedRoom.id);
        setSelectedRoom(updatedSelected || null);
      }
    } catch (e) {
      console.error('Error fetching room data:', e);
      showToast('error', 'Thất bại', 'Không thể kết nối với máy chủ để tải dữ liệu phòng.');
    } finally {
      setLoading(false);
    }
  };

  // --- Room Actions ---

  const handleOpenAddRoom = () => {
    setRoomModalMode('add');
    setFormNumber('');
    if (roomTypes.length > 0) {
      setFormRoomTypeId(roomTypes[0].id);
    }
    setFormFloor(1);
    setFormStatus('ready');
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setRoomModalMode('edit');
    setEditingRoomId(room.id);
    setFormNumber(room.number);
    setFormRoomTypeId(room.roomTypeId);
    setFormFloor(room.floor);
    setFormStatus(room.status);
    setIsRoomModalOpen(true);
  };

  const executeDeleteRoom = async (id: string) => {
    try {
      await api.delete(`/api/v1/rooms/${id}`);
      setRooms(prev => prev.filter(r => r.id !== id));
      if (selectedRoom?.id === id) {
        setSelectedRoom(null);
      }
      showToast('success', 'Thành công', 'Đã xóa phòng khỏi danh mục khách sạn.');
    } catch (e) {
      console.error(e);
      showToast('error', 'Lỗi xóa phòng', 'Không thể xóa phòng này. Vui lòng kiểm tra lại các đơn đặt phòng liên quan.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let statusString = 'AVAILABLE';
    if (formStatus === 'occupied') statusString = 'OCCUPIED';
    if (formStatus === 'cleaning') statusString = 'DIRTY';
    if (formStatus === 'maintenance') statusString = 'MAINTENANCE';

    const payload = {
      roomNumber: formNumber.trim(),
      roomTypeId: formRoomTypeId,
      floor: formFloor,
      status: statusString
    };

    try {
      if (roomModalMode === 'add') {
        await api.post('/api/v1/rooms', payload);
        showToast('success', 'Thành công', `Đã tạo mới phòng ${formNumber} thành công.`);
      } else if (roomModalMode === 'edit' && editingRoomId) {
        await api.put(`/api/v1/rooms/${editingRoomId}`, payload);
        showToast('success', 'Thành công', `Cập nhật thông tin phòng ${formNumber} thành công.`);
      }
      await fetchData();
      setIsRoomModalOpen(false);
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Lỗi lưu dữ liệu', e.response?.data?.message || 'Có lỗi xảy ra trong quá trình cập nhật thông tin phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Room Type Actions ---

  const handleOpenAddType = () => {
    setTypeModalMode('add');
    setFormTypeName('');
    setFormTypePrice(1500000);
    setFormTypeCapacity(2);
    setFormTypeDescription('');
    setFormTypeImage('');
    setIsTypeModalOpen(true);
  };

  const handleOpenEditType = (type: RoomType) => {
    setTypeModalMode('edit');
    setEditingTypeId(type.id);
    setFormTypeName(type.name);
    setFormTypePrice(type.basePrice);
    setFormTypeCapacity(type.capacity);
    setFormTypeDescription(type.description);
    
    let imgStr = '';
    if (type.images) {
      try {
        const parsed = JSON.parse(type.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          imgStr = parsed[0];
        }
      } catch (e) {
        imgStr = type.images;
      }
    }
    setFormTypeImage(imgStr);
    setIsTypeModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formTypeName.trim(),
      basePrice: formTypePrice,
      capacity: formTypeCapacity,
      description: formTypeDescription.trim(),
      images: JSON.stringify([formTypeImage.trim()])
    };

    try {
      if (typeModalMode === 'add') {
        await api.post('/api/v1/room-types', payload);
        showToast('success', 'Thành công', `Đã thêm loại phòng "${formTypeName}" mới.`);
      } else if (typeModalMode === 'edit' && editingTypeId) {
        await api.put(`/api/v1/room-types/${editingTypeId}`, payload);
        showToast('success', 'Thành công', `Đã cập nhật loại phòng "${formTypeName}".`);
      }
      await fetchData();
      setIsTypeModalOpen(false);
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Lỗi lưu dữ liệu', e.response?.data?.message || 'Có lỗi xảy ra khi lưu hạng phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteType = async (id: number) => {
    try {
      await api.delete(`/api/v1/room-types/${id}`);
      showToast('success', 'Thành công', 'Đã xóa hạng phòng thành công.');
      await fetchData();
    } catch (e) {
      console.error(e);
      showToast('error', 'Lỗi xóa', 'Không thể xóa loại phòng này. Có thể vẫn còn phòng thuộc loại này.');
    } finally {
      setDeleteConfirmType(null);
    }
  };

  // --- Render Helpers ---

  const renderUtilityIcon = (util: string) => {
    switch (util) {
      case 'wifi': return <Wifi className="h-4 w-4 text-indigo-650" />;
      case 'snow': return <Snowflake className="h-4 w-4 text-indigo-655" />;
      case 'tv': return <Tv className="h-4 w-4 text-indigo-650" />;
      case 'coffee': return <Coffee className="h-4 w-4 text-indigo-650" />;
      case 'key': return <Key className="h-4 w-4 text-indigo-650" />;
      default: return null;
    }
  };

  const getUtilityLabel = (util: string) => {
    switch (util) {
      case 'wifi': return 'Wi-Fi Tốc độ cao';
      case 'snow': return 'Điều hòa 2 chiều';
      case 'tv': return 'Smart TV 4K 55"';
      case 'coffee': return 'Mini Bar';
      case 'key': return 'Khóa thẻ từ';
      default: return 'Tiện ích';
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (floorFilter !== 'all' && String(room.floor) !== floorFilter) return false;
    if (typeFilter !== 'all' && room.type !== typeFilter) return false;
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return room.number.includes(query) || room.type.toLowerCase().includes(query);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex w-full relative">
      
      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col space-y-6">
        
        {/* Header Block with Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Cấu hình & Thiết lập Phòng
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Thiết lập danh mục phòng và cấu hình giá các hạng phòng khách sạn.
            </p>
          </div>
          
          <div className="flex gap-2.5">
            {activeTab === 'rooms' ? (
              <button
                onClick={handleOpenAddRoom}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm phòng mới
              </button>
            ) : (
              <button
                onClick={handleOpenAddType}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Thêm hạng phòng
              </button>
            )}

            <button
              onClick={() => showToast('info', 'Thông báo', 'Đang kết xuất báo cáo...')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-400" />
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Tab Selector Switcher */}
        <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/20 w-fit">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-white dark:bg-[#0B0F19] text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Danh sách Phòng ({rooms.length})
          </button>
          <button
            onClick={() => { setActiveTab('types'); setSelectedRoom(null); }}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'types'
                ? 'bg-white dark:bg-[#0B0F19] text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hạng phòng & Báo giá ({roomTypes.length})
          </button>
        </div>

        {/* --- SubTab 1: Rooms Management --- */}
        {activeTab === 'rooms' && (
          <>
            {/* Summary Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-200">
              <div className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Tổng số phòng</span>
                <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 block leading-none">{rooms.length}</span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Đang trống</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block leading-none">{rooms.filter(r => r.status === 'ready').length}</span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Đang dọn dẹp</span>
                <span className="text-2xl font-extrabold text-amber-500 block leading-none">{rooms.filter(r => r.status === 'cleaning').length}</span>
              </div>

              <div className="p-4 bg-white dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center h-full">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700 dark:text-slate-350 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span>Cần kiểm tra: {rooms.filter(r => r.status === 'occupied').length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>Bảo trì: {rooms.filter(r => r.status === 'maintenance').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table and Filter Container */}
            <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
              <div className="flex flex-wrap items-center justify-between p-4 gap-4 border-b border-slate-100 dark:border-slate-850">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Tầng:</span>
                    <select
                      value={floorFilter}
                      onChange={(e) => setFloorFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      <option value="1">Tầng 1</option>
                      <option value="2">Tầng 2</option>
                      <option value="5">Tầng thượng</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Loại:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      {roomTypes.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Trạng thái:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">Tất cả</option>
                      <option value="ready">SẴN SÀNG</option>
                      <option value="cleaning">ĐANG DỌN</option>
                      <option value="occupied">ĐANG Ở</option>
                      <option value="maintenance">BẢO TRÌ</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-400">Đã chọn 0 phòng</span>
                  <button disabled className="h-9 px-4 rounded-xl bg-rose-50 text-rose-650 opacity-40 font-bold transition-all">
                    Xoá hàng loạt
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/10 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded" disabled /></th>
                      <th className="px-6 py-4">Số phòng</th>
                      <th className="px-6 py-4">Loại phòng</th>
                      <th className="px-6 py-4">Giá cơ bản</th>
                      <th className="px-6 py-4">Tiện ích</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-xs font-semibold text-slate-700 dark:text-slate-350">
                    {(() => {
                      const ITEMS_PER_PAGE = 5;
                      const totalFilteredRooms = filteredRooms.length;
                      const totalPages = Math.ceil(totalFilteredRooms / ITEMS_PER_PAGE);
                      const activePage = currentPage > totalPages ? (totalPages > 0 ? totalPages : 1) : currentPage;
                      const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
                      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFilteredRooms);
                      const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

                      return (
                        <>
                          {paginatedRooms.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                Không tìm thấy phòng phù hợp.
                              </td>
                            </tr>
                          ) : (
                            paginatedRooms.map(room => {
                              const isSelected = selectedRoom?.id === room.id;
                              return (
                                <tr 
                                  key={room.id} 
                                  onClick={() => setSelectedRoom(room)}
                                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors cursor-pointer ${
                                    isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                                  }`}
                                >
                                  <td className="px-6 py-4"><input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} disabled /></td>
                                  <td className="px-6 py-4 font-bold text-indigo-650 dark:text-indigo-400">{room.number}</td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-slate-900 dark:text-white block text-sm">{room.type}</span>
                                      <span className="text-[10px] text-slate-400 font-semibold block">Tầng {room.floor} - {room.floor === 5 ? 'Tầng thượng' : 'Hướng biển'}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                                    {room.price.toLocaleString('vi-VN')} VNĐ
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-1.5 text-slate-400 dark:text-slate-500">
                                      {room.utilities.map((util, i) => (
                                        <div key={i} className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-555 dark:text-slate-400">
                                          {renderUtilityIcon(util)}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase ${
                                      room.status === 'ready' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30' :
                                      room.status === 'occupied' ? 'bg-rose-50 text-rose-600 dark:bg-rose-955/30 dark:text-rose-400 border border-rose-100' :
                                      room.status === 'cleaning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-955/30 dark:text-amber-455 border border-amber-100' :
                                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                      {room.status === 'ready' ? 'SẴN SÀNG' :
                                       room.status === 'occupied' ? 'ĐANG Ở' :
                                       room.status === 'cleaning' ? 'ĐANG DỌN' : 'BẢO TRÌ'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleOpenEditRoom(room)}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => setDeleteConfirmId(room.id)}
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(() => {
                const ITEMS_PER_PAGE = 5;
                const totalFilteredRooms = filteredRooms.length;
                const totalPages = Math.ceil(totalFilteredRooms / ITEMS_PER_PAGE);
                const activePage = currentPage > totalPages ? (totalPages > 0 ? totalPages : 1) : currentPage;
                const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
                const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFilteredRooms);

                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-855 gap-4">
                    <span className="text-xs font-semibold text-slate-400">
                      Hiển thị {totalFilteredRooms > 0 ? startIndex + 1 : 0}–{endIndex} trên tổng số {totalFilteredRooms} phòng
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        disabled={activePage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            activePage === pageNum
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button 
                        disabled={activePage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {/* --- SubTab 2: Room Types & Rates Management --- */}
        {activeTab === 'types' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-200 pb-12">
            {roomTypes.map(type => {
              let imgUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop';
              if (type.images) {
                try {
                  const parsed = JSON.parse(type.images);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    imgUrl = parsed[0];
                  }
                } catch (e) {
                  imgUrl = type.images;
                }
              }

              return (
                <div 
                  key={type.id} 
                  className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={imgUrl} 
                      alt={type.name} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      {type.basePrice.toLocaleString('vi-VN')} đ / đêm
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {type.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                        {type.description || 'Không có mô tả chi tiết.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold text-slate-650 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-400" />
                        Sức chứa: {type.capacity} khách
                      </span>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleOpenEditType(type)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmType({ id: type.id, name: type.name })}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50/30 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Right Details Panel for Rooms */}
      {activeTab === 'rooms' && selectedRoom && (
        <div className="w-[340px] xl:w-[380px] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between shrink-0 ml-6 sticky top-6 h-[calc(100vh-150px)] shadow-sm animate-in slide-in-from-right duration-300">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="space-y-0.5">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Phòng {selectedRoom.number}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {selectedRoom.type} Ocean View
                </p>
              </div>
              <button 
                onClick={() => setSelectedRoom(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hình ảnh phòng</span>
              <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img 
                  src={selectedRoom.image} 
                  alt={selectedRoom.type} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=300&auto=format&fit=crop" alt="bathroom" className="h-full w-full object-cover" />
                </div>
                <div className="h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=300&auto=format&fit=crop" alt="bed detail" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trang thiết bị & tiện nghi</span>
              <div className="grid grid-cols-2 gap-3">
                {selectedRoom.utilities.map((util, i) => (
                  <div 
                    key={i} 
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400">
                      {renderUtilityIcon(util)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                      {getUtilityLabel(util)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-350">Giá phòng cơ bản</span>
                <span className="font-extrabold text-indigo-750 dark:text-indigo-455 text-sm">{selectedRoom.price.toLocaleString('vi-VN')} đ</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                Được kế thừa cấu hình từ phân hệ hạng phòng chuẩn.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-855 flex gap-3">
            <button
              onClick={() => handleOpenEditRoom(selectedRoom)}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              Chỉnh sửa phòng
            </button>
            <button
              onClick={() => setDeleteConfirmId(selectedRoom.id)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-500 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Room Modal (Add/Edit) */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsRoomModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {roomModalMode === 'add' ? 'Thêm phòng mới' : 'Chỉnh sửa thông tin phòng'}
            </h2>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Số phòng</label>
                  <input
                    type="text"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="Ví dụ: 102"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tầng</label>
                  <input
                    type="number"
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Hạng phòng</label>
                <select
                  value={formRoomTypeId}
                  onChange={(e) => setFormRoomTypeId(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors cursor-pointer"
                >
                  {roomTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Giá: {t.basePrice.toLocaleString('vi-VN')} VNĐ)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Trạng thái phòng</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-655 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="ready">Sẵn sàng (AVAILABLE)</option>
                  <option value="occupied">Đang ở (OCCUPIED)</option>
                  <option value="cleaning">Dọn dẹp (DIRTY)</option>
                  <option value="maintenance">Bảo trì (MAINTENANCE)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-6 flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {roomModalMode === 'add' ? 'Thêm phòng mới' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Type Modal (Add/Edit) */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsTypeModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {typeModalMode === 'add' ? 'Thêm hạng phòng mới' : 'Chỉnh sửa hạng phòng & Báo giá'}
            </h2>

            <form onSubmit={handleSaveType} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tên hạng phòng</label>
                  <input
                    type="text"
                    value={formTypeName}
                    onChange={(e) => setFormTypeName(e.target.value)}
                    placeholder="Ví dụ: Deluxe King Sea View"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Giá cơ bản (VNĐ / Đêm)</label>
                  <input
                    type="number"
                    value={formTypePrice}
                    onChange={(e) => setFormTypePrice(Number(e.target.value))}
                    min={0}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Sức chứa tối đa (khách)</label>
                  <input
                    type="number"
                    value={formTypeCapacity}
                    onChange={(e) => setFormTypeCapacity(Number(e.target.value))}
                    min={1}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">URL Ảnh minh họa</label>
                  <input
                    type="url"
                    value={formTypeImage}
                    onChange={(e) => setFormTypeImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Mô tả chi tiết</label>
                <textarea
                  value={formTypeDescription}
                  onChange={(e) => setFormTypeDescription(e.target.value)}
                  placeholder="Mô tả các đặc điểm nổi bật của hạng phòng..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-6 flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {typeModalMode === 'add' ? 'Tạo mới hạng phòng' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Xác nhận xóa phòng</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Bạn có chắc chắn muốn xóa phòng này khỏi hệ thống? Thao tác này không thể hoàn tác.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => executeDeleteRoom(deleteConfirmId)}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Room Type Confirmation Modal */}
      {deleteConfirmType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-955/30 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Xóa hạng phòng?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Bạn đang yêu cầu xóa hạng phòng **"{deleteConfirmType.name}"**. Thao tác này sẽ xóa vĩnh viễn cấu hình báo giá hạng phòng này.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmType(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => executeDeleteType(deleteConfirmType.id)}
                className="flex-1 h-10 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
