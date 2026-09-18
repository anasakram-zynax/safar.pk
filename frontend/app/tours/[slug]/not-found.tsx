import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { buttonClassName } from "@/components/ui/button";

export default function TourNotFound() {
  return (
    <main>
      <Section>
        <Container className="text-center">
          <h1 className="heading-one">Tour not found</h1>
          <p className="body-copy mx-auto mt-4 max-w-lg text-muted">
            This tour may have moved or is no longer available. Explore our
            current journeys instead.
          </p>
          <Link
            href="/tours"
            className={buttonClassName({ className: "mt-7" })}
          >
            Browse tours
          </Link>
        </Container>
      </Section>
    </main>
  );
}
