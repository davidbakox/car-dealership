import { Skeleton } from "@/components/ui/Skeleton";

export default function CarDetailLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Skeleton className="aspect-[4/3] w-full rounded-card" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}
