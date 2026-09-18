"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, Compass, MapPin, RefreshCw, Route } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isBookings, type Booking } from "@/types/booking";

type HistoryView =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; bookings: Booking[] };

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "long",
  timeZone: "UTC",
});

function statusClassName(status: Booking["status"]) {
  return status === "CANCELLED"
    ? "border-red-200 bg-red-50 text-red-700"
    : undefined;
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const reducedMotion = useReducedMotion();
  const bookedOn = dateFormatter.format(new Date(booking.createdAt));
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22, delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.2) }}
    >
      <Card className="relative overflow-hidden p-0 sm:p-0">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
        <div className="p-6 pl-7 sm:p-7 sm:pl-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
                <Route size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="heading-three break-words">{booking.tourTitleSnapshot}</h2>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
                  <MapPin size={16} aria-hidden="true" />
                  {booking.tourLocationSnapshot}
                </p>
              </div>
            </div>
            <Badge className={statusClassName(booking.status)}>{booking.status}</Badge>
          </div>
          <div className="mt-6 grid gap-4 border-y border-border py-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-muted">Duration</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold">
                <CalendarDays size={16} className="text-primary" aria-hidden="true" />
                {booking.durationDaysSnapshot} {booking.durationDaysSnapshot === 1 ? "day" : "days"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-muted">Booked price</p>
              <p className="mt-1 text-sm font-semibold">
                {priceFormatter.format(Number(booking.tourPriceSnapshot))}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-muted">Booked on</p>
              <p className="mt-1 text-sm font-semibold">{bookedOn}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.13em] text-muted">Booking reference</p>
              <p className="mt-1 break-all font-mono text-xs font-medium text-foreground select-text">{booking.id}</p>
            </div>
            <Link
              href={`/bookings/${encodeURIComponent(booking.id)}`}
              className={buttonClassName({ variant: "outline", size: "sm", className: "shrink-0" })}
            >
              View Booking
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function BookingHistorySkeleton() {
  return (
    <div role="status" aria-label="Loading bookings" className="space-y-5">
      {[0, 1].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border border-border bg-surface p-7">
          <div className="h-6 w-2/5 rounded bg-surface-muted" />
          <div className="mt-3 h-4 w-1/4 rounded bg-surface-muted" />
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="h-14 rounded bg-surface-muted" />
            <div className="h-14 rounded bg-surface-muted" />
            <div className="h-14 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading your bookings...</span>
    </div>
  );
}

export function BookingHistory() {
  const { authRequest } = useAuth();
  const [view, setView] = useState<HistoryView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<Booking[]>>("/bookings", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (!isBookings(response.data)) throw new Error("Invalid bookings response");
        setView({ state: "ready", bookings: response.data });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof ApiError && error.status === 401)) return;
        setView({
          state: "error",
          message:
            error instanceof ApiError && error.status === 403
              ? "This account cannot access customer bookings."
              : "We couldn't load your bookings right now. Please try again.",
        });
      });
    return () => {
      active = false;
    };
  }, [authRequest, retryKey]);

  if (view.state === "loading") return <BookingHistorySkeleton />;
  if (view.state === "error") {
    return (
      <Card className="mx-auto max-w-2xl py-14 text-center">
        <RefreshCw size={32} className="mx-auto text-primary" aria-hidden="true" />
        <h2 className="heading-three mt-4">Bookings unavailable</h2>
        <p role="alert" className="body-copy mt-2 text-muted">{view.message}</p>
        <Button onClick={() => { setView({ state: "loading" }); setRetryKey((key) => key + 1); }} className="mt-6">
          Retry
        </Button>
      </Card>
    );
  }
  if (view.bookings.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl py-14 text-center">
        <Compass size={38} className="mx-auto text-primary" aria-hidden="true" />
        <h2 className="heading-two mt-5">No bookings yet</h2>
        <p className="body-copy mx-auto mt-3 max-w-md text-muted">You haven&apos;t booked a journey yet.</p>
        <Link href="/tours" className={buttonClassName({ className: "mt-7" })}>Explore Tours</Link>
      </Card>
    );
  }
  return <div className="space-y-5">{view.bookings.map((booking, index) => <BookingCard key={booking.id} booking={booking} index={index} />)}</div>;
}
