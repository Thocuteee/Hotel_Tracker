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
  Wrench, 
  Key, 
  Bed,
  Brush,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import api from '@/lib/api';

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
  type: 'Deluxe King' | 'Suite Premium' | 'Standard Twin' | 'Penthouse Suite';
  floor: number;
  utilities: string[];
  price: number;
  status: 'ready' | 'occupied' | 'cleaning' | 'maintenance';
  image: string;
  roomTypeId: number;
}

export default function AdminRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'Deluxe King' | 'Suite Premium' | 'Standard Twin'>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  // Form states
  const [formNumber, setFormNumber] = useState('');
  const [formRoomTypeId, setFormRoomTypeId] = useState<number>(0);
  const [formFloor, setFormFloor] = useState(1);
  const [formStatus, setFormStatus] = useState<Room['status']>('ready');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const getUtilitiesForType = (typeName: string): string[] => {
    switch (typeName) {
      case 'Standard Twin': return ['wifi', 'snow', 'tv'];
      case 'Deluxe King': return ['wifi', 'snow', 'tv', 'coffee'];
      case 'Suite Premium': return ['wifi', 'snow', 'coffee', 'key'];
      case 'Penthouse Suite': return ['wifi', 'snow', 'tv', 'coffee', 'key'];
      default: return ['wifi', 'snow'];
    }
  };

  const seedDefaultData = async () => {
    try {
      // 1. Seed Room Types if empty
      const defaultTypes = [
        {
          name: 'Standard Twin',
          basePrice: 850000,
          capacity: 2,
          description: 'Phòng đơn tiêu chuẩn với đầy đủ tiện nghi',
          images: JSON.stringify(['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600&auto=format&fit=crop'])
        },
        {
          name: 'Deluxe King',
          basePrice: 1200000,
          capacity: 2,
          description: 'Phòng Deluxe rộng rãi với giường cỡ King hướng vườn',
          images: JSON.stringify(['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop'])
        },
        {
          name: 'Suite Premium',
          basePrice: 2500000,
          capacity: 4,
          description: 'Phòng Suite sang trọng hướng biển, có phòng khách riêng',
          images: JSON.stringify(['https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop'])
        },
        {
          name: 'Penthouse Suite',
          basePrice: 5000000,
          capacity: 6,
          description: 'Căn hộ Penthouse đẳng cấp thượng lưu với bể bơi riêng biệt',
          images: JSON.stringify(['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop'])
        }
      ];

      const createdTypes: RoomType[] = [];
      for (const t of defaultTypes) {
        const res = await api.post('/api/v1/room-types', t);
        createdTypes.push(res.data);
      }

      // 2. Seed Rooms
      const defaultRooms = [
        { roomNumber: '101', roomTypeId: createdTypes.find(t => t.name === 'Deluxe King')?.id, status: 'AVAILABLE', floor: 1 },
        { roomNumber: '204', roomTypeId: createdTypes.find(t => t.name === 'Suite Premium')?.id, status: 'OCCUPIED', floor: 2 },
        { roomNumber: '302', roomTypeId: createdTypes.find(t => t.name === 'Standard Twin')?.id, status: 'DIRTY', floor: 3 },
        { roomNumber: '401', roomTypeId: createdTypes.find(t => t.name === 'Penthouse Suite')?.id, status: 'MAINTENANCE', floor: 4 }
      ];

      for (const r of defaultRooms) {
        if (r.roomTypeId) {
          await api.post('/api/v1/rooms', r);
        }
      }
    } catch (e) {
      console.error('Error seeding default data:', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let typesRes = await api.get('/api/v1/room-types');
      let roomsRes = await api.get('/api/v1/rooms');

      // Auto seed if database is empty
      if (typesRes.data.length === 0) {
        await seedDefaultData();
        typesRes = await api.get('/api/v1/room-types');
        roomsRes = await api.get('/api/v1/rooms');
      }

      setRoomTypes(typesRes.data);

      const mappedRooms = roomsRes.data.map((r: any) => {
        let imageUrl = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=200&auto=format&fit=crop';
        if (r.roomType?.images) {
          try {
            const parsed = JSON.parse(r.roomType.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imageUrl = parsed[0];
            }
          } catch (e) {
            // Fallback if not valid JSON
            if (typeof r.roomType.images === 'string' && r.roomType.images.startsWith('http')) {
              imageUrl = r.roomType.images;
            }
          }
        }

        // Map status
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
          roomTypeId: r.roomType?.id || 0
        };
      });

      setRooms(mappedRooms);
    } catch (e) {
      console.error('Error fetching room data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormNumber('');
    if (roomTypes.length > 0) {
      setFormRoomTypeId(roomTypes[0].id);
    }
    setFormFloor(1);
    setFormStatus('ready');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setModalMode('edit');
    setSelectedRoomId(room.id);
    setFormNumber(room.number);
    setFormRoomTypeId(room.roomTypeId);
    setFormFloor(room.floor);
    setFormStatus(room.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await api.delete(`/api/v1/rooms/${id}`);
        setRooms(prev => prev.filter(r => r.id !== id));
      } catch (e) {
        console.error(e);
        alert('Không thể xóa phòng này. Vui lòng kiểm tra lại đơn đặt phòng liên quan.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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
      if (modalMode === 'add') {
        const res = await api.post('/api/v1/rooms', payload);
        const newRoom = res.data;
        // Refetch to get complete RoomType mapping
        await fetchData();
      } else if (modalMode === 'edit' && selectedRoomId) {
        await api.updateRoom || await api.put(`/api/v1/rooms/${selectedRoomId}`, payload);
        await fetchData();
      }
      setIsModalOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Có lỗi xảy ra trong quá trình lưu thông tin phòng.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderUtilityIcon = (util: string) => {
    switch (util) {
      case 'wifi': return <Wifi className="h-3.5 w-3.5" title="Wifi miễn phí" />;
      case 'snow': return <Snowflake className="h-3.5 w-3.5" title="Điều hòa lạnh" />;
      case 'tv': return <Tv className="h-3.5 w-3.5" title="Tivi truyền hình" />;
      case 'coffee': return <Coffee className="h-3.5 w-3.5" title="Cà phê/Đồ uống" />;
      case 'key': return <Key className="h-3.5 w-3.5" title="Khóa thẻ từ" />;
      default: return null;
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (selectedTab !== 'all' && room.type !== selectedTab) return false;
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản lý danh mục phòng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem và điều chỉnh thông tin phòng của khách sạn Lumiere.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm phòng mới
        </button>
      </div>

      {/* Filters and List */}
      <div className="bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-slate-100 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả phòng' },
              { id: 'Deluxe King', label: 'Phòng Deluxe' },
              { id: 'Suite Premium', label: 'Phòng Suite' },
              { id: 'Standard Twin', label: 'Phòng Standard' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  selectedTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số phòng..."
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số phòng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Loại phòng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tầng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tiện ích</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá cơ bản</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Không tìm thấy phòng phù hợp.
                  </td>
                </tr>
              ) : (
                filteredRooms.map(room => (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{room.number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                          <img src={room.image} alt={room.type} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">{room.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">{room.floor}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-slate-400 dark:text-slate-500">
                        {room.utilities.map((util, i) => (
                          <div 
                            key={i} 
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                          >
                            {renderUtilityIcon(util)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                      {room.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        room.status === 'ready' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        room.status === 'occupied' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
                        room.status === 'cleaning' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        {room.status === 'ready' ? 'Sẵn sàng' :
                         room.status === 'occupied' ? 'Đang ở' :
                         room.status === 'cleaning' ? 'Dọn dẹp' : 'Bảo trì'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                          title="Xóa phòng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PaginationFooter */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 gap-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Hiển thị {filteredRooms.length} trên {rooms.length} phòng
          </span>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              2
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              3
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Stats overview footer */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Tổng số phòng', val: rooms.length, icon: Bed, color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' },
          { title: 'Đang sử dụng', val: rooms.filter(r => r.status === 'occupied').length, icon: Key, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' },
          { title: 'Đang dọn dẹp', val: rooms.filter(r => r.status === 'cleaning').length, icon: Brush, color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' },
          { title: 'Bảo trì', val: rooms.filter(r => r.status === 'maintenance').length, icon: Wrench, color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50' }
        ].map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-[#0B0F19] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.title}</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{card.val}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${card.color}`}>
                <CardIcon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {modalMode === 'add' ? 'Thêm phòng mới' : 'Chỉnh sửa thông tin phòng'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Số phòng</label>
                  <input
                    type="text"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="Ví dụ: 102"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors"
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
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Loại phòng</label>
                <select
                  value={formRoomTypeId}
                  onChange={(e) => setFormRoomTypeId(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors cursor-pointer"
                >
                  {roomTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Trạng thái</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none transition-colors cursor-pointer"
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
                {modalMode === 'add' ? 'Thêm phòng mới' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
