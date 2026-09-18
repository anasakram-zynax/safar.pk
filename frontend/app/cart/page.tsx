import type { Metadata } from "next";
import { CartSummary } from "@/components/cart/cart-summary";
import { CustomerGate } from "@/components/auth/auth-gate";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Your cart | Safar.pk",
  robots: { index: false, follow: false },
};
export default function CartPage() {
  return (
    <main>
      <Section>
        <Container>
          <div className="mb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
              Your journey
            </p>
            <h1 className="heading-one mt-3">Your cart</h1>
            <p className="body-copy mt-3 text-muted">
              Review your selected tour before continuing.
            </p>
          </div>
          <CustomerGate next="/cart">
            <CartSummary />
          </CustomerGate>
        </Container>
      </Section>
    </main>
  );
}
