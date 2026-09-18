"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/animations/reveal";
import { buttonClassName } from "@/components/ui/button";

export function AboutContent() {
  return (
    <>
      <SlideUp className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">About Safar.pk</p>
        <h1 className="heading-one mt-3">Travel with a clearer view of Pakistan.</h1>
        <p className="body-copy mt-5 text-muted">
          Safar.pk helps travelers discover memorable destinations across Pakistan and turn inspiration into straightforward tour bookings. Explore available journeys, compare the details that matter, and keep your selected and booked tours in one simple place.
        </p>
        <p className="body-copy mt-4 text-muted">
          Our goal is to make discovering Pakistan easier, more considered, and more enjoyable from the first idea to the confirmed booking.
        </p>
      </SlideUp>
      <section className="mt-14 grid items-center gap-8 lg:mt-20 lg:grid-cols-2 lg:gap-14">
        <FadeIn className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[0_20px_48px_-32px_rgba(23,43,66,.42)]">
          <Image
            src="/images/skardu.webp"
            alt="Mountain landscape in Skardu, Pakistan"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </FadeIn>
        <SlideUp className="lg:py-6" delay={0.08}>
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
            <Compass size={22} aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Discover with confidence</p>
          <h2 className="heading-two mt-3">Discover Pakistan with Safar.pk</h2>
          <p className="body-copy mt-5 text-muted">
            Browse tours across Pakistan, review useful location, duration, and price information, then move from a selected tour to a booking without unnecessary steps.
          </p>
          <p className="body-copy mt-4 text-muted">
            Safar.pk keeps the journey clear: find a destination, understand the tour, and return to your bookings whenever you need them.
          </p>
          <Link href="/tours" className={buttonClassName({ className: "mt-7" })}>
            Explore Tours
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </SlideUp>
      </section>
    </>
  );
}
