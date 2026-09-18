import type { Metadata } from "next";
import { CustomerGate } from "@/components/auth/auth-gate";
import { CheckoutReview } from "@/components/checkout/checkout-review";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Checkout | Safar.pk",
  robots: { index: false, follow: false },
};
export default function CheckoutPage() {
  return (
    <main>
      <Section>
        <Container>
          <div className="mb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
              Final review
            </p>
            <h1 className="heading-one mt-3">Checkout</h1>
            <p className="body-copy mt-3 text-muted">
              Review your selected tour before confirming your booking.
            </p>
          </div>
          <CustomerGate next="/checkout" resourceLabel="checkout">
            <CheckoutReview />
          </CustomerGate>
        </Container>
      </Section>
    </main>
  );
}
