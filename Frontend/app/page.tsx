import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import RoomTypeCard from '@/components/dashboard/RoomTypeCard';
import { DollarSign, BedDouble, CalendarX2, Percent } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng doanh thu"
          value="45,231,000 đ"
          icon={DollarSign}
          description="+20.1% so với tháng trước"
          trend="up"
          colorVariant="indigo"
        />
        <StatCard
          title="Số phòng đã đặt"
          value="+235"
          icon={BedDouble}
          description="+18% so với tháng trước"
          trend="up"
          colorVariant="emerald"
        />
        <StatCard
          title="Số phòng trống"
          value="12"
          icon={CalendarX2}
          description="-4% so với tháng trước"
          trend="down"
          colorVariant="amber"
        />
        <StatCard
          title="Tỉ lệ lấp đầy"
          value="89%"
          icon={Percent}
          description="+7% so với tháng trước"
          trend="up"
          colorVariant="rose"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-7">
        <RevenueChart />
        <RecentBookingsTable />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <RoomTypeCard
          title="Phòng Standard"
          total={48}
          bookedPercentage={64}
          colorVariant="indigo"
        />
        <RoomTypeCard
          title="Phòng Deluxe"
          total={24}
          bookedPercentage={70}
          colorVariant="emerald"
        />
        <RoomTypeCard
          title="Phòng Superior"
          total={16}
          bookedPercentage={56}
          colorVariant="amber"
        />
        <RoomTypeCard
          title="Phòng Suite"
          total={8}
          bookedPercentage={80}
          colorVariant="rose"
        />
      </div>
    </div>
  );
}
