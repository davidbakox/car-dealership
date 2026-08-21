import { CarCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function CarsLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-6 h-5 w-72" />
      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="mb-4 mt-6 h-4 w-32" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CarCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
