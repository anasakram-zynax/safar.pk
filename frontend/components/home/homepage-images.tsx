import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations/reveal";
import { TourImage } from "@/components/common/tour-image";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import type { HomepageTourData } from "@/lib/api/homepage";
import { getTourCover } from "@/lib/tour-cover";
import { Skeleton } from "@/components/skeletons/skeleton";

type Props = { toursPromise: Promise<HomepageTourData> };

export function HeroImageFallback() {
  return (
    <>
      <Image src="/images/hunza.webp" alt="Illustrative view of Karakoram mountains and a river valley inspired by Hunza" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b2c45]/55 to-transparent" aria-hidden="true" />
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/35 bg-white/90 px-4 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm sm:bottom-7 sm:left-7"><MapPin size={14} className="text-primary" aria-hidden="true" /> Northern Pakistan</div>
    </>
  );
}

export async function HeroImage({ toursPromise }: Props) {
  const { tours } = await toursPromise;
  const slides = tours
    .map((tour) => ({ tour, cover: getTourCover(tour) }))
    .filter(({ cover }) => cover !== undefined)
    .slice(0, 6)
    .map(({ tour, cover }) => ({
      url: cover!.url,
      alt: cover!.altText || `${tour.title} tour landscape`,
      location: tour.location,
    }));
  return slides.length > 0 ? <HeroSlideshow slides={slides} /> : <HeroImageFallback />;
}

export function FeaturedDestinationsSkeleton() {
  return <div role="status" aria-label="Loading featured destinations" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="aspect-[4/5] rounded-2xl sm:aspect-[4/4.5] lg:aspect-[3/4]" />)}</div>;
}

export async function FeaturedDestinations({ toursPromise }: Props) {
  const { tours } = await toursPromise;
  const featured = tours.filter((tour) => getTourCover(tour)).slice(0, 4);
  if (!featured.length) return <p className="body-copy">Destinations are taking a short pause.</p>;

  return (
    <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((tour) => (
        <StaggerItem key={tour.id}>
          <Link href={`/tours/${encodeURIComponent(tour.slug)}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[0_14px_34px_-28px_rgba(23,43,66,.45)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(23,43,66,.4)] focus-visible:outline-offset-4 sm:aspect-[4/4.5] lg:aspect-[3/4]">
            <TourImage image={getTourCover(tour)} title={tour.title} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#092b41]/85 via-[#092b41]/25 to-transparent" aria-hidden="true" />
            <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-2 text-white"><span><span className="block text-xs font-medium text-white/80">{tour.location}</span><span className="mt-1 block text-xl font-semibold tracking-tight">{tour.title}</span></span><ArrowUpRight size={19} aria-hidden="true" /></span>
          </Link>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export async function BeyondImage({ toursPromise }: Props) {
  const { tours } = await toursPromise;
  const tour =
    tours.find(
      (item) =>
        item.tags?.some(({ tag }) => tag.slug === "nature") &&
        getTourCover(item),
    ) ?? tours.find((item) => getTourCover(item));
  const cover = tour && getTourCover(tour);
  return cover && tour ? (
    <TourImage image={cover} title={tour.title} sizes="(max-width: 1024px) 100vw, 55vw" />
  ) : (
    <Image src="/images/swat.webp" alt="Illustrative green valley and river landscape inspired by Swat" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
  );
}
