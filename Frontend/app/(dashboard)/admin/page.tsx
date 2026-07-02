"use client"

import { useState, useEffect } from 'react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import HousekeepingDashboard from '@/components/dashboard/HousekeepingDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          setRole(user.role);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (role === 'HOUSEKEEPING') {
    return <HousekeepingDashboard />;
  }

  // Fallback for ADMIN, RECEPTIONIST, or others who have access to dashboard
  return <AdminDashboard />;
}
