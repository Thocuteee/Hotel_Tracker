"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Hotel, TrendingUp, Calendar as CalendarIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '@/lib/api';
import Link from 'next/link';

interface Stats {
  todayRevenue: number;
  totalRevenue: number;
  occupancyRate: number;
  totalBookings: number;
  totalRooms: number;
}

const mockChartData = [
  { name: 'T2', revenue: 4000, occupancy: 65 },
  { name: 'T3', revenue: 3000, occupancy: 55 },
  { name: 'T4', revenue: 5000, occupancy: 70 },
  { name: 'T5', revenue: 2780, occupancy: 45 },
  { name: 'T6', revenue: 6890, occupancy: 85 },
  { name: 'T7', revenue: 8390, occupancy: 95 },
  { name: 'CN', revenue: 7490, occupancy: 90 },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/v1/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 -mt-16 -mr-16" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Tổng quan Ban Giám Đốc</h1>
          <p className="text-slate-400 text-sm">Báo cáo doanh thu và hiệu suất phòng thời gian thực.</p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link href="/reception" className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 backdrop-blur-md">
            Màn hình Lễ Tân
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-black text-slate-900">
                  ${stats?.todayRevenue?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" /> +12% so với hôm qua
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tỷ lệ lấp đầy</p>
                <h3 className="text-2xl font-black text-slate-900">
                  {stats?.occupancyRate || 0}%
                </h3>
              </div>
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                <Hotel className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full" 
                style={{ width: `${stats?.occupancyRate || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng Booking</p>
                <h3 className="text-2xl font-black text-slate-900">
                  {stats?.totalBookings || 0}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-semibold">Tất cả thời gian</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-1">Tổng Doanh Thu</p>
                <h3 className="text-2xl font-black">
                  ${stats?.totalRevenue?.toLocaleString() || 0}
                </h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl text-white backdrop-blur-md">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs font-bold text-indigo-200">
              Vượt chỉ tiêu tháng này
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Biểu đồ doanh thu tuần
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-indigo-500" /> Tỷ lệ lấp đầy (%)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}
                  />
                  <Line type="monotone" dataKey="occupancy" stroke="#0ea5e9" strokeWidth={4} dot={{r: 6, fill: '#fff', strokeWidth: 3}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
