"use client"

import { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';

interface Branch {
  id: number;
  name: string;
}

interface RoomType {
  id: number;
  name: string;
  basePrice: number;
  capacity: number;
  discount: number;
  isRecommended: boolean;
  branch: Branch;
  images: string;
}

export default function AdminRoomTypesManagement() {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', basePrice: 0, capacity: 2, description: '', images: '',
    discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
    cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
    allowSmoking: false, allowPets: false, extraBedAllowed: false,
    branchId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rtRes, branchRes] = await Promise.all([
        api.get('/api/v1/room-types'),
        api.get('/api/v1/branches')
      ]);
      setRoomTypes(rtRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (rt?: any) => {
    if (rt) {
      setEditingId(rt.id);
      setFormData({
        name: rt.name, basePrice: rt.basePrice, capacity: rt.capacity, description: rt.description || '', images: rt.images || '',
        discount: rt.discount || 0, isFeatured: rt.isFeatured || false, isPublic: rt.isPublic !== false, status: rt.status || 'AVAILABLE',
        cancellationPolicy: rt.cancellationPolicy || '', checkInTime: rt.checkInTime || '14:00', checkOutTime: rt.checkOutTime || '12:00',
        allowSmoking: rt.allowSmoking || false, allowPets: rt.allowPets || false, extraBedAllowed: rt.extraBedAllowed || false,
        branchId: String(rt.branchId)
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', basePrice: 0, capacity: 2, description: '', images: '',
        discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
        cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
        allowSmoking: false, allowPets: false, extraBedAllowed: false,
        branchId: branches[0]?.id ? String(branches[0].id) : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId) {
      alert("Vui lòng chọn chi nhánh!");
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedCheckIn = formData.checkInTime.length === 5 ? formData.checkInTime + ':00' : formData.checkInTime;
      const formattedCheckOut = formData.checkOutTime.length === 5 ? formData.checkOutTime + ':00' : formData.checkOutTime;
      
      let imagesJson = formData.images;
      if (imagesJson && !imagesJson.trim().startsWith('[')) {
          imagesJson = JSON.stringify(imagesJson.split(',').map(s => s.trim()).filter(s => s));
      }

      const payload = { 
        ...formData, 
        checkInTime: formattedCheckIn,
        checkOutTime: formattedCheckOut,
        images: imagesJson,
        branchId: Number(formData.branchId) 
      };

      if (editingId) {
        await api.put(`/api/v1/room-types/${editingId}`, payload);
      } else {
        await api.post('/api/v1/room-types', payload);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu Hạng phòng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hạng phòng này?')) return;
    try {
      await api.delete(`/api/v1/room-types/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa hạng phòng.");
    }
  };

  const handleTogglePublic = async (rt: any) => {
    try {
      const payload = { 
        ...rt,
        isPublic: !rt.isPublic 
      };
      await api.put(`/api/v1/room-types/${rt.id}`, payload);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (rt: any) => {
    try {
      const payload = { 
        ...rt,
        isFeatured: !rt.isFeatured 
      };
      await api.put(`/api/v1/room-types/${rt.id}`, payload);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRoomTypes = roomTypes.filter(rt => 
    rt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý Hạng Phòng</h1>
          <p className="text-sm text-slate-500">Tùy chỉnh Hạng phòng và cấu hình hiển thị (Đề xuất) ra ngoài trang khách hàng.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          Thêm Hạng Phòng
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm hạng phòng..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-medium">Hạng phòng</th>
                <th className="px-6 py-4 font-medium">Chi nhánh</th>
                <th className="px-6 py-4 font-medium">Giá / Giảm giá</th>
                <th className="px-6 py-4 font-medium text-center">Hiển thị trang khách</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredRoomTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy hạng phòng nào.
                  </td>
                </tr>
              ) : filteredRoomTypes.map((room) => {
                let imageUrl = "";
                try {
                  imageUrl = JSON.parse(room.images)[0];
                } catch(e) {}

                const branchName = branches.find(b => b.id === room.branchId)?.name || "N/A";

                return (
                  <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                          {imageUrl ? (
                            <img src={imageUrl} alt={room.name} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{room.name}</div>
                          <div className="text-xs text-slate-500">Sức chứa: {room.capacity} người</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {branchName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-white font-medium">{room.basePrice.toLocaleString('vi-VN')} đ</div>
                      {room.discount > 0 && (
                        <div className="text-xs text-rose-500 font-semibold">Giảm {room.discount}%</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Toggle Public */}
                        <button 
                          onClick={() => handleTogglePublic(room)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            room.isPublic 
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800' 
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {room.isPublic ? 'Công khai' : 'Ẩn'}
                        </button>

                        {/* Toggle Featured */}
                        <button 
                          onClick={() => handleToggleFeatured(room)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            room.isFeatured 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800' 
                              : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                          }`}
                        >
                          Featured
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(room)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(room.id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? 'Chỉnh sửa Hạng phòng' : 'Thêm Hạng phòng mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột 1: Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-indigo-600 border-b pb-2">1. Thông tin cơ bản</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chi nhánh *</label>
                      <select required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600">
                        <option value="">Chọn chi nhánh...</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Hạng Phòng *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá cơ bản (VND) *</label>
                      <input type="number" required min="0" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sức chứa (người) *</label>
                      <input type="number" required min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Ảnh (Cách nhau dấu phẩy)</label>
                    <input type="text" value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" placeholder="https://img1.jpg, https://img2.jpg" />
                  </div>
                </div>

                {/* Cột 2: OTA Setup */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-rose-500 border-b pb-2">2. Cấu hình OTA (Public Dashboard)</h3>
                  
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                      <span className="text-sm font-semibold">Hiển thị Public</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-amber-500 rounded" />
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Đề xuất (Featured)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái Booking</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600">
                        <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
                        <option value="UNAVAILABLE">UNAVAILABLE (Đóng)</option>
                        <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giảm giá (%)</label>
                      <input type="number" min="0" max="100" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ Check-in</label>
                      <input type="time" value={formData.checkInTime} onChange={e => setFormData({...formData, checkInTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ Check-out</label>
                      <input type="time" value={formData.checkOutTime} onChange={e => setFormData({...formData, checkOutTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.allowSmoking} onChange={e => setFormData({...formData, allowSmoking: e.target.checked})} className="rounded" /> Hút thuốc
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.allowPets} onChange={e => setFormData({...formData, allowPets: e.target.checked})} className="rounded" /> Thú cưng
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.extraBedAllowed} onChange={e => setFormData({...formData, extraBedAllowed: e.target.checked})} className="rounded" /> Giường phụ
                    </label>
                  </div>

                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-8 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Hạng Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
