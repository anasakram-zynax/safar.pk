"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  CheckCircle2,
  Compass,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isBooking, type Booking } from "@/types/booking";

type BookingView =
  | { state: "loading" }
  | { state: "not-found" }
  | { state: "error"; message: string }
  | { state: "ready"; booking: Booking };
const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const { authRequest } = useAuth();
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<BookingView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<Booking>>(
      `/bookings/${encodeURIComponent(bookingId)}`,
      { cache: "no-store" },
    )
      .then((response) => {
        if (!active) return;
        if (!isBooking(response.data))
          throw new Error("Invalid booking response");
        setView({ state: "ready", booking: response.data });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof ApiError && error.status === 401))
          return;
        if (error instanceof ApiError && error.status === 404)
          setView({ state: "not-found" });
        else
          setView({
            state: "error",
            message:
              error instanceof ApiError && error.status === 403
                ? "This account cannot view this booking."
                : "We couldn't load this booking right now. Please try again.",
          });
      });
    return () => {
      active = false;
    };
  }, [authRequest, bookingId, retryKey]);

  if (view.state === "loading")
    return (
      <div
        role="status"
        aria-label="Loading booking confirmation"
        className="mx-auto max-w-2xl animate-pulse rounded-2xl border border-border bg-surface p-8 text-center sm:p-10"
      >
        <div className="mx-auto size-12 rounded-full bg-surface-muted" />
        <div className="mx-auto mt-6 h-9 w-64 rounded bg-surface-muted" />
        <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-surface-muted" />
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="h-20 rounded-xl bg-surface-muted" />
          <div className="h-20 rounded-xl bg-surface-muted" />
        </div>
        <span className="sr-only">Loading booking confirmation...</span>
      </div>
    );
  if (view.state === "not-found")
    return (
      <Card className="mx-auto max-w-2xl py-14 text-center">
        <Compass
          size={38}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h1 className="heading-two mt-5">Booking not found</h1>
        <p className="body-copy mx-auto mt-3 max-w-md text-muted">
          This booking does not exist or is not available to your account.
        </p>
        <Link href="/" className={buttonClassName({ className: "mt-7" })}>
          Explore Tours
        </Link>
      </Card>
    );
  if (view.state === "error")
    return (
      <Card className="mx-auto max-w-2xl py-14 text-center">
        <RefreshCw
          size={32}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h1 className="heading-two mt-5">Confirmation unavailable</h1>
        <p role="alert" className="body-copy mt-3 text-muted">
          {view.message}
        </p>
        <Button
          onClick={() => {
            setView({ state: "loading" });
            setRetryKey((key) => key + 1);
          }}
          className="mt-7"
        >
          Retry
        </Button>
      </Card>
    );

  const booking = view.booking;
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      <Card className="mx-auto max-w-3xl overflow-hidden p-0 sm:p-0">
        <div className="bg-primary-light px-6 py-9 text-center sm:px-10">
          <CheckCircle2
            size={42}
            className="mx-auto text-primary-hover"
            aria-hidden="true"
          />
          <h1 className="heading-one mt-4 text-[clamp(2.1rem,5vw,3.25rem)]">
            Booking confirmed
          </h1>
          <p className="body-copy mx-auto mt-3 max-w-xl text-muted">
            Your Safar.pk booking has been created successfully.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="rounded-xl border border-border bg-background px-4 py-3 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              Booking reference
            </p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground select-text">
              {booking.id}
            </p>
          </div>
          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-hover">
              Your tour
            </p>
            <h2 className="heading-two mt-2">{booking.tourTitleSnapshot}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-background p-4">
                <MapPin size={18} className="text-primary" aria-hidden="true" />
                <p className="mt-3 text-xs font-medium text-muted">Location</p>
                <p className="mt-1 text-sm font-semibold">
                  {booking.tourLocationSnapshot}
                </p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <CalendarDays
                  size={18}
                  className="text-primary"
                  aria-hidden="true"
                />
                <p className="mt-3 text-xs font-medium text-muted">Duration</p>
                <p className="mt-1 text-sm font-semibold">
                  {booking.durationDaysSnapshot}{" "}
                  {booking.durationDaysSnapshot === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="rounded-xl bg-background p-4">
                <p
                  className="text-lg font-semibold text-primary"
                  aria-hidden="true"
                >
                  ₨
                </p>
                <p className="mt-3 text-xs font-medium text-muted">
                  Booked price
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {priceFormatter.format(Number(booking.tourPriceSnapshot))}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tours" className={buttonClassName()}>
              Explore More Tours
            </Link>
            <Link
              href="/cart"
              className={buttonClassName({ variant: "outline" })}
            >
              View Cart
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
