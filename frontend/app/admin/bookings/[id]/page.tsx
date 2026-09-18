import { AdminBookingDetails } from "@/components/admin/admin-booking-details";

export default async function AdminBookingDetailsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminBookingDetails id={id} />; }
