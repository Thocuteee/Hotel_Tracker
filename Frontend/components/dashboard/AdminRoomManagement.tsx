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
  Users,
  Star,
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
  discount?: number;
  discountStart?: string;
  discountEnd?: string;
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
  const [activeTab, setActiveTab] = useState<'types' | 'rooms'>('types');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters for Rooms
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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

  // View Details Modal states
  const [isViewTypeModalOpen, setIsViewTypeModalOpen] = useState(false);
  const [viewedRoomType, setViewedRoomType] = useState<RoomType | null>(null);

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
  const [formTypeDiscount, setFormTypeDiscount] = useState(0);
  const [formTypeDiscountStart, setFormTypeDiscountStart] = useState('');
  const [formTypeDiscountEnd, setFormTypeDiscountEnd] = useState('');
  const [timeForCountdown, setTimeForCountdown] = useState(new Date());

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setTimeForCountdown(new Date());
    }, 10000);
    return () => clearInterval(interval);
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

  const getRoomTypeImage = (imagesStr: string | undefined | null): string => {
    const fallback = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop';
    if (!imagesStr) return fallback;
    let trimmed = imagesStr.trim();
    if (!trimmed) return fallback;

    // Check if it is a JSON array or quoted string
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        trimmed = parsed[0].trim();
      } else if (typeof parsed === 'string') {
        trimmed = parsed.trim();
      }
    } catch (e) {
      const match = trimmed.match(/"(https?:\/\/[^"]+)"/);
      if (match) trimmed = match[1].trim();
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      let actualUrl = trimmed;
      if (trimmed.includes('imgurl=')) {
        try {
          const urlObj = new URL(trimmed);
          const imgUrlParam = urlObj.searchParams.get('imgurl');
          if (imgUrlParam) {
            actualUrl = decodeURIComponent(imgUrlParam);
          }
        } catch (err) {
          const match = trimmed.match(/[?&]imgurl=([^&]+)/);
          if (match && match[1]) {
            actualUrl = decodeURIComponent(match[1]);
          }
        }
      }
      // If it's a hotlink-protected image or google image, use weserv proxy to bypass referrer blocks!
      if (!actualUrl.includes('images.unsplash.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(actualUrl)}`;
      }
      return actualUrl;
    }

    return fallback;
  };

  const getDiscountTimeRemaining = (endTimeStr: string | undefined): string | null => {
    if (!endTimeStr) return null;
    const diff = new Date(endTimeStr).getTime() - timeForCountdown.getTime();
    if (diff <= 0) return 'Đã hết hạn';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Còn ${days} ngày`;
    }
    return `Còn ${hours}g ${mins}p`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const typesRes = await api.get('/api/v1/room-types');
      const roomsRes = await api.get('/api/v1/rooms');

      setRoomTypes(typesRes.data);

      const mappedRooms = roomsRes.data.map((r: any) => {
        const imageUrl = getRoomTypeImage(r.roomType?.images);

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

  const handleRoomNumberChange = (val: string) => {
    setFormNumber(val);
    const num = val.trim();
    if (num && /^\d+$/.test(num)) {
      if (num.length >= 3) {
        // "401" -> floor 4, "1002" -> floor 10
        const floorGuess = parseInt(num.substring(0, num.length - 2), 10);
        if (floorGuess >= 1 && floorGuess <= 20) {
          setFormFloor(floorGuess);
        }
      } else if (num.length === 2 || num.length === 1) {
        // "12" -> floor 1
        const floorGuess = parseInt(num.substring(0, 1), 10);
        if (floorGuess >= 1 && floorGuess <= 20) {
          setFormFloor(floorGuess);
        }
      }
    } else if (num && num.length > 1) {
      // If prefix layout like "A102"
      const match = num.match(/[A-Za-z]+(\d+)/);
      if (match && match[1]) {
        const digits = match[1];
        if (digits.length >= 3) {
          const floorGuess = parseInt(digits.substring(0, digits.length - 2), 10);
          if (floorGuess >= 1 && floorGuess <= 20) {
            setFormFloor(floorGuess);
          }
        }
      }
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
    setFormTypeDiscount(0);
    setFormTypeDiscountStart('');
    setFormTypeDiscountEnd('');
    setIsTypeModalOpen(true);
  };

  const handleViewType = (type: RoomType) => {
    setViewedRoomType(type);
    setIsViewTypeModalOpen(true);
  };

  const handleOpenEditType = (type: RoomType) => {
    setTypeModalMode('edit');
    setEditingTypeId(type.id);
    setFormTypeName(type.name);
    setFormTypePrice(type.basePrice);
    setFormTypeCapacity(type.capacity);
    setFormTypeDescription(type.description);
    setFormTypeDiscount(type.discount || 0);
    setFormTypeDiscountStart(type.discountStart ? type.discountStart.substring(0, 16) : '');
    setFormTypeDiscountEnd(type.discountEnd ? type.discountEnd.substring(0, 16) : '');
    
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
      images: JSON.stringify([formTypeImage.trim()]),
      discount: formTypeDiscount,
      discountStart: formTypeDiscountStart ? formTypeDiscountStart : null,
      discountEnd: formTypeDiscountEnd ? formTypeDiscountEnd : null
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
      case 'wifi': return <Wifi className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'snow': return <Snowflake className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'tv': return <Tv className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'coffee': return <Coffee className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      case 'key': return <Key className="h-4 w-4 text-violet-600 dark:text-violet-400" />;
      default: return null;
    }
  };

  const getUtilityLabel = (util: string) => {
    switch (util) {
      case 'wifi': return 'Free WiFi';
      case 'snow': return 'Aircon';
      case 'tv': return 'Smart TV';
      case 'coffee': return 'Nespresso';
      case 'key': return 'Card Key';
      default: return 'Amenities';
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter(room => {
    if (statusFilter !== 'all' && room.status !== statusFilter) return false;
    if (typeFilter !== 'all' && room.type !== typeFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return room.number.includes(query) || room.type.toLowerCase().includes(query);
    }
    return true;
  });

  const filteredTypes = roomTypes.filter(t => {
    if (searchQuery) {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Group rooms by floor descending for Room Grid View
  const roomsByFloor: Record<number, Room[]> = {};
  filteredRooms.forEach(room => {
    if (!roomsByFloor[room.floor]) {
      roomsByFloor[room.floor] = [];
    }
    roomsByFloor[room.floor].push(room);
  });
  const sortedFloors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a);

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
        
        {/* --- SubTab Switcher matching Sidebar design tabs --- */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex gap-6">
            <button
              onClick={() => { setActiveTab('types'); setSelectedRoom(null); }}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'types'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Room Types
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === 'rooms'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Room Grid
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative h-9 w-60">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'types' ? "Search room types..." : "Search rooms or guests..."}
                className="h-full w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>

            {activeTab === 'types' ? (
              <button
                onClick={handleOpenAddType}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add New Room Type
              </button>
            ) : (
              <button
                onClick={handleOpenAddRoom}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add New Room
              </button>
            )}
          </div>
        </div>

        {/* --- View 1: Room Type Catalog --- */}
        {activeTab === 'types' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Catalog Info Block */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Room Type Catalog</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Configure and manage your property's room categories. This menu serves as the digital catalog for both staff and walk-in guests.
              </p>
            </div>

            {/* Quick Tag Filters */}
            <div className="flex gap-2">
              {['All Suites', 'Deluxe', 'Ocean Front', 'Executive', 'Penthouse'].map((tag, idx) => (
                <span 
                  key={idx}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                    idx === 0 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredTypes.map((type, index) => {
                const imgUrl = getRoomTypeImage(type.images);
                const totalRoomsCount = rooms.filter(r => r.roomTypeId === type.id).length;
                
                const startValid = !type.discountStart || new Date(type.discountStart) <= timeForCountdown;
                const endValid = !type.discountEnd || new Date(type.discountEnd) >= timeForCountdown;
                const hasDiscount = !!type.discount && type.discount > 0 && startValid && endValid;
                const finalPrice = hasDiscount ? type.basePrice * (1 - (type.discount ?? 0) / 100) : type.basePrice;

                // Layout 1: Executive Ocean Suite (Featured layout - First item)
                if (index === 0) {
                  return (
                    <div 
                      key={type.id} 
                      className="col-span-full bg-white dark:bg-[#0B0F19] rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:h-80"
                    >
                      <div className="relative w-full md:w-1/2 h-56 md:h-full bg-slate-150">
                        <img 
                          src={imgUrl} 
                          alt={type.name} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          {hasDiscount && (
                            <>
                              <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm">
                                ƯU ĐÃI -{type.discount}%
                              </span>
                              {type.discountEnd && (
                                <span className="bg-black/60 backdrop-blur-sm text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                                  {getDiscountTimeRemaining(type.discountEnd)}
                                </span>
                              )}
                            </>
                          )}
                          <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm">
                            BEST SELLER
                          </span>
                          <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm">
                            RECOMMENDED
                          </span>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                              {type.name}
                            </h3>
                            <div className="flex gap-1.5">
                              <button 
                                onClick={() => handleOpenEditType(type)}
                                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmType({ id: type.id, name: type.name })}
                                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div className="flex gap-4 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-slate-400" />
                              {type.capacity} Người lớn, 1 Trẻ em
                            </span>
                            <span>•</span>
                            <span>{type.name.includes('Penthouse') ? '120 m²' : '85 m²'}</span>
                          </div>

                          {/* Utilities list */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {getUtilitiesForType(type.name).map((util, i) => (
                              <span 
                                key={i}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-[10px] font-extrabold"
                              >
                                {renderUtilityIcon(util)}
                                {getUtilityLabel(util)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Price rate and action */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">GIÁ CƠ BẢN / ĐÊM</span>
                            <div className="flex items-baseline gap-2">
                              {hasDiscount ? (
                                <>
                                  <span className="text-sm font-bold text-slate-400 line-through">
                                    {type.basePrice.toLocaleString('vi-VN')} đ
                                  </span>
                                  <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 leading-none">
                                    {finalPrice.toLocaleString('vi-VN')} VND
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
                                  {type.basePrice.toLocaleString('vi-VN')} VND
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleViewType(type)}
                            className="px-5 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Layout 2: Standard/Deluxe grid layouts (Including index >= 1)
                return (
                  <div 
                    key={type.id} 
                    className="bg-white dark:bg-[#0B0F19] rounded-[24px] border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between h-[340px]"
                  >
                    <div className="relative h-40 w-full bg-slate-100">
                      <img 
                        src={imgUrl} 
                        alt={type.name} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[90%]">
                        {hasDiscount && (
                          <>
                            <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                              -{type.discount}%
                            </span>
                            {type.discountEnd && (
                              <span className="bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                {getDiscountTimeRemaining(type.discountEnd)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {totalRoomsCount} ROOMS AVAILABLE
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug truncate pr-3">
                            {type.name}
                          </h3>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleOpenEditType(type)}
                              className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmType({ id: type.id, name: type.name })}
                              className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          {type.capacity} Người lớn • {type.name.includes('Penthouse') ? '120 m²' : type.name.includes('Family') ? '65 m²' : '45 m²'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex flex-col">
                          {hasDiscount ? (
                            <>
                              <span className="text-[10px] font-bold text-slate-400 line-through leading-none mb-1">
                                {type.basePrice.toLocaleString('vi-VN')} đ
                              </span>
                              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 leading-none">
                                {finalPrice.toLocaleString('vi-VN')} <span className="text-[10px] font-bold">VND</span>
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                              {type.basePrice.toLocaleString('vi-VN')} <span className="text-[10px] font-bold text-slate-400">VND</span>
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleViewType(type)}
                          className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add Category Dotted Card */}
              <div 
                onClick={handleOpenAddType}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-600/50 dark:hover:border-indigo-400/50 rounded-[24px] p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-colors h-[340px]"
              >
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Add Category</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold leading-relaxed max-w-[200px]">
                    Expand your property offerings with a new room type.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- View 2: Physical Room Grid (Floor-grouped) --- */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Title */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Physical Room Grid</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Real-time occupancy and status dashboard.
              </p>
            </div>

            {/* Quick Filters Row */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 pb-2">
              <div className="flex items-center gap-2">
                <span>Status Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="ready">READY</option>
                  <option value="occupied">OCCUPIED</option>
                  <option value="cleaning">CLEANING</option>
                  <option value="maintenance">MAINTENANCE</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Room Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {roomTypes.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Floor Grouped Layout */}
            <div className="space-y-8 pb-12">
              {sortedFloors.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  No rooms found matching the search criteria.
                </div>
              ) : (
                sortedFloors.map(floor => (
                  <div key={floor} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        FLOOR {String(floor).padStart(2, '0')}
                      </span>
                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {roomsByFloor[floor].map(room => {
                        const isSelected = selectedRoom?.id === room.id;
                        
                        // Status styling properties
                        let borderLeftColor = 'border-l-indigo-600';
                        let badgeBgColor = 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-455';
                        let statusText = 'READY';

                        if (room.status === 'occupied') {
                          borderLeftColor = 'border-l-slate-400 dark:border-l-slate-600';
                          badgeBgColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
                          statusText = 'OCCUPIED';
                        } else if (room.status === 'cleaning') {
                          borderLeftColor = 'border-l-amber-500';
                          badgeBgColor = 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
                          statusText = 'CLEANING';
                        } else if (room.status === 'maintenance') {
                          borderLeftColor = 'border-l-rose-500';
                          badgeBgColor = 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400';
                          statusText = 'MAINTENANCE';
                        }

                        return (
                          <div 
                            key={room.id} 
                            onClick={() => setSelectedRoom(room)}
                            className={`bg-white dark:bg-[#0B0F19] rounded-2xl border-y border-r border-l-[4px] border-slate-200/60 dark:border-slate-800/80 ${borderLeftColor} p-5 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer ${
                              isSelected ? 'ring-2 ring-indigo-600/35 dark:ring-indigo-400/30' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="text-base font-extrabold text-slate-900 dark:text-white shrink-0">
                                {room.number}
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-md tracking-wider uppercase leading-none shrink-0 ${badgeBgColor}`}>
                                {statusText}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                              {room.type}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Right Details Panel for Rooms */}
      {selectedRoom && (
        <div className="w-[340px] xl:w-[380px] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-[24px] flex flex-col justify-between shrink-0 ml-6 sticky top-6 h-[calc(100vh-150px)] shadow-sm animate-in slide-in-from-right duration-300">
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-855">
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

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hình ảnh phòng</span>
              <div className="h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img 
                  src={selectedRoom.image} 
                  alt={selectedRoom.type} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=300&auto=format&fit=crop" alt="bathroom" className="h-full w-full object-cover" />
                </div>
                <div className="h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=300&auto=format&fit=crop" alt="bed detail" className="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Trang thiết bị & tiện nghi</span>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.utilities.map((util, i) => (
                  <span 
                    key={i} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-955/20 text-violet-750 dark:text-violet-400 text-[10px] font-extrabold border border-violet-100/40 dark:border-violet-900/30"
                  >
                    {renderUtilityIcon(util)}
                    {getUtilityLabel(util)}
                  </span>
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
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all active:scale-[0.98] cursor-pointer"
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
                    onChange={(e) => handleRoomNumberChange(e.target.value)}
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
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-6 flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {roomModalMode === 'add' ? 'Thêm phòng mới' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Type View Details Modal */}
      {isViewTypeModalOpen && viewedRoomType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsViewTypeModalOpen(false)}
              className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="h-64 w-full bg-slate-100 relative">
              {(() => {
                let imgUrl = viewedRoomType.images || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200&auto=format&fit=crop';
                try {
                  const parsed = JSON.parse(viewedRoomType.images);
                  if (parsed && parsed.length > 0) imgUrl = parsed[0];
                } catch(e) {}
                return (
                  <img src={imgUrl} alt={viewedRoomType.name} className="h-full w-full object-cover" />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                  {viewedRoomType.name}
                </h2>
                <div className="flex gap-4 text-sm font-medium text-slate-200 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {viewedRoomType.capacity} Người lớn
                  </span>
                  <span>•</span>
                  <span>{viewedRoomType.name.includes('Penthouse') ? '120 m²' : viewedRoomType.name.includes('Family') ? '65 m²' : '45 m²'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mô tả phòng</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {viewedRoomType.description || "Chưa có mô tả chi tiết cho hạng phòng này."}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">GIÁ CƠ BẢN / ĐÊM</span>
                  {viewedRoomType.discount && viewedRoomType.discount > 0 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-slate-400 line-through">
                        {viewedRoomType.basePrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 leading-none mt-1">
                        {(viewedRoomType.basePrice * (1 - viewedRoomType.discount / 100)).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none block">
                      {viewedRoomType.basePrice.toLocaleString('vi-VN')} VND
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tiện ích bao gồm</h3>
                <div className="flex flex-wrap gap-2">
                  {getUtilitiesForType(viewedRoomType.name).map((util, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold"
                    >
                      {renderUtilityIcon(util)}
                      {getUtilityLabel(util)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setIsViewTypeModalOpen(false)}
                  className="px-5 h-11 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setIsViewTypeModalOpen(false);
                    handleOpenEditType(viewedRoomType);
                  }}
                  className="px-5 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  Chỉnh sửa hạng phòng
                </button>
              </div>
            </div>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Giảm giá (%)</label>
                  <input
                    type="number"
                    value={formTypeDiscount}
                    onChange={(e) => setFormTypeDiscount(Number(e.target.value))}
                    min={0}
                    max={99}
                    placeholder="Ví dụ: 10"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formTypeDiscountStart}
                    onChange={(e) => setFormTypeDiscountStart(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formTypeDiscountEnd}
                    onChange={(e) => setFormTypeDiscountEnd(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-650 focus:outline-none transition-colors"
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
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
