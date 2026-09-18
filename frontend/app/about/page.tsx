import type { Metadata } from "next";
import { AboutContent } from "@/components/about/about-content";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "About Safar.pk | Discover Pakistan",
  description: "Learn how Safar.pk helps travelers discover and book tours across Pakistan.",
};

export default function AboutPage() {
  return (
    <main>
      <Section>
        <Container>
          <AboutContent />
        </Container>
      </Section>
    </main>
  );
}
