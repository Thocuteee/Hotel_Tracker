"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, MapPin, Layers, BedDouble, Sparkles, Plus, Edit, Trash2, 
  Globe, ShieldAlert, Heart, Calendar, Image as ImageIcon, Save, Trash, X, Check,
  Info, ShieldCheck, HelpCircle, Phone, Mail, Link as LinkIcon, AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'room-types' | 'rooms' | 'amenities' | 'services' | 'gallery' | 'policies'>('overview');
  
  // Overview Tab Form state
  const [overviewForm, setOverviewForm] = useState({
    name: '', slug: '', propertyType: 'HOTEL', starRating: 4,
    phone: '', email: '', website: '', address: '',
    latitude: 21.028511, longitude: 105.804817, imageUrl: '', status: 'ACTIVE', description: ''
  });

  const [showGpsAdvanced, setShowGpsAdvanced] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleGeocode = async () => {
    const originalAddress = overviewForm.address.trim();
    if (!originalAddress) {
      showNotification("Vui lòng nhập địa chỉ trước khi định vị!", "warning");
      return;
    }
    setIsGeocoding(true);
    
    // Helper function for geocoding a search term
    const geocodeTerm = async (term: string): Promise<{ lat: number; lon: number } | null> => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`);
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };

    // Try full address
    let result = await geocodeTerm(originalAddress);
    
    // Fallback: progressively shorten by splitting commas
    if (!result && originalAddress.includes(',')) {
      const parts = originalAddress.split(',').map(s => s.trim()).filter(s => s);
      // Fallback 1: Strip the most specific part (first part, e.g. house number or hamlet name)
      if (parts.length > 1) {
        const fallback1 = parts.slice(1).join(', ');
        result = await geocodeTerm(fallback1);
      }
      // Fallback 2: Strip first two parts
      if (!result && parts.length > 2) {
        const fallback2 = parts.slice(2).join(', ');
        result = await geocodeTerm(fallback2);
      }
      // Fallback 3: Try just the last 2 parts (usually City/Province, e.g. "Đà Lạt, Lâm Đồng")
      if (!result && parts.length > 3) {
        const fallback3 = parts.slice(parts.length - 2).join(', ');
        result = await geocodeTerm(fallback3);
      }
    }

    if (result) {
      setOverviewForm(prev => ({
        ...prev,
        latitude: result.lat,
        longitude: result.lon
      }));
      showNotification("Định vị tọa độ địa chỉ thành công!");
    } else {
      showNotification("Không tìm thấy tọa độ địa chỉ. Bạn có thể tự nhập ở cấu hình Nâng cao.", "warning");
    }
    setIsGeocoding(false);
  };

  // Policies Tab Form state
  const [policiesForm, setPoliciesForm] = useState({
    checkInTime: '14:00', checkOutTime: '12:00',
    allowSmoking: false, allowPets: false, extraBedAllowed: false,
    cancellationPolicy: ''
  });

  // Room Types
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [isRoomTypeModalOpen, setIsRoomTypeModalOpen] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<number | null>(null);
  const [roomTypeSubmitting, setRoomTypeSubmitting] = useState(false);
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '', basePrice: 0, capacity: 2, description: '', images: '',
    discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
    cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
    allowSmoking: false, allowPets: false, extraBedAllowed: false
  });

  // Physical Rooms
  const [rooms, setRooms] = useState<any[]>([]);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [roomSubmitting, setRoomSubmitting] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '', floor: 1, roomTypeId: '', bookingStatus: 'AVAILABLE', cleaningStatus: 'CLEAN', notes: ''
  });

  // Amenities Selection
  const [globalAmenities, setGlobalAmenities] = useState<any[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]);
  const [amenitySubmitting, setAmenitySubmitting] = useState(false);
  // Manage Global Amenities
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [amenityForm, setAmenityForm] = useState({ name: '', icon: 'Wifi' });

  // Paid Services Selection
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  // Manage Global Services
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingGlobalServiceId, setEditingGlobalServiceId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '', price: 0, description: '', imageUrl: '', active: true
  });

  // Gallery Tab State
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [gallerySubmitting, setGallerySubmitting] = useState(false);

  // Status message
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const fetchBranch = async () => {
    try {
      const res = await api.get(`/api/v1/branches/${params.id}`);
      const data = res.data;
      setBranch(data);
      setOverviewForm({
        name: data.name || '',
        slug: data.slug || '',
        propertyType: data.propertyType || 'HOTEL',
        starRating: data.starRating || 4,
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        address: data.address || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        imageUrl: data.imageUrl || '',
        status: data.status || 'ACTIVE',
        description: data.description || ''
      });
      setPoliciesForm({
        checkInTime: data.checkInTime || '14:00',
        checkOutTime: data.checkOutTime || '12:00',
        allowSmoking: data.allowSmoking === true || data.allowSmoking === 'true',
        allowPets: data.allowPets === true || data.allowPets === 'true',
        extraBedAllowed: data.extraBedAllowed === true || data.extraBedAllowed === 'true',
        cancellationPolicy: data.cancellationPolicy || ''
      });
      if (data.galleryImages) {
        try {
          const parsed = JSON.parse(data.galleryImages);
          if (Array.isArray(parsed)) {
            setGalleryUrls(parsed);
          } else {
            setGalleryUrls([data.imageUrl]);
          }
        } catch {
          setGalleryUrls(data.galleryImages.split(',').map((s: string) => s.trim()).filter((s: string) => s));
        }
      } else {
        setGalleryUrls([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const res = await api.get('/api/v1/room-types');
      const branchRoomTypes = res.data.filter((rt: any) => rt.branchId === Number(params.id));
      setRoomTypes(branchRoomTypes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/v1/rooms');
      const branchRooms = res.data.filter((r: any) => r.roomType && r.roomType.branchId === Number(params.id));
      setRooms(branchRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAmenities = async () => {
    try {
      const globalRes = await api.get('/api/v1/amenities');
      setGlobalAmenities(globalRes.data);
      const branchRes = await api.get(`/api/v1/branches/${params.id}/amenities`);
      setSelectedAmenityIds(branchRes.data.map((a: any) => a.id));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const globalRes = await api.get('/api/v1/services');
      setGlobalServices(globalRes.data);
      const branchRes = await api.get(`/api/v1/branches/${params.id}/services`);
      setSelectedServiceIds(branchRes.data.map((s: any) => s.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchBranch();
      fetchRoomTypes();
      fetchRooms();
      fetchAmenities();
      fetchServices();
    }
  }, [params.id]);

  const showNotification = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Submit Overview
  const handleOverviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...overviewForm,
        checkInTime: policiesForm.checkInTime,
        checkOutTime: policiesForm.checkOutTime,
        allowSmoking: policiesForm.allowSmoking,
        allowPets: policiesForm.allowPets,
        extraBedAllowed: policiesForm.extraBedAllowed,
        galleryImages: JSON.stringify(galleryUrls)
      };
      await api.put(`/api/v1/branches/${params.id}`, payload);
      await fetchBranch();
      showNotification("Cập nhật thông tin tổng quan thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi cập nhật chi nhánh.", "error");
    }
  };

  // 2. Submit Policies
  const handlePoliciesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...overviewForm,
        ...policiesForm,
        galleryImages: JSON.stringify(galleryUrls)
      };
      await api.put(`/api/v1/branches/${params.id}`, payload);
      await fetchBranch();
      showNotification("Cập nhật chính sách thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi cập nhật chính sách.", "error");
    }
  };

  // 3. Room Types CRUD
  const handleOpenRoomTypeModal = (rt?: any) => {
    if (rt) {
      setEditingRoomTypeId(rt.id);
      setRoomTypeForm({
        name: rt.name, basePrice: rt.basePrice, capacity: rt.capacity, description: rt.description || '', images: rt.images || '',
        discount: rt.discount || 0, isFeatured: rt.isFeatured || false, isPublic: rt.isPublic !== false, status: rt.status || 'AVAILABLE',
        cancellationPolicy: rt.cancellationPolicy || '', checkInTime: rt.checkInTime || '14:00', checkOutTime: rt.checkOutTime || '12:00',
        allowSmoking: rt.allowSmoking || false, allowPets: rt.allowPets || false, extraBedAllowed: rt.extraBedAllowed || false
      });
    } else {
      setEditingRoomTypeId(null);
      setRoomTypeForm({
        name: '', basePrice: 0, capacity: 2, description: '', images: '',
        discount: 0, isFeatured: false, isPublic: true, status: 'AVAILABLE',
        cancellationPolicy: '', checkInTime: '14:00', checkOutTime: '12:00',
        allowSmoking: false, allowPets: false, extraBedAllowed: false
      });
    }
    setIsRoomTypeModalOpen(true);
  };

  const handleRoomTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomTypeSubmitting(true);
    try {
      const formattedCheckIn = roomTypeForm.checkInTime.length === 5 ? roomTypeForm.checkInTime + ':00' : roomTypeForm.checkInTime;
      const formattedCheckOut = roomTypeForm.checkOutTime.length === 5 ? roomTypeForm.checkOutTime + ':00' : roomTypeForm.checkOutTime;
      
      let imagesJson = roomTypeForm.images || '';
      if (!imagesJson.trim()) {
          imagesJson = '[]';
      } else if (!imagesJson.trim().startsWith('[')) {
          imagesJson = JSON.stringify(imagesJson.split(',').map(s => s.trim()).filter(s => s));
      }

      const payload = { 
        ...roomTypeForm, 
        checkInTime: formattedCheckIn,
        checkOutTime: formattedCheckOut,
        images: imagesJson,
        branchId: Number(params.id) 
      };
      
      if (editingRoomTypeId) {
        await api.put(`/api/v1/room-types/${editingRoomTypeId}`, payload);
      } else {
        await api.post('/api/v1/room-types', payload);
      }
      await fetchRoomTypes();
      setIsRoomTypeModalOpen(false);
      showNotification("Lưu hạng phòng thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi lưu hạng phòng.", "error");
    } finally {
      setRoomTypeSubmitting(false);
    }
  };

  const handleRoomTypeDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hạng phòng này?')) return;
    try {
      await api.delete(`/api/v1/room-types/${id}`);
      await fetchRoomTypes();
      showNotification("Đã xóa hạng phòng.");
    } catch (err) {
      console.error(err);
      showNotification("Không thể xóa hạng phòng này.", "error");
    }
  };

  // 4. Physical Rooms CRUD
  const handleOpenRoomModal = (room?: any) => {
    if (room) {
      setEditingRoomId(room.id);
      setRoomForm({
        roomNumber: room.roomNumber,
        floor: room.floor,
        roomTypeId: room.roomType.id.toString(),
        bookingStatus: room.bookingStatus || 'AVAILABLE',
        cleaningStatus: room.cleaningStatus || 'CLEAN',
        notes: room.notes || ''
      });
    } else {
      setEditingRoomId(null);
      setRoomForm({
        roomNumber: '',
        floor: 1,
        roomTypeId: roomTypes[0]?.id?.toString() || '',
        bookingStatus: 'AVAILABLE',
        cleaningStatus: 'CLEAN',
        notes: ''
      });
    }
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomSubmitting(true);
    try {
      const payload = {
        roomNumber: roomForm.roomNumber,
        floor: Number(roomForm.floor),
        roomTypeId: Number(roomForm.roomTypeId),
        bookingStatus: roomForm.bookingStatus,
        cleaningStatus: roomForm.cleaningStatus,
        notes: roomForm.notes
      };

      if (editingRoomId) {
        await api.put(`/api/v1/rooms/${editingRoomId}`, payload);
      } else {
        await api.post('/api/v1/rooms', payload);
      }
      await fetchRooms();
      setIsRoomModalOpen(false);
      showNotification("Lưu phòng vật lý thành công!");
    } catch (err: any) {
      console.error(err);
      showNotification(err.response?.data?.message || "Lỗi khi lưu phòng vật lý. Số phòng có thể đã trùng lặp.", "error");
    } finally {
      setRoomSubmitting(false);
    }
  };

  const handleRoomDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng vật lý này?')) return;
    try {
      await api.delete(`/api/v1/rooms/${id}`);
      await fetchRooms();
      showNotification("Đã xóa phòng vật lý.");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi xóa phòng vật lý.", "error");
    }
  };

  // 5. Sync Amenities for Branch
  const handleToggleAmenity = (id: number) => {
    if (selectedAmenityIds.includes(id)) {
      setSelectedAmenityIds(selectedAmenityIds.filter(x => x !== id));
    } else {
      setSelectedAmenityIds([...selectedAmenityIds, id]);
    }
  };

  const handleAmenitiesSync = async () => {
    setAmenitySubmitting(true);
    try {
      await api.put(`/api/v1/branches/${params.id}/amenities`, selectedAmenityIds);
      showNotification("Đồng bộ tiện nghi chi nhánh thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi đồng bộ tiện nghi.", "error");
    } finally {
      setAmenitySubmitting(false);
    }
  };

  // Global Amenity Management
  const handleCreateGlobalAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/amenities', amenityForm);
      await fetchAmenities();
      setIsAmenityModalOpen(false);
      setAmenityForm({ name: '', icon: 'Wifi' });
      showNotification("Đã tạo tiện nghi mới!");
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Lỗi khi tạo tiện nghi.", "error");
    }
  };

  const handleDeleteGlobalAmenity = async (id: number) => {
    if (!confirm('Xóa tiện nghi này khỏi danh mục hệ thống? (Sẽ xóa liên kết của mọi chi nhánh)')) return;
    try {
      await api.delete(`/api/v1/amenities/${id}`);
      await fetchAmenities();
      showNotification("Đã xóa tiện nghi toàn hệ thống.");
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Sync Services for Branch
  const handleToggleService = (id: number) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(x => x !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleServicesSync = async () => {
    setServiceSubmitting(true);
    try {
      await api.put(`/api/v1/branches/${params.id}/services`, selectedServiceIds);
      showNotification("Đồng bộ dịch vụ có phí thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi đồng bộ dịch vụ.", "error");
    } finally {
      setServiceSubmitting(false);
    }
  };

  // Global Service Management
  const handleOpenGlobalServiceModal = (s?: any) => {
    if (s) {
      setEditingGlobalServiceId(s.id);
      setServiceForm({
        name: s.name, price: s.price, description: s.description || '', imageUrl: s.imageUrl || '', active: s.active !== false
      });
    } else {
      setEditingGlobalServiceId(null);
      setServiceForm({
        name: '', price: 0, description: '', imageUrl: '', active: true
      });
    }
    setIsServiceModalOpen(true);
  };

  const handleGlobalServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGlobalServiceId) {
        await api.put(`/api/v1/services/${editingGlobalServiceId}`, serviceForm);
      } else {
        await api.post('/api/v1/services', serviceForm);
      }
      await fetchServices();
      setIsServiceModalOpen(false);
      showNotification("Đã lưu dịch vụ toàn hệ thống!");
    } catch (err: any) {
      showNotification("Lỗi khi lưu dịch vụ.", "error");
    }
  };

  const handleDeleteGlobalService = async (id: number) => {
    if (!confirm('Xóa dịch vụ này khỏi danh mục hệ thống?')) return;
    try {
      await api.delete(`/api/v1/services/${id}`);
      await fetchServices();
      showNotification("Đã xóa dịch vụ toàn hệ thống.");
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Gallery Management
  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setGalleryUrls([...galleryUrls, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
  };

  const handleSaveGallery = async () => {
    setGallerySubmitting(true);
    try {
      const payload = {
        ...overviewForm,
        ...policiesForm,
        galleryImages: JSON.stringify(galleryUrls)
      };
      await api.put(`/api/v1/branches/${params.id}`, payload);
      await fetchBranch();
      showNotification("Lưu bộ sưu tập ảnh thành công!");
    } catch (err) {
      console.error(err);
      showNotification("Lỗi khi lưu bộ sưu tập ảnh.", "error");
    } finally {
      setGallerySubmitting(false);
    }
  };

  // Render Tabs
  const renderRoomTypesTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý Hạng Phòng</h2>
          <p className="text-sm text-slate-500">Các hạng phòng hiện có tại chi nhánh {branch?.name}</p>
        </div>
        <button onClick={() => handleOpenRoomTypeModal()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Thêm hạng phòng
        </button>
      </div>
      
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
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
              <tr key={rt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{rt.name}</td>
                <td className="px-4 py-3">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rt.basePrice)}
                  {rt.discount > 0 && <span className="ml-2 text-xs text-red-500">(-{rt.discount}%)</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rt.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
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
                  <button onClick={() => handleOpenRoomTypeModal(rt)} className="text-indigo-600 hover:text-indigo-800"><Edit className="h-4 w-4 inline animate-none" /></button>
                  <button onClick={() => handleRoomTypeDelete(rt.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 inline animate-none" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <form onSubmit={handleOverviewSubmit} className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin khách sạn</h2>
          <p className="text-sm text-slate-500">Thông tin tổng quan hiển thị trên trang công khai (OTA)</p>
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Save className="h-4 w-4" /> Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên khách sạn / Chi nhánh *</label>
            <input type="text" required value={overviewForm.name} onChange={e => setOverviewForm({...overviewForm, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug (SEO) *</label>
              <input type="text" required value={overviewForm.slug} onChange={e => setOverviewForm({...overviewForm, slug: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="hilton-saigon" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loại hình</label>
              <select value={overviewForm.propertyType} onChange={e => setOverviewForm({...overviewForm, propertyType: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white">
                <option value="HOTEL">HOTEL (Khách sạn)</option>
                <option value="HOMESTAY">HOMESTAY (Homestay)</option>
                <option value="RESORT">RESORT (Khu nghỉ dưỡng)</option>
                <option value="VILLA">VILLA (Biệt thự)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Xếp hạng Sao</label>
              <input type="number" min="1" max="5" value={overviewForm.starRating} onChange={e => setOverviewForm({...overviewForm, starRating: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái hoạt động</label>
              <select value={overviewForm.status} onChange={e => setOverviewForm({...overviewForm, status: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white">
                <option value="ACTIVE">ACTIVE (Mở cửa)</option>
                <option value="INACTIVE">INACTIVE (Đóng cửa)</option>
                <option value="MAINTENANCE">MAINTENANCE (Bảo trì sửa chữa)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hotline</label>
              <input type="text" value={overviewForm.phone} onChange={e => setOverviewForm({...overviewForm, phone: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <input type="email" value={overviewForm.email} onChange={e => setOverviewForm({...overviewForm, email: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Website khách sạn</label>
            <input type="text" value={overviewForm.website} onChange={e => setOverviewForm({...overviewForm, website: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="https://myhotel.com" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Địa chỉ *</label>
            <div className="flex gap-2">
              <input type="text" required value={overviewForm.address} onChange={e => setOverviewForm({...overviewForm, address: e.target.value})} className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="22 Hàng Buồm, Hoàn Kiếm, Hà Nội" />
              <button 
                type="button" 
                onClick={handleGeocode}
                disabled={isGeocoding}
                className="px-4 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors shrink-0"
              >
                {isGeocoding ? 'Đang quét...' : '📍 Định vị'}
              </button>
            </div>
          </div>

          {overviewForm.latitude && overviewForm.longitude && (
            <div className="mt-2 space-y-1">
              <span className="block text-xs font-bold text-slate-400">Vị trí thực tế trên bản đồ (GPS):</span>
              <iframe 
                width="100%" 
                height="220" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${overviewForm.longitude-0.005}%2C${overviewForm.latitude-0.005}%2C${overviewForm.longitude+0.005}%2C${overviewForm.latitude+0.005}&layer=mapnik&marker=${overviewForm.latitude}%2C${overviewForm.longitude}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800"
              ></iframe>
            </div>
          )}

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button 
              type="button" 
              onClick={() => setShowGpsAdvanced(!showGpsAdvanced)}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase focus:outline-none"
            >
              <span>⚙️ Cấu hình tọa độ GPS (Nâng cao)</span>
              <span>{showGpsAdvanced ? 'Thu gọn ▲' : 'Mở rộng ▼'}</span>
            </button>
            
            {showGpsAdvanced && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Latitude (Vĩ độ)</label>
                  <input type="number" step="0.000001" value={overviewForm.latitude} onChange={e => setOverviewForm({...overviewForm, latitude: Number(e.target.value)})} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Longitude (Kinh độ)</label>
                  <input type="number" step="0.000001" value={overviewForm.longitude} onChange={e => setOverviewForm({...overviewForm, longitude: Number(e.target.value)})} className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ảnh bìa khách sạn (URL)</label>
            <input type="text" value={overviewForm.imageUrl} onChange={e => setOverviewForm({...overviewForm, imageUrl: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            {overviewForm.imageUrl && (
              <img src={overviewForm.imageUrl} className="mt-2 h-28 w-full object-cover rounded-xl border" alt="Hotel Cover" />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả khách sạn</label>
            <textarea rows={4} value={overviewForm.description} onChange={e => setOverviewForm({...overviewForm, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
          </div>
        </div>
      </div>
    </form>
  );

  const renderRoomsTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quản lý Phòng vật lý</h2>
          <p className="text-sm text-slate-500">Cấu hình chi tiết số phòng, tầng và trạng thái dọn dẹp/đặt phòng</p>
        </div>
        <button onClick={() => handleOpenRoomModal()} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> Thêm phòng vật lý
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Số Phòng</th>
              <th className="px-4 py-3">Tầng</th>
              <th className="px-4 py-3">Loại Phòng</th>
              <th className="px-4 py-3">Trạng thái đặt phòng</th>
              <th className="px-4 py-3">Tình trạng dọn dẹp</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rooms.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center text-slate-400">Chưa có phòng vật lý nào được cấu hình cho chi nhánh này.</td></tr>
            ) : rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{room.roomNumber}</td>
                <td className="px-4 py-3">Tầng {room.floor}</td>
                <td className="px-4 py-3 font-medium">{room.roomType?.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    room.bookingStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    room.bookingStatus === 'OCCUPIED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    room.bookingStatus === 'RESERVED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                  }`}>
                    {room.bookingStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    room.cleaningStatus === 'CLEAN' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                    room.cleaningStatus === 'DIRTY' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    room.cleaningStatus === 'CLEANING' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {room.cleaningStatus}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate" title={room.notes}>{room.notes || '-'}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => handleOpenRoomModal(room)} className="text-indigo-600 hover:text-indigo-800"><Edit className="h-4 w-4 inline" /></button>
                  <button onClick={() => handleRoomDelete(room.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingRoomId ? 'Chỉnh sửa Phòng vật lý' : 'Thêm Phòng vật lý mới'}
            </h2>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số phòng *</label>
                <input type="text" required value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" placeholder="A-101" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tầng *</label>
                  <input type="number" required min="1" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hạng phòng *</label>
                  <select value={roomForm.roomTypeId} onChange={e => setRoomForm({...roomForm, roomTypeId: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600">
                    {roomTypes.map(rt => (
                      <option key={rt.id} value={rt.id.toString()}>{rt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Booking Status</label>
                  <select value={roomForm.bookingStatus} onChange={e => setRoomForm({...roomForm, bookingStatus: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600">
                    <option value="AVAILABLE">AVAILABLE (Trống)</option>
                    <option value="OCCUPIED">OCCUPIED (Đang ở)</option>
                    <option value="RESERVED">RESERVED (Được đặt trước)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Housekeeping Status</label>
                  <select value={roomForm.cleaningStatus} onChange={e => setRoomForm({...roomForm, cleaningStatus: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600">
                    <option value="CLEAN">CLEAN (Sạch)</option>
                    <option value="DIRTY">DIRTY (Bẩn)</option>
                    <option value="CLEANING">CLEANING (Đang dọn)</option>
                    <option value="INSPECTION">INSPECTION (Đang kiểm tra)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ghi chú phòng</label>
                <textarea rows={2} value={roomForm.notes} onChange={e => setRoomForm({...roomForm, notes: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" placeholder="Có hỏng vặt vãnh hay ưu tiên VIP..." />
              </div>

              <div className="flex gap-3 pt-4 border-t justify-end">
                <button type="button" onClick={() => setIsRoomModalOpen(false)} className="px-6 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" disabled={roomSubmitting} className="px-8 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                  {roomSubmitting ? 'Đang lưu...' : 'Lưu Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderAmenitiesTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tiện nghi miễn phí</h2>
          <p className="text-sm text-slate-500">Tích chọn các dịch vụ tiện nghi miễn phí có sẵn tại khách sạn</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAmenityModalOpen(true)} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Plus className="h-4 w-4" /> Thêm danh mục hệ thống
          </button>
          <button onClick={handleAmenitiesSync} disabled={amenitySubmitting} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
            <Save className="h-4 w-4" /> {amenitySubmitting ? 'Đang lưu...' : 'Cập nhật tiện nghi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        {globalAmenities.map(amenity => {
          const isChecked = selectedAmenityIds.includes(amenity.id);
          return (
            <div key={amenity.id} className="relative group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
              <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => handleToggleAmenity(amenity.id)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{amenity.name}</span>
                  <span className="block text-xs text-slate-400">{amenity.icon || 'Wifi'}</span>
                </div>
              </label>
              
              <button 
                onClick={() => handleDeleteGlobalAmenity(amenity.id)} 
                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                title="Xóa khỏi hệ thống"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Amenity Creation Modal */}
      {isAmenityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Thêm tiện nghi hệ thống</h2>
            <form onSubmit={handleCreateGlobalAmenity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Tiện nghi *</label>
                <input type="text" required value={amenityForm.name} onChange={e => setAmenityForm({...amenityForm, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="Bể bơi vô cực" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Icon (Lucide)</label>
                <input type="text" value={amenityForm.icon} onChange={e => setAmenityForm({...amenityForm, icon: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="Wifi, Gym, Pool" />
              </div>
              <div className="flex gap-2 pt-4 border-t justify-end">
                <button type="button" onClick={() => setIsAmenityModalOpen(false)} className="px-4 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" className="px-6 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderServicesTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dịch vụ có tính phí</h2>
          <p className="text-sm text-slate-500">Kích hoạt các dịch vụ GTGT có tính phí cho khách sạn và quản lý bảng giá dịch vụ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleOpenGlobalServiceModal()} className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Plus className="h-4 w-4" /> Thêm dịch vụ vào catalog
          </button>
          <button onClick={handleServicesSync} disabled={serviceSubmitting} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
            <Save className="h-4 w-4" /> {serviceSubmitting ? 'Đang lưu...' : 'Cập nhật dịch vụ'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Checklist to enable for this branch */}
        <div className="lg:col-span-2 space-y-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Bật dịch vụ cho Chi nhánh hiện tại</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalServices.map(s => {
              const isChecked = selectedServiceIds.includes(s.id);
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={() => handleToggleService(s.id)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{s.name}</span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side: Catalog listing of all global services */}
        <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">Danh mục dịch vụ (Catalog)</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-2 space-y-2">
            {globalServices.map(s => (
              <div key={s.id} className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</span>
                  <span className="block text-xs text-slate-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.price)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenGlobalServiceModal(s)} className="text-slate-500 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDeleteGlobalService(s.id)} className="text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingGlobalServiceId ? 'Chỉnh sửa Dịch vụ Catalog' : 'Thêm Dịch vụ mới vào Catalog'}
            </h2>
            <form onSubmit={handleGlobalServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Dịch vụ *</label>
                <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đơn giá (VND) *</label>
                <input type="number" required min="0" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả dịch vụ</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" rows={2} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Đường dẫn ảnh (imageUrl)</label>
                <input type="text" value={serviceForm.imageUrl} onChange={e => setServiceForm({...serviceForm, imageUrl: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
              </div>

              <div className="flex gap-2 pt-4 border-t justify-end">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-4 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" className="px-6 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderGalleryTab = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bộ sưu tập hình ảnh</h2>
          <p className="text-sm text-slate-500">Quản lý kho ảnh (5 - 20 ảnh) hiển thị lên mục chi tiết của Khách sạn</p>
        </div>
        <button onClick={handleSaveGallery} disabled={gallerySubmitting} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Save className="h-4 w-4" /> {gallerySubmitting ? 'Đang lưu bộ ảnh...' : 'Lưu bộ ảnh'}
        </button>
      </div>

      <form onSubmit={handleAddGalleryImage} className="flex gap-2 max-w-xl">
        <input 
          type="text" 
          placeholder="Dán link ảnh URL..." 
          value={newImageUrl} 
          onChange={e => setNewImageUrl(e.target.value)} 
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" 
        />
        <button type="submit" className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm">
          Thêm ảnh
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {galleryUrls.map((url, idx) => (
          <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border bg-slate-100">
            <img src={url} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
            <button 
              type="button" 
              onClick={() => handleRemoveGalleryImage(idx)} 
              className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {galleryUrls.length === 0 && (
          <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400">
            Chưa có hình ảnh nào trong bộ sưu tập. Dán link ảnh ở trên để thêm.
          </div>
        )}
      </div>
    </div>
  );

  const renderPoliciesTab = () => (
    <form onSubmit={handlePoliciesSubmit} className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chính sách & Quy định khách sạn</h2>
          <p className="text-sm text-slate-500">Giờ nhận/trả phòng và các quy định khác</p>
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm">
          <Save className="h-4 w-4" /> Lưu chính sách
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ nhận phòng (Check-in)</label>
              <input type="time" value={policiesForm.checkInTime} onChange={e => setPoliciesForm({...policiesForm, checkInTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ trả phòng (Check-out)</label>
              <input type="time" value={policiesForm.checkOutTime} onChange={e => setPoliciesForm({...policiesForm, checkOutTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">Quy định chung</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={policiesForm.allowSmoking} onChange={e => setPoliciesForm({...policiesForm, allowSmoking: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cho phép Hút thuốc</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={policiesForm.allowPets} onChange={e => setPoliciesForm({...policiesForm, allowPets: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cho phép mang vật nuôi (Pets)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={policiesForm.extraBedAllowed} onChange={e => setPoliciesForm({...policiesForm, extraBedAllowed: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hỗ trợ Kê giường phụ</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chính sách Hủy phòng / Đặt chỗ</label>
          <textarea rows={6} value={policiesForm.cancellationPolicy} onChange={e => setPoliciesForm({...policiesForm, cancellationPolicy: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-indigo-600 text-slate-900 dark:text-white" placeholder="Khách hàng được hủy miễn phí trước 24 giờ..." />
        </div>
      </div>
    </form>
  );

  if (!branch) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in fade-in slide-in-from-bottom-5 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
          notification.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
          'bg-amber-500 text-white border-amber-450'
        }`}>
          {notification.type === 'success' ? <Check className="h-5 w-5 shrink-0" /> : 
           notification.type === 'error' ? <X className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

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

      {/* Tabs Layout */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-max">
        {[
          { id: 'overview', label: 'Overview', icon: Building2 },
          { id: 'room-types', label: 'Room Types', icon: Layers },
          { id: 'rooms', label: 'Physical Rooms', icon: BedDouble },
          { id: 'amenities', label: 'Amenities', icon: Sparkles },
          { id: 'services', label: 'Services', icon: Heart },
          { id: 'gallery', label: 'Gallery', icon: ImageIcon },
          { id: 'policies', label: 'Policies', icon: ShieldAlert }
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

      {/* Tab Content Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[400px]">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'room-types' && renderRoomTypesTab()}
        {activeTab === 'rooms' && renderRoomsTab()}
        {activeTab === 'amenities' && renderAmenitiesTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'gallery' && renderGalleryTab()}
        {activeTab === 'policies' && renderPoliciesTab()}
      </div>

      {/* Room Type Edit/Create Modal (Kept from existing codebase) */}
      {isRoomTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingRoomTypeId ? 'Chỉnh sửa Hạng phòng' : 'Thêm Hạng phòng mới'}
            </h2>
            <form onSubmit={handleRoomTypeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-indigo-600 border-b pb-2">1. Thông tin cơ bản</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên Hạng Phòng *</label>
                    <input type="text" required value={roomTypeForm.name} onChange={e => setRoomTypeForm({...roomTypeForm, name: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá cơ bản (VND) *</label>
                      <input type="number" required min="0" value={roomTypeForm.basePrice} onChange={e => setRoomTypeForm({...roomTypeForm, basePrice: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sức chứa (người) *</label>
                      <input type="number" required min="1" value={roomTypeForm.capacity} onChange={e => setRoomTypeForm({...roomTypeForm, capacity: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả</label>
                    <textarea rows={3} value={roomTypeForm.description} onChange={e => setRoomTypeForm({...roomTypeForm, description: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link Ảnh (Cách nhau dấu phẩy)</label>
                    <input type="text" value={roomTypeForm.images} onChange={e => setRoomTypeForm({...roomTypeForm, images: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" placeholder="https://img1.jpg, https://img2.jpg" />
                  </div>
                </div>

                {/* OTA Setup */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-rose-500 border-b pb-2">2. Cấu hình OTA</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={roomTypeForm.isPublic} onChange={e => setRoomTypeForm({...roomTypeForm, isPublic: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hiển thị Public</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={roomTypeForm.isFeatured} onChange={e => setRoomTypeForm({...roomTypeForm, isFeatured: e.target.checked})} className="w-4 h-4 text-amber-500 rounded" />
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Đề xuất (Featured)</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái Hạng phòng</label>
                      <select value={roomTypeForm.status} onChange={e => setRoomTypeForm({...roomTypeForm, status: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600">
                        <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
                        <option value="UNAVAILABLE">UNAVAILABLE (Đóng)</option>
                        <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giảm giá (%)</label>
                      <input type="number" min="0" max="100" value={roomTypeForm.discount} onChange={e => setRoomTypeForm({...roomTypeForm, discount: Number(e.target.value)})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ Check-in</label>
                      <input type="time" value={roomTypeForm.checkInTime} onChange={e => setRoomTypeForm({...roomTypeForm, checkInTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giờ Check-out</label>
                      <input type="time" value={roomTypeForm.checkOutTime} onChange={e => setRoomTypeForm({...roomTypeForm, checkOutTime: e.target.value})} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={roomTypeForm.allowSmoking} onChange={e => setRoomTypeForm({...roomTypeForm, allowSmoking: e.target.checked})} className="rounded" /> Hút thuốc
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={roomTypeForm.allowPets} onChange={e => setRoomTypeForm({...roomTypeForm, allowPets: e.target.checked})} className="rounded" /> Thú cưng
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                      <input type="checkbox" checked={roomTypeForm.extraBedAllowed} onChange={e => setRoomTypeForm({...roomTypeForm, extraBedAllowed: e.target.checked})} className="rounded" /> Giường phụ
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t justify-end">
                <button type="button" onClick={() => setIsRoomTypeModalOpen(false)} className="px-6 h-10 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy</button>
                <button type="submit" disabled={roomTypeSubmitting} className="px-8 h-10 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                  {roomTypeSubmitting ? 'Đang lưu...' : 'Lưu Hạng Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
