import type { Metadata } from "next";
import { CustomerGate } from "@/components/auth/auth-gate";
import { BookingDetails } from "@/components/bookings/booking-details";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Booking details | Safar.pk",
  robots: { index: false, follow: false },
};

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const next = `/bookings/${encodeURIComponent(id)}`;
  return (
    <main>
      <Section>
        <Container>
          <CustomerGate next={next} resourceLabel="booking details">
            <BookingDetails bookingId={id} />
          </CustomerGate>
        </Container>
      </Section>
    </main>
  );
}
