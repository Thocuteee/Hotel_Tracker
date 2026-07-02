import { Card, CardContent } from '@/components/ui/card';
import { Bed } from 'lucide-react';

interface RoomTypeCardProps {
  title: string;
  total: number;
  bookedPercentage: number;
  colorVariant: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    progress: 'bg-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    progress: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    progress: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    progress: 'bg-rose-500',
  },
};

export default function RoomTypeCard({ title, total, bookedPercentage, colorVariant }: RoomTypeCardProps) {
  const colors = colorMap[colorVariant];
  
  return (
    <Card className="rounded-2xl border-border-color shadow-sm transition-all hover:shadow-md bg-card-bg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-text-muted mb-1">{title}</h3>
            <span className="text-2xl font-bold text-card-text">{total}</span>
            <span className="text-xs text-text-muted mt-1">Tổng số phòng</span>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} dark:bg-opacity-20`}>
            <Bed className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex gap-1">
            <div 
              className={`h-full rounded-full ${colors.progress}`} 
              style={{ width: `${bookedPercentage}%` }}
            />
            {/* The rest is implicitly represented by the gap and bg-slate-100 */}
          </div>
          <div className="flex justify-start items-center text-sm">
            <span className={`font-bold ${colors.text}`}>{bookedPercentage}%</span>
            <span className="text-text-muted ml-1">đã đặt</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
