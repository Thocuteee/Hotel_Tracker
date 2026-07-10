"use client"

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  propertyType?: string;
  status?: string;
  starRating?: number;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    imageUrl: '',
    propertyType: 'HOTEL',
    status: 'ACTIVE',
    starRating: 4,
    email: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/api/v1/branches');
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingId(branch.id);
      setFormData({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        imageUrl: branch.imageUrl || '',
        propertyType: branch.propertyType || 'HOTEL',
        status: branch.status || 'ACTIVE',
        starRating: branch.starRating || 4,
        email: branch.email || '',
        checkInTime: branch.checkInTime || '14:00',
        checkOutTime: branch.checkOutTime || '12:00',
        latitude: branch.latitude !== undefined && branch.latitude !== null ? String(branch.latitude) : '',
        longitude: branch.longitude !== undefined && branch.longitude !== null ? String(branch.longitude) : ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        imageUrl: '',
        propertyType: 'HOTEL',
        status: 'ACTIVE',
        starRating: 4,
        email: '',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        latitude: '',
        longitude: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        starRating: Number(formData.starRating),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null
      };
      if (editingId) {
        await api.put(`/api/v1/branches/${editingId}`, payload);
      } else {
        await api.post('/api/v1/branches', payload);
      }
      await fetchBranches();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save branch", err);
      alert("Lỗi khi lưu chi nhánh");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) return;
    try {
      await api.delete(`/api/v1/branches/${id}`);
      await fetchBranches();
    } catch (err) {
      console.error("Failed to delete branch", err);
      alert("Lỗi khi xóa chi nhánh");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Chi Nhánh (Admin)</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thêm mới, sửa, và cấu hình thông tin các chi nhánh khách sạn / chỗ nghỉ.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Thêm chi nhánh mới
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="h-48 relative bg-slate-100 dark:bg-slate-800">
                {branch.imageUrl ? (
                  <img src={branch.imageUrl} alt={branch.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(branch)}
                    className="p-2 bg-white/90 backdrop-blur text-indigo-600 rounded-lg hover:bg-white shadow-sm transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(branch.id)}
                    className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-lg hover:bg-white shadow-sm transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{branch.name}</h3>
                  <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-md font-semibold">
                    {branch.propertyType === 'HOTEL' ? 'Khách sạn' :
                     branch.propertyType === 'APARTMENT' ? 'Căn hộ' :
                     branch.propertyType === 'RESORT' ? 'Resort' :
                     branch.propertyType === 'VILLA' ? 'Biệt thự' :
                     branch.propertyType === 'CABIN' ? 'Nhà gỗ' : branch.propertyType || 'Khách sạn'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">SĐT:</span>
                    <span>{branch.phone}</span>
                  </div>
                  {branch.starRating && (
                    <div className="flex items-center gap-1 text-amber-500">
                      {'★'.repeat(branch.starRating)}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a href={`/admin/branches/${branch.id}`} className="block w-full text-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold py-2 rounded-xl transition-colors">
                    Quản lý chi tiết &rarr;
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Chỉnh sửa Chi nhánh' : 'Thêm Chi nhánh mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tên chi nhánh *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="VD: Lumiere Đà Lạt"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Địa chỉ *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="example@hotel.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Loại chỗ nghỉ *</label>
                  <select 
                    value={formData.propertyType}
                    onChange={e => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value="HOTEL">Khách sạn</option>
                    <option value="APARTMENT">Căn hộ</option>
                    <option value="RESORT">Resort</option>
                    <option value="VILLA">Biệt thự</option>
                    <option value="CABIN">Nhà gỗ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số sao *</label>
                  <select 
                    value={formData.starRating}
                    onChange={e => setFormData({...formData, starRating: Number(e.target.value)})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                  >
                    <option value={1}>1 Sao</option>
                    <option value={2}>2 Sao</option>
                    <option value={3}>3 Sao</option>
                    <option value={4}>4 Sao</option>
                    <option value={5}>5 Sao</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Giờ Check-in *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.checkInTime}
                    onChange={e => setFormData({...formData, checkInTime: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="14:00"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Giờ Check-out *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.checkOutTime}
                    onChange={e => setFormData({...formData, checkOutTime: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="12:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Vĩ độ (Latitude)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.latitude}
                    onChange={e => setFormData({...formData, latitude: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="VD: 10.7769"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kinh độ (Longitude)</label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.longitude}
                    onChange={e => setFormData({...formData, longitude: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                    placeholder="VD: 106.7009"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái *</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
                  <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Link ảnh bìa (URL) *</label>
                <input 
                  type="url" 
                  required
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {formData.imageUrl && (
                <div className="mt-2 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Chi nhánh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
