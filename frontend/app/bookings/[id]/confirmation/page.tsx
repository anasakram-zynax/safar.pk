import type { Metadata } from "next";
import { BookingConfirmation } from "@/components/bookings/booking-confirmation";
import { CustomerGate } from "@/components/auth/auth-gate";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Booking confirmation | Safar.pk",
  robots: { index: false, follow: false },
};
export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const next = `/bookings/${encodeURIComponent(id)}/confirmation`;
  return (
    <main>
      <Section>
        <Container>
          <CustomerGate next={next} resourceLabel="booking confirmation">
            <BookingConfirmation bookingId={id} />
          </CustomerGate>
        </Container>
      </Section>
    </main>
  );
}
