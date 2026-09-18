import type { Metadata } from "next";
import { CustomerGate } from "@/components/auth/auth-gate";
import { BookingHistory } from "@/components/bookings/booking-history";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "My Bookings | Safar.pk",
  robots: { index: false, follow: false },
};

export default function BookingsPage() {
  return (
    <main>
      <Section>
        <Container>
          <div className="mb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Your journeys</p>
            <h1 className="heading-one mt-3">My Bookings</h1>
            <p className="body-copy mt-3 text-muted">View your confirmed journeys with Safar.pk.</p>
          </div>
          <CustomerGate next="/bookings" resourceLabel="booking history">
            <BookingHistory />
          </CustomerGate>
        </Container>
      </Section>
    </main>
  );
}
