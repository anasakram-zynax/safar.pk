import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations/reveal";
import { TourCard } from "@/components/common/tour-card";
import { buttonClassName } from "@/components/ui/button";
import type { HomepageTourData } from "@/lib/api/homepage";

export async function FeaturedTours({
  toursPromise,
}: {
  toursPromise: Promise<HomepageTourData>;
}) {
  const { tours, error } = await toursPromise;
  if (error) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12"
      >
        <Compass
          size={30}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h3 className="heading-three mt-4">Tours are taking a short pause</h3>
        <p className="body-copy mx-auto mt-2 max-w-md text-muted">
          We couldn&apos;t load tours right now. Please explore again in a
          moment.
        </p>
        <Link
          href="/tours"
          className={buttonClassName({
            variant: "secondary",
            className: "mt-6",
          })}
        >
          Browse tours <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12"
      >
        <Compass
          size={30}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h3 className="heading-three mt-4">New journeys are on their way</h3>
        <p className="body-copy mx-auto mt-2 max-w-md text-muted">
          There are no published tours to show yet. Check back soon for places
          to explore.
        </p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tours.slice(0, 3).map((tour) => (
        <StaggerItem key={tour.id}>
          <TourCard tour={tour} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
