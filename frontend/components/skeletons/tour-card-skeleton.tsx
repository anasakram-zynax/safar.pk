import { Card } from "@/components/ui/card";
import { Skeleton } from "./skeleton";

export function TourCardSkeleton() {
  return <Card className="overflow-hidden p-0 sm:p-0"><Skeleton className="aspect-[4/3] rounded-none" /><div className="space-y-4 p-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><div className="flex items-center justify-between pt-3"><Skeleton className="h-5 w-20" /><Skeleton className="h-9 w-24" /></div></div></Card>;
}
