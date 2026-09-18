import { BookingLoadingSkeleton } from "@/components/bookings/booking-presentation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function Loading() {
  return (
    <main>
      <Section>
        <Container>
          <BookingLoadingSkeleton />
        </Container>
      </Section>
    </main>
  );
}
