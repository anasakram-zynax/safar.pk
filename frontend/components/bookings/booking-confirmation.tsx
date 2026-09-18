"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
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

export function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const { view, retry } = useBooking(bookingId);
  const reducedMotion = useReducedMotion();

  if (view.state === "loading") return <BookingLoadingSkeleton label="Loading booking confirmation" />;
  if (view.state === "not-found") return <BookingNotFound />;
  if (view.state === "error") {
    return <BookingRequestError title="Confirmation unavailable" message={view.message} onRetry={retry} />;
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      <Card className="mx-auto max-w-3xl overflow-hidden p-0 sm:p-0">
        <div className="bg-primary-light px-6 py-9 text-center sm:px-10">
          <CheckCircle2 size={42} className="mx-auto text-primary-hover" aria-hidden="true" />
          <h1 className="heading-one mt-4 text-[clamp(2.1rem,5vw,3.25rem)]">Booking confirmed</h1>
          <p className="body-copy mx-auto mt-3 max-w-xl text-muted">
            Your Safar.pk booking has been created successfully.
          </p>
        </div>
        <div className="p-6 sm:p-10">
          <BookingReference bookingId={view.booking.id} />
          <BookingSnapshot booking={view.booking} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/bookings" className={buttonClassName()}>View My Bookings</Link>
            <Link href="/tours" className={buttonClassName({ variant: "outline" })}>Explore More Tours</Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
