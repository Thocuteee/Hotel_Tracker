"use client"

import { useState, useEffect } from 'react';
import AdminRoomManagement from '@/components/dashboard/AdminRoomManagement';
import ReceptionistRoomManagement from '@/components/dashboard/ReceptionistRoomManagement';
import HousekeepingRoomManagement from '@/components/dashboard/HousekeepingRoomManagement';
import { Loader2 } from 'lucide-react';

export default function RoomsPage() {
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
    return <HousekeepingRoomManagement />;
  }

  if (role === 'RECEPTIONIST') {
    return <ReceptionistRoomManagement />;
  }

  // Fallback for ADMIN or others
  return <AdminRoomManagement />;
}
