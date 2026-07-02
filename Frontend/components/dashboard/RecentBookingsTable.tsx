import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const recentBookings = [
  {
    id: "BK-3210",
    customer: "Nguyễn Văn A",
    room: "P. 101 - Standard",
    date: "02/07/2026",
    status: "Đã thanh toán",
  },
  {
    id: "BK-3209",
    customer: "Trần Thị B",
    room: "P. 205 - Deluxe",
    date: "01/07/2026",
    status: "Đã đặt",
  },
  {
    id: "BK-3208",
    customer: "Lê Văn C",
    room: "P. 302 - Suite",
    date: "01/07/2026",
    status: "Đã thanh toán",
  },
  {
    id: "BK-3207",
    customer: "Phạm Thị D",
    room: "P. 201 - Superior",
    date: "30/06/2026",
    status: "Đã hủy",
  },
  {
    id: "BK-3206",
    customer: "Hoàng Văn E",
    room: "P. 105 - Standard",
    date: "30/06/2026",
    status: "Đã thanh toán",
  },
]

export default function RecentBookingsTable() {
  return (
    <Card className="col-span-1 lg:col-span-3 rounded-2xl border-border-color shadow-sm bg-card-bg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-transparent px-6 py-6 pb-2">
        <CardTitle className="text-base font-semibold text-card-text">Giao dịch gần đây</CardTitle>
        <button className="rounded-md border border-border-color px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-bg-hover transition-colors">
          Xem tất cả
        </button>
      </CardHeader>
      <CardContent className="p-0 bg-card-bg rounded-b-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              <TableHead className="font-medium text-text-muted h-12">Mã</TableHead>
              <TableHead className="font-medium text-text-muted h-12">Khách hàng</TableHead>
              <TableHead className="font-medium text-text-muted h-12">Phòng</TableHead>
              <TableHead className="font-medium text-text-muted h-12">Ngày đặt</TableHead>
              <TableHead className="font-medium text-text-muted h-12 text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((booking) => (
              <TableRow key={booking.id} className="border-border-light hover:bg-bg-hover/50">
                <TableCell className="font-medium text-card-text/80 py-4">{booking.id}</TableCell>
                <TableCell className="text-card-text py-4 font-medium">{booking.customer}</TableCell>
                <TableCell className="text-text-muted py-4">{booking.room}</TableCell>
                <TableCell className="text-text-muted py-4">{booking.date}</TableCell>
                <TableCell className="py-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    booking.status === "Đã thanh toán" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
                    booking.status === "Đã hủy" ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400" : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    {booking.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
