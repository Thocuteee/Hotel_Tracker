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
    imageUrl: ''
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
        imageUrl: branch.imageUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', phone: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await api.put(`/api/v1/branches/${editingId}`, formData);
      } else {
        await api.post('/api/v1/branches', formData);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Chi Nhánh</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thêm mới, sửa, và xóa thông tin các chi nhánh khách sạn.
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{branch.name}</h3>
                <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">SĐT:</span>
                    <span>{branch.phone}</span>
                  </div>
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? 'Chỉnh sửa Chi nhánh' : 'Thêm Chi nhánh mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại *</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600"
                />
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

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
