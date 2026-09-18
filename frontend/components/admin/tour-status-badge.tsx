import { Badge } from "@/components/ui/badge";
import type { TourStatus } from "@/types/admin-tour";

const statusClasses: Record<TourStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-800",
  PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ARCHIVED: "border-slate-200 bg-slate-100 text-slate-700",
};

export function TourStatusBadge({ status }: { status: TourStatus }) {
  return <Badge className={statusClasses[status]}>{status}</Badge>;
}
