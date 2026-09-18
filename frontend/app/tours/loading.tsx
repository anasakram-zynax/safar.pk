import { Container } from "@/components/ui/container";
import { ResultsSkeleton } from "@/components/tours/tour-results";

export default function Loading() {
  return (
    <main>
      <section className="pb-8 pt-12 sm:pt-16">
        <Container>
          <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="mt-5 h-12 w-80 max-w-full animate-pulse rounded bg-surface-muted" />
        </Container>
      </section>
      <section className="pb-20 pt-3 sm:pt-5">
        <Container>
          <ResultsSkeleton />
        </Container>
      </section>
    </main>
  );
}
