"use client";

import Link from "next/link";
import { CalendarDays, Compass, MapPin, RefreshCw } from "lucide-react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Booking } from "@/types/booking";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function BookingLoadingSkeleton({
  label = "Loading booking details",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className="mx-auto max-w-3xl animate-pulse rounded-2xl border border-border bg-surface p-8 sm:p-10"
    >
      <div className="mx-auto h-9 w-64 max-w-full rounded bg-surface-muted" />
      <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-surface-muted" />
      <div className="mt-9 h-20 rounded-xl bg-surface-muted" />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-surface-muted" />
        <div className="h-24 rounded-xl bg-surface-muted" />
        <div className="h-24 rounded-xl bg-surface-muted" />
      </div>
      <span className="sr-only">{label}...</span>
    </div>
  );
}

export function BookingNotFound() {
  return (
    <Card className="mx-auto max-w-2xl py-14 text-center">
      <Compass size={38} className="mx-auto text-primary" aria-hidden="true" />
      <h1 className="heading-two mt-5">Booking not found</h1>
      <p className="body-copy mx-auto mt-3 max-w-md text-muted">
        This booking does not exist or is not available to your account.
      </p>
      <Link href="/bookings" className={buttonClassName({ className: "mt-7" })}>
        Back to My Bookings
      </Link>
    </Card>
  );
}

export function BookingRequestError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl py-14 text-center">
      <RefreshCw size={32} className="mx-auto text-primary" aria-hidden="true" />
      <h1 className="heading-two mt-5">{title}</h1>
      <p role="alert" className="body-copy mt-3 text-muted">
        {message}
      </p>
      <Button onClick={onRetry} className="mt-7">
        Retry
      </Button>
    </Card>
  );
}

export function BookingReference({ bookingId }: { bookingId: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
        Booking reference
      </p>
      <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground select-text">
        {bookingId}
      </p>
    </div>
  );
}

export function BookingSnapshot({ booking }: { booking: Booking }) {
  return (
    <div className="mt-7">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-hover">
        Your tour
      </p>
      <h2 className="heading-two mt-2">{booking.tourTitleSnapshot}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-background p-4">
          <MapPin size={18} className="text-primary" aria-hidden="true" />
          <p className="mt-3 text-xs font-medium text-muted">Location</p>
          <p className="mt-1 text-sm font-semibold">{booking.tourLocationSnapshot}</p>
        </div>
        <div className="rounded-xl bg-background p-4">
          <CalendarDays size={18} className="text-primary" aria-hidden="true" />
          <p className="mt-3 text-xs font-medium text-muted">Duration</p>
          <p className="mt-1 text-sm font-semibold">
            {booking.durationDaysSnapshot} {booking.durationDaysSnapshot === 1 ? "day" : "days"}
          </p>
        </div>
        <div className="rounded-xl bg-background p-4">
          <p className="text-lg font-semibold text-primary" aria-hidden="true">₨</p>
          <p className="mt-3 text-xs font-medium text-muted">Booked price</p>
          <p className="mt-1 text-sm font-semibold">
            {priceFormatter.format(Number(booking.tourPriceSnapshot))}
          </p>
        </div>
      </div>
    </div>
  );
}
