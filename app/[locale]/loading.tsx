import { CarCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

// Shown instantly on navigation to "/" while the homepage's Supabase queries
// resolve. Mirrors the marketplace hero (headline + search panel) + car grid.
export default function HomeLoading() {
  return (
    <div>
      <div className="border-b border-line px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-content">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-12 w-3/4 max-w-xl" />
          <Skeleton className="mt-4 h-6 w-2/3 max-w-md" />
          <Skeleton className="mt-8 h-32 w-full rounded-card" />
        </div>
      </div>
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <Skeleton className="mb-6 h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
