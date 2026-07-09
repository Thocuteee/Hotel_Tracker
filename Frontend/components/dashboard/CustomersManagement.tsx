"use client"

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  X, 
  Loader2,
  Users,
  Award,
  BookOpen,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  loyaltyPoints: number; // Điểm tích lũy
}

interface SimulatedBooking {
  id: string;
  roomTypeName: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  status: string;
  paymentMethod: string;
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected customer for history modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [simulatedBookings, setSimulatedBookings] = useState<SimulatedBooking[]>([]);

  useEffect(() => {
    fetchCustomers();
    // Load simulated bookings to match with customer history
    const bookings = JSON.parse(localStorage.getItem('simulated_bookings') || '[]');
    setSimulatedBookings(bookings);
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/users');
      
      // Filter out STAFF to display CUSTOMERs
      const customersList = response.data
        .filter((user: any) => user.role === 'CUSTOMER')
        .map((user: any, idx: number) => {
          // Prepopulate mock loyalty points if not present in DB
          // Uses localStorage to persist loyalty points adjustments locally for testing
          const localPointsKey = `customer_points_${user.id}`;
          const persistedPoints = localStorage.getItem(localPointsKey);
          const initialPoints = persistedPoints ? Number(persistedPoints) : (100 + (user.id % 7) * 45);
          
          if (!persistedPoints) {
            localStorage.setItem(localPointsKey, String(initialPoints));
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '0981' + Math.floor(100000 + Math.random() * 900000),
            createdAt: user.createdAt || new Date().toISOString(),
            loyaltyPoints: initialPoints
          };
        });

      // If no customer users exist in backend yet, supply 3 beautiful mock customers for demo
      if (customersList.length === 0) {
        const fallbackCustomers = [
          {
            id: 101,
            name: "Trần Anh Tuấn",
            email: "tuan.tran@gmail.com",
            phone: "0905123456",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            loyaltyPoints: 350
          },
          {
            id: 102,
            name: "Lê Mỹ Linh",
            email: "linh.le@yahoo.com",
            phone: "0912987654",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            loyaltyPoints: 120
          },
          {
            id: 103,
            name: "Nguyễn Văn An",
            email: "an.nguyen@gmail.com",
            phone: "0987654321",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            loyaltyPoints: 650
          }
        ];
        fallbackCustomers.forEach(c => {
          const key = `customer_points_${c.id}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, String(c.loyaltyPoints));
          }
        });
        setCustomers(fallbackCustomers);
      } else {
        setCustomers(customersList);
      }
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải danh sách khách hàng từ máy chủ. Đang hiển thị dữ liệu giả lập.');
      
      // Load mock items on API error so interface doesn't stay blank
      const mockItems = [
        {
          id: 101,
          name: "Trần Anh Tuấn",
          email: "tuan.tran@gmail.com",
          phone: "0905123456",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          loyaltyPoints: 350
        },
        {
          id: 102,
          name: "Lê Mỹ Linh",
          email: "linh.le@yahoo.com",
          phone: "0912987654",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          loyaltyPoints: 120
        },
        {
          id: 103,
          name: "Nguyễn Văn An",
          email: "an.nguyen@gmail.com",
          phone: "0987654321",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          loyaltyPoints: 650
        }
      ];
      setCustomers(mockItems);
    } finally {
      setLoading(false);
    }
  };

  // Adjust loyalty points (e.g. +/- 50 points)
  const handleAdjustPoints = (customerId: number, amount: number) => {
    const updated = customers.map(cust => {
      if (cust.id === customerId) {
        const nextPoints = Math.max(0, cust.loyaltyPoints + amount);
        localStorage.setItem(`customer_points_${customerId}`, String(nextPoints));
        return { ...cust, loyaltyPoints: nextPoints };
      }
      return cust;
    });
    setCustomers(updated);
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer({ ...selectedCustomer, loyaltyPoints: Math.max(0, selectedCustomer.loyaltyPoints + amount) });
    }
  };

  // Filter list by search query
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Find bookings belonging to selected customer
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return simulatedBookings.filter(b => 
      b.guestName.toLowerCase().includes(selectedCustomer.name.toLowerCase()) ||
      b.guestPhone === selectedCustomer.phone
    );
  }, [selectedCustomer, simulatedBookings]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản lý Khách hàng</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tra cứu thông tin khách hàng, số điểm tích lũy thành viên, và lịch sử giao dịch đặt phòng.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-xs font-semibold text-amber-600 dark:text-amber-400">
          {error}
        </div>
      )}

      {/* Main card list */}
      <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0B0F19]">
        <CardHeader className="border-b border-slate-100 dark:border-slate-850 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Danh sách thành viên</CardTitle>
            <CardDescription className="text-xs text-slate-450 mt-1">
              {loading ? 'Đang tải...' : `Tổng số ${customers.length} khách hàng đăng ký.`}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên, Email, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-slate-850">
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-left">Mã số</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-left">Họ và tên</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-left">Email</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-left">Số điện thoại</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-center">Điểm tích lũy</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-left">Ngày tham gia</TableHead>
                  <TableHead className="font-extrabold text-slate-400 text-[10px] uppercase py-3.5 px-6 text-right">Lịch sử</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => (
                  <TableRow key={cust.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 font-medium">
                    <TableCell className="font-bold text-slate-500 py-4 px-6">CUST-{cust.id}</TableCell>
                    <TableCell className="text-slate-900 dark:text-white font-bold py-4 px-6">{cust.name}</TableCell>
                    <TableCell className="text-slate-500 py-4 px-6">{cust.email}</TableCell>
                    <TableCell className="text-slate-500 py-4 px-6">{cust.phone}</TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Adjust points +/- 50 for locking testing */}
                        <button 
                          onClick={() => handleAdjustPoints(cust.id, -50)}
                          className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 min-w-10 text-center">
                          {cust.loyaltyPoints}
                        </span>
                        <button 
                          onClick={() => handleAdjustPoints(cust.id, 50)}
                          className="h-6 w-6 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 py-4 px-6">
                      {new Date(cust.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="h-8 px-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                      >
                        Tra lịch sử
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                      Không tìm thấy khách hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* BOOKING HISTORY DIALOG */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-6 top-6 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4 items-center">
              <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Lịch sử giao dịch: {selectedCustomer.name}
                </h2>
                <p className="text-xs text-slate-450 mt-0.5">
                  Điểm tích lũy: <strong>{selectedCustomer.loyaltyPoints} điểm</strong> • SĐT: {selectedCustomer.phone}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-850 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Mã đơn</th>
                    <th className="py-3.5 px-4">Hạng Phòng</th>
                    <th className="py-3.5 px-4">Khoảng thời gian</th>
                    <th className="py-3.5 px-4">Số tiền</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850">
                  {customerBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 font-medium">
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{b.id}</td>
                      <td className="py-3.5 px-4">{b.roomTypeName}</td>
                      <td className="py-3.5 px-4">{b.checkIn} - {b.checkOut}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-650 dark:text-indigo-400">{b.totalPrice}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                          b.status === 'PENDING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {b.status === 'CONFIRMED' ? 'Đã xác nhận' :
                           b.status === 'PENDING' ? 'Đang chờ' : 'Đã hủy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {customerBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-450 italic text-[10px]">
                        Chưa có lịch sử giao dịch đặt phòng nào cho khách hàng này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="h-10 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
