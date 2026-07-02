"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, Loader2, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !phone.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    setLoading(true);

    try {
      // Map username to name, and username@hoteltracker.com to email to satisfy DB validation
      await api.post('/api/v1/auth/register', {
        name: username.trim(),
        email: `${username.trim()}@hoteltracker.com`,
        phone: phone.trim(),
        password,
        role: 'CUSTOMER'
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Cột trái: Form Register */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 md:px-24 lg:w-[40%] bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="mx-auto w-full max-w-md space-y-8 py-8">
          {success ? (
            <div className="text-center space-y-4 py-8 animate-in zoom-in-95 duration-500">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Đăng ký thành công!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hệ thống đang chuyển hướng bạn đến trang Đăng nhập...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Tạo tài khoản mới
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Đăng ký để bắt đầu trải nghiệm dịch vụ khách sạn đẳng cấp.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tên tài khoản
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên tài khoản của bạn"
                      className="h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="h-12 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Mật khẩu
                  </label>
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
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      Đăng ký ngay
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="space-y-4 mt-6 text-center text-sm">
                  <p className="text-slate-500 dark:text-slate-400">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                      Đăng nhập ngay
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
          )}
        </div>
      </div>

      {/* Cột phải: Hình ảnh banner */}
      <div className="relative hidden lg:block lg:w-[60%] overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
          alt="Lumiere Stay"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
        
        {/* Caption */}
        <div className="absolute bottom-16 left-16 right-16 text-white space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight max-w-xl">
            Khám phá thế giới cùng Lumiere Stay
          </h2>
          <p className="text-slate-200 text-sm max-w-md leading-relaxed">
            Hệ thống quản lý tích hợp mọi tính năng giúp bạn theo dõi phòng đặt, doanh thu và phản hồi từ khách hàng chỉ trên một giao diện tối giản và sang trọng.
          </p>
          
          {/* Indicators */}
          <div className="flex items-center gap-2 pt-2">
            <span className="h-1.5 w-8 rounded-full bg-indigo-600 transition-all duration-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/60 transition-all duration-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400/60 transition-all duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
