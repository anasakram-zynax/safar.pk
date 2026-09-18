import { TourForm } from "@/components/admin/tour-form";

export default function NewTourPage() {
  return <div><p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Tour management</p><h1 className="heading-one mt-3">Create tour</h1><p className="body-copy mt-3 text-muted">Add a new tour to Safar.pk. Images can be managed later.</p><div className="mt-9"><TourForm /></div></div>;
}
