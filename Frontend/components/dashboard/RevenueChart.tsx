"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronDown } from 'lucide-react';

const data = [
  { name: 'Thứ 2', total: 4200 },
  { name: 'Thứ 3', total: 3800 },
  { name: 'Thứ 4', total: 2400 },
  { name: 'Thứ 5', total: 3200 },
  { name: 'Thứ 6', total: 5540 },
  { name: 'Thứ 7', total: 2400 },
  { name: 'CN', total: 5800 },
];

export default function RevenueChart() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    
    // Lắng nghe thay đổi class trên thẻ html
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-4 rounded-2xl border-border-color shadow-sm bg-card-bg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-transparent px-6 py-6 pb-2">
        <CardTitle className="text-base font-semibold text-card-text">Doanh thu 7 ngày gần nhất</CardTitle>
        <button className="flex items-center gap-1 rounded-md border border-border-color px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-bg-hover transition-colors">
          7 ngày qua <ChevronDown className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="p-6 pt-4 bg-card-bg rounded-b-xl">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  backgroundColor: '#0f172a',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [`${value}`, 'Doanh thu']}
              />
              <Bar dataKey="total" fill="url(#colorRevenue)" radius={[6, 6, 6, 6]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
