"use client"

import { useState, useEffect } from 'react';
import { UserPlus, Search, ShieldCheck, Mail, Phone, Calendar, Trash2, X, Pencil, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import api from '@/lib/api';

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'HOUSEKEEPING';
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'RECEPTIONIST' | 'HOUSEKEEPING'>('RECEPTIONIST');
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/users');
      // Filter out CUSTOMER accounts to only display staff/employees
      const staffList = response.data.filter((user: any) => user.role !== 'CUSTOMER');
      setEmployees(staffList);
    } catch (err: any) {
      console.error(err);
      setError('Không thể tải danh sách nhân viên từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('ADD');
    setEditingId(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('RECEPTIONIST');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setModalMode('EDIT');
    setEditingId(emp.id);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setPassword(''); // leave blank for no change
    setRole(emp.role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      alert("Vui lòng nhập đầy đủ họ tên và email.");
      return;
    }

    if (modalMode === 'ADD' && !password.trim()) {
      alert("Vui lòng nhập mật khẩu khởi tạo.");
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'ADD') {
        // Create employee
        await api.post('/api/v1/users', {
          name,
          email,
          phone,
          password,
          role
        });
      } else {
        // Update employee
        await api.put(`/api/v1/users/${editingId}`, {
          name,
          email,
          phone,
          password: password.trim() ? password : null,
          role
        });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      const serverMessage = err.response?.data?.message;
      alert(serverMessage || "Có lỗi xảy ra trong quá trình lưu dữ liệu nhân viên.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) {
      try {
        await api.delete(`/api/v1/users/${id}`);
        fetchEmployees();
      } catch (err: any) {
        console.error(err);
        alert("Lỗi khi xóa nhân viên.");
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-card-text">Quản lý nhân viên</h1>
          <p className="text-sm text-text-muted mt-1">Cấp tài khoản, chỉnh sửa thông tin và quản lý nhân sự trong khách sạn.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Cấp tài khoản
        </button>
      </div>

      {/* Table */}
      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <Card className="rounded-2xl border-border-color shadow-sm bg-card-bg">
        <CardHeader className="border-b border-border-light px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold text-card-text">Danh sách tài khoản</CardTitle>
            <CardDescription className="text-sm text-text-muted mt-1">
              {loading ? 'Đang tải thông tin...' : `Tổng cộng ${employees.length} nhân viên.`}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border-color bg-background pl-10 pr-4 text-sm text-card-text placeholder-text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                <TableRow className="border-b-0">
                  <TableHead className="font-medium text-text-muted h-12">Mã số</TableHead>
                  <TableHead className="font-medium text-text-muted h-12">Họ và tên</TableHead>
                  <TableHead className="font-medium text-text-muted h-12">Email</TableHead>
                  <TableHead className="font-medium text-text-muted h-12">Số điện thoại</TableHead>
                  <TableHead className="font-medium text-text-muted h-12">Vai trò (Role)</TableHead>
                  <TableHead className="font-medium text-text-muted h-12">Ngày tạo</TableHead>
                  <TableHead className="font-medium text-text-muted h-12 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="border-border-light hover:bg-bg-hover/50">
                    <TableCell className="font-semibold text-card-text/90 py-4">EMP-{emp.id}</TableCell>
                    <TableCell className="text-card-text font-bold py-4">{emp.name}</TableCell>
                    <TableCell className="text-text-muted py-4">{emp.email}</TableCell>
                    <TableCell className="text-text-muted py-4">{emp.phone || '-'}</TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        emp.role === "ADMIN" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400" :
                        emp.role === "RECEPTIONIST" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
                        "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                      }`}>
                        {emp.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-text-muted py-4">
                      {new Date(emp.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-2 text-text-muted hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                          title="Sửa thông tin"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 text-text-muted hover:text-rose-600 dark:hover:text-rose-400 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-text-muted">
                      Không tìm thấy nhân viên phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Cấp / Sửa Tài Khoản */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold">
                {modalMode === 'ADD' ? 'Cấp tài khoản nhân viên' : 'Chỉnh sửa thông tin nhân viên'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Lê Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border-color dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@hotel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border-color dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">
                  {modalMode === 'ADD' ? 'Mật khẩu khởi tạo *' : 'Mật khẩu mới (bỏ trống nếu không đổi)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'ADD'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border-color dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border-color dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-muted uppercase">Quyền hạn (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-border-color dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="RECEPTIONIST">RECEPTIONIST (Lễ tân)</option>
                  <option value="HOUSEKEEPING">HOUSEKEEPING (Buồng phòng)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-border-color dark:border-slate-800 text-text-muted rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {modalMode === 'ADD' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
