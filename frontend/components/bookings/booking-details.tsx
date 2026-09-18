"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookingLoadingSkeleton,
  BookingNotFound,
  BookingReference,
  BookingRequestError,
  BookingSnapshot,
} from "@/components/bookings/booking-presentation";
import { useBooking } from "@/components/bookings/use-booking";

const dateFormatter = new Intl.DateTimeFormat("en-PK", { dateStyle: "long", timeZone: "UTC" });

export function BookingDetails({ bookingId }: { bookingId: string }) {
  const { view, retry } = useBooking(bookingId);
  const reducedMotion = useReducedMotion();

  if (view.state === "loading") return <BookingLoadingSkeleton />;
  if (view.state === "not-found") return <BookingNotFound />;
  if (view.state === "error") return <BookingRequestError title="Booking unavailable" message={view.message} onRetry={retry} />;

  const { booking } = view;
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      <Card className="mx-auto max-w-3xl overflow-hidden p-0 sm:p-0">
        <div className="border-b border-border bg-primary-light px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-hover">My bookings</p>
              <h1 className="heading-one mt-2 text-[clamp(2.1rem,5vw,3.25rem)]">Booking details</h1>
              <p className="body-copy mt-2 text-muted">Booked on {dateFormatter.format(new Date(booking.createdAt))}</p>
            </div>
            <Badge className={booking.status === "CANCELLED" ? "border-red-200 bg-red-50 text-red-700" : undefined}>{booking.status}</Badge>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <BookingReference bookingId={booking.id} />
          <BookingSnapshot booking={booking} />
          <div className="mt-7 rounded-xl border border-border bg-background p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Booked for</p>
            <p className="mt-2 font-semibold">{booking.customerFirstName} {booking.customerLastName}</p>
            <p className="mt-1 break-all text-sm text-muted">{booking.customerEmail}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bookings" className={buttonClassName()}>Back to My Bookings</Link>
            <Link href="/tours" className={buttonClassName({ variant: "outline" })}>Explore More Tours</Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
