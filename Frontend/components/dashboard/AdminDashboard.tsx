"use client"

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import { Star } from 'lucide-react';
import PromoCarousel from '@/components/dashboard/PromoCarousel';

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

      {/* Promo Carousel */}
      <PromoCarousel />
    </div>
  );
}
