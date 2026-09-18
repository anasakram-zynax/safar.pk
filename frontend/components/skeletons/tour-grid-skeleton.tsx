import { cn } from "@/lib/utils";
import { TourCardSkeleton } from "./tour-card-skeleton";

export function TourGridSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return <div role="status" aria-label="Loading tours" className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>{Array.from({ length: count }, (_, index) => <TourCardSkeleton key={index} />)}</div>;
}
