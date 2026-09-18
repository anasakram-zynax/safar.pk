import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const styles: Record<BookingStatus, string> = {
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-800",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return <Badge className={cn("border", styles[status])}>{status}</Badge>;
}
