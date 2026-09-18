"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { TourImage } from "@/components/common/tour-image";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getTourCover } from "@/lib/tour-cover";
import type { ApiResponse } from "@/types/api";
import { isCartData, type CartData } from "@/types/cart";

type CartView =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; cart: CartData };
const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

function CartSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your cart"
      className="grid animate-pulse gap-7 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="aspect-16/9 bg-surface-muted" />
        <div className="space-y-4 p-6">
          <div className="h-7 w-3/5 rounded bg-surface-muted" />
          <div className="h-4 w-2/5 rounded bg-surface-muted" />
          <div className="h-4 w-1/3 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="h-64 rounded-2xl border border-border bg-surface p-6">
        <div className="h-5 w-24 rounded bg-surface-muted" />
        <div className="mt-7 h-9 w-40 rounded bg-surface-muted" />
        <div className="mt-8 h-11 rounded-xl bg-surface-muted" />
      </div>
      <span className="sr-only">Loading your selected tour...</span>
    </div>
  );
}

export function CartSummary() {
  const { authRequest, setCartCount } = useAuth();
  const reducedMotion = useReducedMotion();
  const [view, setView] = useState<CartView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const removePending = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  const exploreRef = useRef<HTMLAnchorElement>(null);

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
              ? "This account cannot access a customer cart."
              : "We couldn't load your cart right now. Please try again.",
        });
      });
    return () => {
      active = false;
    };
  }, [authRequest, retryKey, setCartCount]);

  function retry() {
    setView({ state: "loading" });
    setRetryKey((key) => key + 1);
  }

  function openRemoveDialog() {
    setRemoveError("");
    dialogRef.current?.showModal();
  }

  async function removeTour() {
    if (removePending.current || view.state !== "ready" || !view.cart.item)
      return;
    removePending.current = true;
    setRemoving(true);
    setRemoveError("");
    try {
      const response = await authRequest<ApiResponse<{ item: null }>>("/cart", {
        method: "DELETE",
      });
      if (response.data?.item !== null)
        throw new Error("Invalid removal response");
      dialogRef.current?.close();
      setView({ state: "ready", cart: { item: null } });
      setCartCount(0);
      setSuccessMessage("Tour removed from your cart.");
      requestAnimationFrame(() => exploreRef.current?.focus());
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return;
      setRemoveError(
        error instanceof ApiError && error.status === 403
          ? "This account cannot change a customer cart."
          : "We couldn't remove the tour. Please try again.",
      );
    } finally {
      removePending.current = false;
      setRemoving(false);
    }
  }

  if (view.state === "loading") return <CartSkeleton />;
  if (view.state === "error")
    return (
      <Card className="mx-auto max-w-2xl text-center">
        <RefreshCw
          size={30}
          className="mx-auto text-primary"
          aria-hidden="true"
        />
        <h2 className="heading-three mt-4">Cart unavailable</h2>
        <p role="alert" className="body-copy mt-2 text-muted">
          {view.message}
        </p>
        <Button onClick={retry} className="mt-6">
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
          <h2 className="heading-two mt-5">No tour selected yet</h2>
          <p className="body-copy mx-auto mt-3 max-w-md text-muted">
            Find your next journey across Pakistan, then add a tour to continue.
          </p>
          {successMessage && (
            <p
              role="status"
              className="mt-4 text-sm font-medium text-primary-hover"
            >
              {successMessage}
            </p>
          )}
          <Link
            ref={exploreRef}
            href="/tours"
            className={buttonClassName({ className: "mt-7" })}
          >
            Explore Tours <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </Card>
      </motion.div>
    );

  const tour = view.cart.item.tour;
  const detailHref = `/tours/${encodeURIComponent(tour.slug)}`;
  const price = priceFormatter.format(Number(tour.price));
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
            href={detailHref}
            className="mt-6 inline-block text-sm font-semibold text-primary-hover underline underline-offset-4"
          >
            View tour details
          </Link>
        </div>
      </Card>
      <Card className="lg:sticky lg:top-24">
        <h2 className="heading-three">Your selection</h2>
        <div className="mt-5 flex items-start justify-between gap-3 border-t border-border pt-5">
          <span className="text-sm text-muted">Tour price</span>
          <strong className="text-xl font-semibold tracking-tight">
            {price}
          </strong>
        </div>
        <p className="mt-3 text-sm text-muted">One selected tour</p>
        <Link
          href="/checkout"
          className={buttonClassName({ className: "mt-7 w-full" })}
        >
          Continue to Checkout <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <Button
          ref={removeButtonRef}
          variant="ghost"
          onClick={openRemoveDialog}
          disabled={removing}
          className="mt-3 w-full"
        >
          <Trash2 size={16} aria-hidden="true" />
          Remove Tour
        </Button>
        {removeError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {removeError}
          </p>
        )}
      </Card>
      <dialog
        ref={dialogRef}
        aria-labelledby="remove-title"
        aria-describedby="remove-description"
        onClose={() => removeButtonRef.current?.focus()}
        onClick={(event) => {
          if (event.target === dialogRef.current && !removing)
            dialogRef.current.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-6 text-foreground shadow-2xl backdrop:bg-[#172b42]/55 sm:p-7"
      >
        <h2 id="remove-title" className="heading-three">
          Remove this tour?
        </h2>
        <p id="remove-description" className="body-copy mt-3 text-muted">
          Your selected tour will be removed from the cart.
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            autoFocus
            variant="outline"
            onClick={() => dialogRef.current?.close()}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button onClick={removeTour} disabled={removing} aria-busy={removing}>
            {removing ? "Removing..." : "Remove Tour"}
          </Button>
        </div>
        {removeError && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {removeError}
          </p>
        )}
      </dialog>
    </motion.div>
  );
}
