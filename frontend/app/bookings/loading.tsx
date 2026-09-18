import { BookingHistorySkeleton } from "@/components/bookings/booking-history";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function Loading() {
  return (
    <main>
      <Section>
        <Container>
          <div className="mb-9 animate-pulse">
            <div className="h-4 w-28 rounded bg-surface-muted" />
            <div className="mt-4 h-12 w-60 rounded bg-surface-muted" />
            <div className="mt-4 h-5 w-96 max-w-full rounded bg-surface-muted" />
          </div>
          <BookingHistorySkeleton />
        </Container>
      </Section>
    </main>
  );
}
