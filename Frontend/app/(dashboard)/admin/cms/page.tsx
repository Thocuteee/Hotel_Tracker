"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Save, Layout, Video, Type, MapPin } from 'lucide-react';
import api from '@/lib/api';

export default function AdminCMSPage() {
  const [config, setConfig] = useState({
    brandName: '',
    heroVideoUrl: '',
    logoUrl: '',
    promoText: ''
  });
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    // Fetch Web Config
    api.get('/api/v1/public/web-config')
      .then(res => setConfig(res.data))
      .catch(console.error);

    // Fetch Branches
    api.get('/api/v1/branches')
      .then(res => setBranches(res.data))
      .catch(console.error);
  }, []);

  const handleSaveConfig = async () => {
    try {
      await api.post('/api/v1/admin/web-config', config);
      alert('Đã lưu cấu hình web thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu cấu hình');
    }
  };

  const handleSaveBranchGPS = async (branchId: number, lat: number, lng: number) => {
    try {
      await api.patch(`/api/v1/branches/${branchId}/gps`, null, { params: { lat, lng } });
      alert('Lưu tọa độ thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu tọa độ');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Thiết Kế Web (CMS)</h1>
          <p className="text-slate-500 text-sm mt-1">Cấu hình giao diện trang khách hàng (Customer Web)</p>
        </div>
        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
          <Layout className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
              <Settings className="w-5 h-5 text-indigo-500" /> Cấu hình chung
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Tên thương hiệu
                </label>
                <input 
                  type="text" 
                  value={config.brandName || ''}
                  onChange={e => setConfig({...config, brandName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" /> Video nền trang chủ (URL)
                </label>
                <input 
                  type="text" 
                  value={config.heroVideoUrl || ''}
                  onChange={e => setConfig({...config, heroVideoUrl: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-colors text-sm font-mono text-slate-600"
                  placeholder="https://..."
                />
              </div>

              <button 
                onClick={handleSaveConfig}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" /> Lưu cấu hình
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="w-5 h-5 text-rose-500" /> Tọa độ Chi Nhánh (Bản Đồ)
            </h3>
            
            <div className="space-y-6">
              {branches.map(b => (
                <div key={b.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-800 mb-3">{b.name}</div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                      <input 
                        type="number" 
                        defaultValue={b.latitude || ''}
                        id={`lat-${b.id}`}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                      <input 
                        type="number" 
                        defaultValue={b.longitude || ''}
                        id={`lng-${b.id}`}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-1"
                        step="any"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const lat = parseFloat((document.getElementById(`lat-${b.id}`) as HTMLInputElement).value);
                      const lng = parseFloat((document.getElementById(`lng-${b.id}`) as HTMLInputElement).value);
                      handleSaveBranchGPS(b.id, lat, lng);
                    }}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 rounded-lg text-xs transition-colors"
                  >
                    Cập nhật GPS
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
