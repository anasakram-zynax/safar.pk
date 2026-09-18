import { AdminTourEditor } from "@/components/admin/admin-tour-editor";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Tour management</p><h1 className="heading-one mt-3">Edit tour</h1><p className="body-copy mt-3 text-muted">Update tour details and publication status.</p><div className="mt-9"><AdminTourEditor tourId={id} /></div></div>;
}
