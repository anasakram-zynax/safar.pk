import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { TourImage } from "@/components/common/tour-image";
import { TourCta } from "@/components/tours/tour-cta";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getTourDetail } from "@/lib/api/tour-detail";
import { isAllowedCloudinaryImage } from "@/lib/cloudinary-image";

type Props = { params: Promise<{ slug: string }> };
const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const tour = await getTourDetail((await params).slug);
    if (!tour) return { title: "Tour not found | Safar.pk" };
    const image = [...tour.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .find((item) => isAllowedCloudinaryImage(item.url));
    const description = tour.description.trim().slice(0, 160);
    return {
      title: `${tour.title} | Safar.pk`,
      description,
      openGraph: {
        title: `${tour.title} | Safar.pk`,
        description,
        images: image
          ? [{ url: image.url, alt: image.altText || tour.title }]
          : [],
      },
    };
  } catch {
    return { title: "Tour details | Safar.pk" };
  }
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  let tour;
  try {
    tour = await getTourDetail(slug);
  } catch {
    return (
      <Section>
        <Container>
          <div
            role="alert"
            className="rounded-2xl border border-border bg-surface p-10 text-center"
          >
            <h1 className="heading-two">We couldn&apos;t load this tour.</h1>
            <p className="body-copy mt-3">Please try again in a moment.</p>
            <a
              href={`/tours/${encodeURIComponent(slug)}`}
              className="mt-5 inline-block font-semibold text-primary-hover underline underline-offset-4"
            >
              Retry
            </a>
          </div>
        </Container>
      </Section>
    );
  }
  if (!tour) notFound();

  const images = [...tour.images]
    .filter((image) => isAllowedCloudinaryImage(image.url))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3);
  const price = Number(tour.price);
  const formattedPrice = Number.isFinite(price)
    ? priceFormatter.format(price)
    : "Price unavailable";

  return (
    <main>
      <Section className="pt-8 sm:pt-10">
        <Container>
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap items-center gap-2 text-sm text-muted"
          >
            <Link href="/" className="hover:text-primary-hover">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/tours" className="hover:text-primary-hover">
              Tours
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">
              {tour.title}
            </span>
          </nav>
          <div className="mb-7">
            <h1 className="heading-one">{tour.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <MapPin size={18} aria-hidden="true" />
                {tour.location}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={18} aria-hidden="true" />
                {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          <div
            className={`grid gap-3 overflow-hidden rounded-2xl ${images.length > 1 ? "md:grid-cols-2" : ""} ${images.length > 2 ? "md:grid-rows-2" : ""}`}
          >
            <div
              className={`relative aspect-4/3 overflow-hidden bg-surface-muted md:aspect-auto ${images.length > 2 ? "md:row-span-2 md:min-h-[440px]" : "md:min-h-[350px]"}`}
            >
              <TourImage
                image={images[0]}
                title={tour.title}
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
            {images.slice(1).map((image) => (
              <div
                key={image.id}
                className={`relative aspect-4/3 overflow-hidden bg-surface-muted md:aspect-auto ${images.length === 2 ? "md:min-h-[350px]" : "md:min-h-[214px]"}`}
              >
                <TourImage
                  image={image}
                  title={tour.title}
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            ))}
          </div>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <div>
              <div className="flex flex-wrap gap-2">
                {tour.tags.map(({ tag }) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
              <h2 className="heading-two mt-7">About this tour</h2>
              <p className="body-copy mt-4 whitespace-pre-line text-muted">
                {tour.description}
              </p>
            </div>
            <TourCta
              tourId={tour.id}
              slug={tour.slug}
              price={formattedPrice}
              durationDays={tour.durationDays}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
