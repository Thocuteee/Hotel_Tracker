"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Paintbrush, Clock, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface Room {
  id: number;
  roomNumber: string;
  status: string;
  roomType: { id: number; name: string };
}

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const stompClient = useRef<Client | null>(null);

  const fetchRoomsToClean = async () => {
    try {
      const res = await api.get('/api/v1/housekeeping/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoomsToClean();

    // WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log('Connected to WebSocket for Housekeeping');
        client.subscribe('/topic/room-status', (msg) => {
          const updatedRoom = JSON.parse(msg.body);
          setRooms((prev) => {
            // Only keep DIRTY or CLEANING rooms in this list
            if (updatedRoom.status === 'DIRTY' || updatedRoom.status === 'CLEANING') {
              const exists = prev.find(r => r.id === updatedRoom.id);
              if (exists) {
                return prev.map(r => r.id === updatedRoom.id ? updatedRoom : r);
              } else {
                return [...prev, updatedRoom];
              }
            } else {
              return prev.filter(r => r.id !== updatedRoom.id);
            }
          });
        });
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const updateStatus = async (roomId: number, status: string) => {
    try {
      await api.patch(`/api/v1/housekeeping/rooms/${roomId}/status?status=${status}`);
      // No need to fetch again, WebSocket will update it!
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật trạng thái phòng!');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Nghiệp vụ Buồng Phòng</h1>
          <p className="text-indigo-100 text-sm mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 
            Danh sách phòng cần dọn dẹp hôm nay.
          </p>
        </div>
        <div className="bg-white/20 p-3 rounded-full">
          <Paintbrush className="w-8 h-8" />
        </div>
      </div>

      <div className="space-y-4">
        {rooms.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-50" />
            <p>Tất cả các phòng đã được dọn sạch!</p>
          </div>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className={`overflow-hidden transition-all duration-300 border-l-4 ${room.status === 'CLEANING' ? 'border-amber-500 bg-amber-50' : 'border-rose-500'}`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-slate-900">Phòng {room.roomNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${room.status === 'CLEANING' ? 'bg-amber-200 text-amber-800' : 'bg-rose-200 text-rose-800'}`}>
                      {room.status === 'CLEANING' ? 'ĐANG DỌN' : 'CẦN DỌN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    Hạng phòng: {room.roomType.name}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  {room.status === 'DIRTY' && (
                    <button 
                      onClick={() => updateStatus(room.id, 'CLEANING')}
                      className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Clock className="w-4 h-4" /> Bắt đầu dọn
                    </button>
                  )}
                  {room.status === 'CLEANING' && (
                    <button 
                      onClick={() => updateStatus(room.id, 'AVAILABLE')}
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Dọn xong
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
