"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role);
      } catch (e) {
        console.error(e);
      }
    }
    setLoading(false);
  }, []);

  const handleBack = () => {
    if (role === 'CUSTOMER') {
      router.push('/');
    } else {
      router.push('/admin');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Shield Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Truy cập bị từ chối
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Tài khoản của bạn không có đủ quyền hạn cần thiết để truy cập nội dung trang này. Vui lòng liên hệ với quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBack}
          className="w-full h-11 bg-indigo-650 hover:bg-indigo-600 text-sm font-bold text-white rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chính
        </button>
      </div>
    </div>
  );
}
