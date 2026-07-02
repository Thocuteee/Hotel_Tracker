"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      return;
    }

    setLoading(true);

    // If identifier is not an email and is digits only, it's a phone.
    // If not email and not digits, it's a username, append @hoteltracker.com
    const loginIdentifier = email.includes('@') || /^\d+$/.test(email.trim())
      ? email.trim()
      : `${email.trim()}@hoteltracker.com`;

    try {
      const response = await api.post('/api/v1/auth/login', { email: loginIdentifier, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'CUSTOMER') {
        router.push('/');
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Mật khẩu không chính xác.');
      } else if (err.response?.status === 404) {
        setError('Không tìm thấy tài khoản.');
      } else {
        setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Cột trái: Form Login */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 md:px-24 lg:w-[40%] bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Chào mừng trở lại
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đăng nhập để quản lý khách sạn của bạn
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tên đăng nhập hoặc Số điện thoại
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username hoặc số điện thoại"
                  className="h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="space-y-4 mt-6 text-center text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Đăng ký ngay
                </Link>
              </p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Trở về trang chủ
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Cột phải: Hình ảnh banner */}
      <div className="relative hidden lg:block lg:w-[60%] overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Hotel"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
        
        {/* Caption */}
        <div className="absolute bottom-16 left-16 right-16 text-white space-y-4">
          <h2 className="text-4xl font-bold leading-tight tracking-tight max-w-xl">
            Quản lý khách sạn thông minh & hiệu quả.
          </h2>
          <p className="text-slate-200 text-sm max-w-md leading-relaxed">
            Hệ thống quản lý tích hợp mọi tính năng giúp bạn theo dõi phòng đặt, doanh thu và phản hồi từ khách hàng chỉ trên một giao diện tối giản.
          </p>
        </div>
      </div>
    </div>
  );
}
