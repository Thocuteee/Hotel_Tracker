"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, LogOut, Search, Clock, Home, BedDouble } from 'lucide-react';
import api from '@/lib/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Booking {
  id: number;
  customer: { id: number; username: string };
  roomType: { id: number; name: string };
  room?: { id: number; roomNumber: string };
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
}

interface Room {
  id: number;
  roomNumber: string;
  status: string;
  roomType: { id: number; name: string };
}

export default function ReceptionPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRoomsForCheckin, setAvailableRoomsForCheckin] = useState<Room[]>([]);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const fetchTodayBookings = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get(`/api/v1/reception/bookings?date=${today}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllRooms = async () => {
    try {
      const res = await api.get(`/api/v1/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodayBookings();
    fetchAllRooms();

    // WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket for Receptionist');
        client.subscribe('/topic/room-status', (msg) => {
          const updatedRoom = JSON.parse(msg.body);
          setRooms((prev) => {
            const exists = prev.find(r => r.id === updatedRoom.id);
            if (exists) {
              return prev.map(r => r.id === updatedRoom.id ? updatedRoom : r);
            } else {
              return [...prev, updatedRoom];
            }
          });
          // Note: you could also refresh bookings here if needed
        });
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const openCheckIn = async (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedRoomId(null);
    try {
      const res = await api.get(`/api/v1/reception/available-rooms?roomTypeId=${booking.roomType.id}`);
      setAvailableRoomsForCheckin(res.data);
      setIsCheckInOpen(true);
    } catch (err) {
      console.error(err);
      alert('Không thể lấy danh sách phòng trống.');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedBooking || !selectedRoomId) return;
    try {
      await api.post(`/api/v1/reception/check-in?bookingId=${selectedBooking.id}&roomId=${selectedRoomId}`);
      alert('Check-in thành công!');
      setIsCheckInOpen(false);
      fetchTodayBookings();
      fetchAllRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in thất bại');
    }
  };

  const openCheckOut = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCheckOutOpen(true);
  };

  const handleCheckOut = async () => {
    if (!selectedBooking) return;
    try {
      await api.post(`/api/v1/reception/check-out?bookingId=${selectedBooking.id}`);
      alert('Check-out thành công!');
      setIsCheckOutOpen(false);
      fetchTodayBookings();
      fetchAllRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out thất bại');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 border-emerald-500 text-emerald-800';
      case 'OCCUPIED': return 'bg-rose-100 border-rose-500 text-rose-800';
      case 'DIRTY': return 'bg-slate-200 border-slate-500 text-slate-800';
      case 'CLEANING': return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'MAINTENANCE': return 'bg-orange-100 border-orange-500 text-orange-800';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lễ Tân & Sơ đồ phòng</h1>
          <p className="text-slate-500">Quản lý nhận/trả phòng và trạng thái phòng thực tế.</p>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid"><Home className="w-4 h-4 mr-2"/> Sơ đồ phòng</TabsTrigger>
          <TabsTrigger value="bookings"><Clock className="w-4 h-4 mr-2"/> Booking Hôm nay</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map(room => (
              <div 
                key={room.id} 
                className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col justify-between h-28 ${getStatusColor(room.status)}`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg">{room.roomNumber}</span>
                  <BedDouble className="w-5 h-5 opacity-50" />
                </div>
                <div className="text-xs font-semibold opacity-80">
                  {room.roomType.name}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-wider mt-1">
                  {room.status}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Booking Hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-4 py-3">Mã Booking</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3">Hạng phòng</th>
                      <th className="px-4 py-3">Ngày lưu trú</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">#{b.id}</td>
                        <td className="px-4 py-3">{b.customer?.username}</td>
                        <td className="px-4 py-3">{b.roomType?.name}</td>
                        <td className="px-4 py-3 text-xs">{b.checkInDate} đến {b.checkOutDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'CONFIRMED' || b.status === 'PENDING' ? 'bg-indigo-100 text-indigo-700' :
                            b.status === 'CHECKED_IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                            <button 
                              onClick={() => openCheckIn(b)}
                              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                              Nhận phòng (Check-in)
                            </button>
                          )}
                          {b.status === 'CHECKED_IN' && (
                            <button 
                              onClick={() => openCheckOut(b)}
                              className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 font-semibold"
                            >
                              Trả phòng (Check-out)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Check-In Dialog */}
      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Làm thủ tục Nhận phòng (Check-in)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">Vui lòng chọn phòng trống thuộc hạng <strong>{selectedBooking?.roomType?.name}</strong>:</p>
            <select 
              className="w-full border p-2 rounded-xl text-sm"
              value={selectedRoomId || ''}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
            >
              <option value="">-- Chọn phòng --</option>
              {availableRoomsForCheckin.map(r => (
                <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>
              ))}
            </select>
            {availableRoomsForCheckin.length === 0 && (
              <p className="text-xs text-rose-500 italic">Không có phòng trống cho hạng phòng này!</p>
            )}
            <button 
              onClick={handleCheckIn}
              disabled={!selectedRoomId}
              className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold disabled:bg-slate-300"
            >
              Xác nhận Check-in
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-Out Dialog */}
      <Dialog open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Làm thủ tục Trả phòng (Check-out)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">Bạn đang làm thủ tục trả phòng cho Booking <strong>#{selectedBooking?.id}</strong>.</p>
            <p className="text-sm">Phòng vật lý hiện tại: <strong>{selectedBooking?.room?.roomNumber}</strong></p>
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm border">
              <div className="flex justify-between">
                <span>Tổng tiền:</span>
                <span className="font-bold">${selectedBooking?.totalPrice}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Phụ phí phát sinh (Minibar, hư hỏng):</span>
                <span className="font-bold">$0</span>
              </div>
            </div>
            <button 
              onClick={handleCheckOut}
              className="w-full bg-rose-600 text-white py-2 rounded-xl font-bold"
            >
              Xác nhận Thanh toán & Check-out
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
