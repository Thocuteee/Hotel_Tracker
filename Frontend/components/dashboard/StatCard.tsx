import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down';
  colorVariant?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
  },
};

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend = 'up',
  colorVariant = 'indigo'
}: StatCardProps) {
  const colors = colorMap[colorVariant];
  
  return (
    <Card className="rounded-2xl border-border-color shadow-sm transition-all hover:shadow-md bg-card-bg">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.text}`} />
            </div>
          </div>
          
          <div className="text-3xl font-bold tracking-tight text-card-text">{value}</div>
          
          {description && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {description.split(' ')[0]}
              </div>
              <span className="text-xs font-medium text-text-muted">
                {description.substring(description.indexOf(' ') + 1)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
