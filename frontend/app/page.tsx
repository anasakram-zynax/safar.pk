import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Map,
  MapPin,
  MountainSnow,
  Search,
  ShieldCheck,
} from "lucide-react";
import { GradientText } from "@/components/animations/gradient-text";
import {
  SlideUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/reveal";
import { FeaturedTours } from "@/components/home/featured-tours";
import {
  BeyondImage,
  FeaturedDestinations,
  FeaturedDestinationsSkeleton,
  HeroImage,
  HeroImageFallback,
} from "@/components/home/homepage-images";
import { getHomepageTours } from "@/lib/api/homepage";
import { TourGridSkeleton } from "@/components/skeletons/tour-grid-skeleton";
import { Badge } from "@/components/ui/badge";
import { buttonClassName, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

const reasons = [
  {
    title: "Journeys worth discovering",
    text: "Explore tour options that bring Pakistan's landscapes and places into focus.",
    icon: Compass,
  },
  {
    title: "Details that help you choose",
    text: "See the location, duration and price of a tour before planning your trip.",
    icon: ShieldCheck,
  },
  {
    title: "More of Pakistan",
    text: "From mountain valleys to cultural destinations, find a direction that feels yours.",
    icon: Map,
  },
] as const;

export default function Home() {
  const toursPromise = getHomepageTours();
  return (
    <main>
      <Section className="relative overflow-hidden pb-12 pt-12 sm:pt-16 lg:pb-24 lg:pt-20">
        <Container className="relative grid items-center gap-11 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-12">
          <StaggerContainer className="max-w-2xl">
            <StaggerItem>
              <Badge className="gap-2">
                <span className="size-1.5 rounded-full bg-primary" />
                Explore Pakistan
              </Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="display-heading mt-6">
                Discover Pakistan,
                <br />
                <GradientText>one journey at a time.</GradientText>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="body-copy mt-6 max-w-xl text-muted sm:text-lg">
                Find memorable tours through Pakistan&apos;s mountains, valleys,
                cities and cultural landscapes.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tours" className={buttonClassName({ size: "lg" })}>
                  Explore tours <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="#destinations"
                  className={buttonClassName({
                    variant: "outline",
                    size: "lg",
                  })}
                >
                  Discover more <ArrowDown size={17} aria-hidden="true" />
                </Link>
              </div>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-8 flex items-center gap-2 text-sm text-muted">
                <MapPin size={16} className="text-primary" aria-hidden="true" />{" "}
                Your next story begins somewhere in Pakistan.
              </p>
            </StaggerItem>
          </StaggerContainer>
          <SlideUp delay={0.1} className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] border border-white/70 bg-surface-muted shadow-[0_30px_70px_-35px_rgba(23,43,66,.35)] sm:aspect-[6/5] lg:aspect-[5/5]">
              <Suspense fallback={<HeroImageFallback />}>
                <HeroImage toursPromise={toursPromise} />
              </Suspense>
            </div>
          </SlideUp>
        </Container>
      </Section>

      <Container>
        <SlideUp>
          <form
            action="/tours"
            method="GET"
            role="search"
            className="relative z-10 -mt-2 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-[0_20px_50px_-35px_rgba(23,43,66,.35)] sm:flex-row sm:items-center sm:p-5 lg:-mt-12"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary">
              <Search
                size={20}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <label htmlFor="tour-search" className="sr-only">
                Search destinations or tours
              </label>
              <input
                id="tour-search"
                name="search"
                type="search"
                placeholder="Where would you like to go?"
                className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none focus:ring-0 focus-visible:outline-none placeholder:text-muted"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Search tours <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </form>
        </SlideUp>
      </Container>

      <Section
        id="destinations"
        aria-labelledby="destinations-title"
        className="scroll-mt-24 pt-20 sm:pt-24"
      >
        <Container>
          <SlideUp>
            <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
                  Places to dream about
                </p>
                <h2 id="destinations-title" className="heading-two mt-3">
                  Featured destinations
                </h2>
                <p className="body-copy mt-3 max-w-xl text-muted">
                  A few corners of Pakistan that stay with you long after the
                  journey.
                </p>
              </div>
              <Link
                href="/tours"
                className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-primary-hover transition-colors hover:text-primary"
              >
                Explore all tours <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </SlideUp>
          <Suspense fallback={<FeaturedDestinationsSkeleton />}>
            <FeaturedDestinations toursPromise={toursPromise} />
          </Suspense>
        </Container>
      </Section>

      <Section aria-labelledby="why-title" className="bg-white/65">
        <Container>
          <SlideUp>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
                Why Safar.pk
              </p>
              <h2 id="why-title" className="heading-two mt-3">
                Travel begins with curiosity.
              </h2>
              <p className="body-copy mt-3 text-muted">
                Find a place that inspires you, then choose a journey that fits.
              </p>
            </div>
          </SlideUp>
          <StaggerContainer className="mt-9 grid gap-5 md:grid-cols-3">
            {reasons.map(({ title, text, icon: Icon }) => (
              <StaggerItem key={title}>
                <Card className="h-full shadow-none">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
                    <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h3 className="heading-three mt-5">{title}</h3>
                  <p className="body-copy mt-3 text-sm text-muted">{text}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section aria-labelledby="tours-title">
        <Container>
          <SlideUp>
            <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
                  Ready when you are
                </p>
                <h2 id="tours-title" className="heading-two mt-3">
                  Featured tours
                </h2>
                <p className="body-copy mt-3 text-muted">
                  Published journeys from our latest collection.
                </p>
              </div>
              <Link
                href="/tours"
                className="inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-primary-hover hover:text-primary"
              >
                View all tours <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </SlideUp>
          <Suspense fallback={<TourGridSkeleton count={3} />}>
            <FeaturedTours toursPromise={toursPromise} />
          </Suspense>
        </Container>
      </Section>

      <Section
        aria-labelledby="experience-title"
        className="bg-surface-muted/70"
      >
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-16">
          <SlideUp>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_22px_55px_-35px_rgba(23,43,66,.3)] sm:aspect-[6/4]">
              <Suspense fallback={<div className="absolute inset-0 bg-surface-muted" />}>
                <BeyondImage toursPromise={toursPromise} />
              </Suspense>
            </div>
          </SlideUp>
          <SlideUp delay={0.08}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">
                Beyond the itinerary
              </p>
              <h2 id="experience-title" className="heading-two mt-3">
                Many ways to feel Pakistan.
              </h2>
              <p className="body-copy mt-5 text-muted">
                Follow a mountain road, take in a valley, or spend time where
                history and everyday life meet.
              </p>
              <div className="mt-8 space-y-5 border-l border-primary/25 pl-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    01 · Mountains
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Wide horizons and high-altitude paths.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    02 · Culture
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Places shaped by generations of stories.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    03 · Nature
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Rivers, forests and room to slow down.
                  </p>
                </div>
              </div>
            </div>
          </SlideUp>
        </Container>
      </Section>

      <Section aria-labelledby="final-cta-title">
        <Container>
          <SlideUp>
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#2869bd] to-[#288cae] px-6 py-14 text-white sm:px-12 sm:py-16 lg:px-16">
              <MountainSnow
                className="absolute -bottom-16 -right-10 size-64 text-white/10 sm:size-80"
                strokeWidth={0.7}
                aria-hidden="true"
              />
              <div className="relative max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.17em] text-white/80">
                  The road is calling
                </p>
                <h2
                  id="final-cta-title"
                  className="heading-two mt-3 text-white"
                >
                  Your next journey starts here.
                </h2>
                <p className="body-copy mt-4 text-white/85">
                  Discover a destination, find a tour, and make space for the
                  memorable moments ahead.
                </p>
                <Link
                  href="/tours"
                  className={buttonClassName({
                    variant: "secondary",
                    size: "lg",
                    className:
                      "mt-7 bg-white text-primary-hover hover:bg-white/90",
                  })}
                >
                  Explore tours <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </SlideUp>
        </Container>
      </Section>
    </main>
  );
}
