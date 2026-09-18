import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { DiscoveryControls } from "@/components/tours/discovery-controls";
import { ResultsSkeleton, TourResults } from "@/components/tours/tour-results";
import { parseTourQuery, queryParams } from "@/lib/tours-query";

export const metadata: Metadata = {
  title: "Tours in Pakistan | Safar.pk",
  description:
    "Discover curated tours across Pakistan and find a journey that fits your plans.",
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseTourQuery(await searchParams);
  const key = queryParams(query).toString();
  return (
    <main>
      <section className="pb-8 pt-12 sm:pt-16">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
            Explore Pakistan
          </p>
          <h1 className="heading-one mt-3">Find your next journey.</h1>
          <p className="body-copy mt-4 max-w-2xl">
            Browse published tours, follow a place that inspires you, and find
            the trip that fits your plans.
          </p>
        </Container>
      </section>
      <section className="pb-20 pt-3 sm:pt-5">
        <Container>
          <DiscoveryControls key={key} query={query}>
            <Suspense key={key} fallback={<ResultsSkeleton />}>
              <TourResults query={query} />
            </Suspense>
          </DiscoveryControls>
        </Container>
      </section>
    </main>
  );
}
