"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { TourImage } from "@/components/common/tour-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getTourCover } from "@/lib/tour-cover";
import type { ApiResponse } from "@/types/api";
import { isBooking, type Booking } from "@/types/booking";
import { isCartData, type CartData } from "@/types/cart";

type CheckoutView =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; cart: CartData };
const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading checkout"
      className="grid animate-pulse gap-7 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="aspect-16/9 bg-surface-muted" />
        <div className="space-y-4 p-7">
          <div className="h-7 w-3/5 rounded bg-surface-muted" />
          <div className="h-4 w-2/5 rounded bg-surface-muted" />
          <div className="h-4 w-1/3 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="h-64 rounded-2xl border border-border bg-surface p-6">
        <div className="h-5 w-32 rounded bg-surface-muted" />
        <div className="mt-8 h-9 w-40 rounded bg-surface-muted" />
        <div className="mt-8 h-11 rounded-xl bg-surface-muted" />
      </div>
      <span className="sr-only">Loading selected tour for checkout...</span>
    </div>
  );
}

export function CheckoutReview() {
  const { authRequest, setCartCount } = useAuth();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<CheckoutView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitPending = useRef(false);

  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<CartData>>("/cart", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (!isCartData(response.data))
          throw new Error("Invalid cart response");
        setView({ state: "ready", cart: response.data });
        setCartCount(response.data.item ? 1 : 0);
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof ApiError && error.status === 401))
          return;
        setView({
          state: "error",
          message:
            error instanceof ApiError && error.status === 403
              ? "This account cannot access customer checkout."
              : "We couldn't load your selected tour right now. Please try again.",
        });
      });
    return () => {
      active = false;
    };
  }, [authRequest, retryKey, setCartCount]);

  async function confirmBooking() {
    if (submitPending.current || view.state !== "ready" || !view.cart.item)
      return;
    submitPending.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await authRequest<ApiResponse<Booking>>(
        "/bookings/checkout",
        { method: "POST" },
      );
      if (!isBooking(response.data))
        throw new Error("Invalid checkout response");
      setCartCount(0);
      router.replace(
        `/bookings/${encodeURIComponent(response.data.id)}/confirmation`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "Your cart is empty."
      ) {
        setView({ state: "ready", cart: { item: null } });
        setCartCount(0);
        setSubmitError(
          "Your cart is empty. Choose a tour before confirming a booking.",
        );
      } else {
        setSubmitError(
          error instanceof ApiError && error.status === 400
            ? error.message
            : "We couldn't confirm your booking. Please try again.",
        );
      }
    } finally {
      submitPending.current = false;
      setSubmitting(false);
    }
  }

  if (view.state === "loading") return <CheckoutSkeleton />;
  if (view.state === "error")
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <RefreshCw
          size={30}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h2 className="heading-three mt-4">Checkout unavailable</h2>
        <p role="alert" className="body-copy mt-2 text-muted">
          {view.message}
        </p>
        <Button
          onClick={() => {
            setView({ state: "loading" });
            setRetryKey((key) => key + 1);
          }}
          className="mt-6"
        >
          Retry
        </Button>
      </Card>
    );
  if (!view.cart.item)
    return (
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.22 }}
      >
        <Card className="mx-auto max-w-2xl py-14 text-center">
          <Compass
            size={38}
            className="mx-auto text-primary"
            aria-hidden="true"
          />
          <h2 className="heading-two mt-5">No tour selected</h2>
          <p className="body-copy mx-auto mt-3 max-w-md text-muted">
            Choose a journey before continuing to checkout.
          </p>
          {submitError && (
            <p role="alert" className="mt-4 text-sm text-foreground">
              {submitError}
            </p>
          )}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/tours" className={buttonClassName()}>
              Explore Tours
            </Link>
            <Link
              href="/cart"
              className={buttonClassName({ variant: "outline" })}
            >
              Go to Cart
            </Link>
          </div>
        </Card>
      </motion.div>
    );

  const tour = view.cart.item.tour;
  const price = priceFormatter.format(Number(tour.price));
  const detailHref = `/tours/${encodeURIComponent(tour.slug)}`;
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-9"
    >
      <Card className="overflow-hidden p-0 sm:p-0">
        <Link
          href={detailHref}
          className="group block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-focus"
        >
          <div className="relative aspect-16/9 overflow-hidden bg-surface-muted">
            <TourImage
              image={getTourCover(tour)}
              title={tour.title}
              sizes="(max-width: 1024px) 100vw, 65vw"
            />
          </div>
        </Link>
        <div className="p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-hover">
            Selected tour
          </p>
          <Link
            href={detailHref}
            className="mt-2 block rounded-sm hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-focus"
          >
            <h2 className="heading-two">{tour.title}</h2>
          </Link>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <MapPin size={17} aria-hidden="true" />
              {tour.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={17} aria-hidden="true" />
              {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
            </span>
          </div>
          {tour.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tour.tags.map(({ tag }) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>
          )}
          <Link
            href="/cart"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-hover underline underline-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to cart
          </Link>
        </div>
      </Card>
      <Card className="lg:sticky lg:top-24">
        <h2 className="heading-three">Booking summary</h2>
        <div className="mt-5 flex items-start justify-between gap-3 border-t border-border pt-5">
          <span className="text-sm text-muted">Tour price</span>
          <strong className="text-xl font-semibold tracking-tight">
            {price}
          </strong>
        </div>
        <p className="mt-3 text-sm text-muted">
          Booking is confirmed without payment in this demo.
        </p>
        <Button
          onClick={confirmBooking}
          disabled={submitting}
          aria-busy={submitting}
          className="mt-7 w-full"
        >
          <Check size={17} aria-hidden="true" />
          {submitting ? "Confirming..." : "Confirm Booking"}
        </Button>
        {submitError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {submitError}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
