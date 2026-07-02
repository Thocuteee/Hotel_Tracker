import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: 'up' | 'down';
  colorVariant?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-100 dark:border-indigo-900/50',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/50',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/50',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/50',
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
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</p>
            {Icon && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}>
                <Icon className={`h-5 w-5 ${colors.text}`} />
              </div>
            )}
          </div>
          
          <div className="text-3xl font-extrabold tracking-tight text-card-text">{value}</div>
          
          {description && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                trend === 'up' 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
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
