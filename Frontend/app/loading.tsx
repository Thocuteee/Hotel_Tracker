import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="mt-4 h-4 w-[150px]" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <Skeleton className="h-5 w-[200px]" />
          </div>
          <div className="p-6">
            <Skeleton className="h-[350px] w-full" />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="mt-2 h-4 w-[250px]" />
          </div>
          <div className="p-6 space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
