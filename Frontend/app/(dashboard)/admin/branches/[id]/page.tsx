"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, Layers, BedDouble, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'room-types' | 'rooms' | 'services'>('room-types');
  const [branch, setBranch] = useState<any>(null);
  
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', basePrice: 0, capacity: 2, description: '', images: '',
    discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
    cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
    allowSmoking: false, allowPets: false, extraBedAllowed: false
  });

  useEffect(() => {
    if (params.id) {
      api.get(`/api/v1/branches/${params.id}`)
        .then(res => setBranch(res.data))
        .catch(err => console.error(err));
    }
  }, [params.id]);

  const fetchRoomTypes = async () => {
    try {
      const res = await api.get('/api/v1/room-types');
      // Filter by current branch
      const branchRoomTypes = res.data.filter((rt: any) => rt.branchId === Number(params.id));
      setRoomTypes(branchRoomTypes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'room-types' && params.id) {
      fetchRoomTypes();
    }
  }, [activeTab, params.id]);

  const handleOpenModal = (rt?: any) => {
    if (rt) {
      setEditingId(rt.id);
      setFormData({
        name: rt.name, basePrice: rt.basePrice, capacity: rt.capacity, description: rt.description || '', images: rt.images || '',
        discount: rt.discount || 0, isFeatured: rt.isFeatured || false, isPublic: rt.isPublic !== false, status: rt.status || 'AVAILABLE',
        cancellationPolicy: rt.cancellationPolicy || '', checkInTime: rt.checkInTime || '14:00', checkOutTime: rt.checkOutTime || '12:00',
        allowSmoking: rt.allowSmoking || false, allowPets: rt.allowPets || false, extraBedAllowed: rt.extraBedAllowed || false
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', basePrice: 0, capacity: 2, description: '', images: '',
        discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
        cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
        allowSmoking: false, allowPets: false, extraBedAllowed: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Format times to HH:mm:ss to ensure backend Jackson parses it correctly
      const formattedCheckIn = formData.checkInTime.length === 5 ? formData.checkInTime + ':00' : formData.checkInTime;
      const formattedCheckOut = formData.checkOutTime.length === 5 ? formData.checkOutTime + ':00' : formData.checkOutTime;
      
      // Convert comma-separated images to JSON array string for the database JSON column
      let imagesJson = formData.images;
      if (imagesJson && !imagesJson.trim().startsWith('[')) {
          imagesJson = JSON.stringify(imagesJson.split(',').map(s => s.trim()).filter(s => s));
      }

      const payload = { 
        ...formData, 
        checkInTime: formattedCheckIn,
        checkOutTime: formattedCheckOut,
        images: imagesJson,
        branchId: Number(params.id) 
      };
      
      if (editingId) {
        await api.put(`/api/v1/room-types/${editingId}`, payload);
      } else {
        await api.post('/api/v1/room-types', payload);
      }
      await fetchRoomTypes();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu Hạng phòng. Vui lòng kiểm tra console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hạng phòng này?')) return;
    try {
      await api.delete(`/api/v1/room-types/${id}`);
      await fetchRoomTypes();
    } catch (err) {
      console.error(err);
    }
  };

  const renderRoomTypesTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý Hạng Phòng</h2>
          <p className="text-sm text-slate-500">Các hạng phòng hiện có tại chi nhánh {branch?.name}</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Thêm hạng phòng
        </button>
      </div>
      
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Tên Hạng</th>
              <th className="px-4 py-3">Giá (Base)</th>
              <th className="px-4 py-3">Tình trạng</th>
              <th className="px-4 py-3">Hiển thị (Public)</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {roomTypes.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-400">Chưa có hạng phòng nào.</td></tr>
            ) : roomTypes.map(rt => (
              <tr key={rt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{rt.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rt.basePrice)}
                  {rt.discount > 0 && <span className="ml-2 text-xs text-red-500">(-{rt.discount}%)</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${rt.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {rt.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {rt.isPublic && <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full text-xs font-medium">Public</span>}
                    {rt.isFeatured && <span className="px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-xs font-medium">Featured</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleOpenModal(rt)} className="text-indigo-600 hover:text-indigo-800"><Edit className="h-4 w-4 inline" /></button>
                  <button onClick={() => handleDelete(rt.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Hạng Phòng *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600" />
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

  if (!branch) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">CHI NHÁNH</span>
            <span className="text-sm text-slate-500">ID: {branch.id}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{branch.name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" /> {branch.address}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-max">
        {[
          { id: 'info', label: 'Thông tin chung', icon: Building2 },
          { id: 'room-types', label: 'Hạng phòng', icon: Layers },
          { id: 'rooms', label: 'Phòng vật lý', icon: BedDouble },
          { id: 'services', label: 'Dịch vụ & Tiện ích', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[400px]">
        
        {activeTab === 'room-types' && renderRoomTypesTab()}

        {activeTab !== 'room-types' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-in fade-in">
            <Layers className="h-12 w-12 mb-4 opacity-20" />
            <p>Module này đang được xây dựng dựa trên phản hồi của bạn!</p>
          </div>
        )}

      </div>
    </div>
  );
}
