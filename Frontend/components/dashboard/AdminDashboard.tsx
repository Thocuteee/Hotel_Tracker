"use client"

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import { Star } from 'lucide-react';

export default function AdminDashboard() {
  const [userName, setUserName] = useState('Quản trị viên');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Dashboard - Quản trị viên
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {userName}. Here's what's happening at Luxury Hotel & Resort today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="TOTAL REVENUE"
          value="45,231,000 đ"
          description="+20.1% so với tháng trước"
          trend="up"
          colorVariant="indigo"
        />
        <StatCard
          title="TOTAL BOOKINGS"
          value="+235"
          description="+18% so với tháng trước"
          trend="up"
          colorVariant="indigo"
        />
        <StatCard
          title="ROOMS PENDING"
          value="12"
          description="-4% so với tháng trước"
          trend="down"
          colorVariant="rose"
        />
        <StatCard
          title="OCCUPANCY RATE"
          value="89%"
          description="+7% so với tháng trước"
          trend="up"
          colorVariant="indigo"
        />
      </div>

      {/* Chart & Recent Bookings Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <RecentBookingsTable />
        </div>
      </div>

      {/* Hotel Banner Card */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shadow-sm transition-colors duration-300">
        <div className="relative h-24 w-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop"
            alt="Luxury Hotel"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Luxury Hotel & Resort
          </h3>
          <div className="flex justify-center sm:justify-start items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
