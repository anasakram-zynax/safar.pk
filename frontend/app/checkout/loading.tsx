import { Container } from "@/components/ui/container";
import { CheckoutSkeleton } from "@/components/checkout/checkout-review";

export default function Loading() {
  return (
    <main>
      <Container className="py-12">
        <div className="mb-9 animate-pulse">
          <div className="h-4 w-28 rounded bg-surface-muted" />
          <div className="mt-4 h-12 w-56 rounded bg-surface-muted" />
        </div>
        <CheckoutSkeleton />
      </Container>
    </main>
  );
}
