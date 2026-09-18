"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CalendarDays, ShoppingCart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { buttonClassName, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";

export function TourCta({
  tourId,
  slug,
  price,
  durationDays,
}: {
  tourId: string;
  slug: string;
  price: string;
  durationDays: number;
}) {
  const auth = useAuth();
  const router = useRouter();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [showCartLink, setShowCartLink] = useState(false);
  const loginHref = `/login?next=${encodeURIComponent(`/tours/${slug}`)}`;

  async function addToCart() {
    if (pendingRef.current || !auth.token || auth.status !== "customer") return;
    pendingRef.current = true;
    setPending(true);
    setMessage("");
    try {
      await auth.authRequest<ApiResponse<unknown>>("/cart", {
        method: "POST",
        body: { tourId },
      });
      auth.setCartCount(1);
      router.push("/cart");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setMessage(
          "Your session expired. Please log in again to add this tour.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message === "This tour is already in your cart."
      ) {
        auth.setCartCount(1);
        setShowCartLink(true);
        setMessage("This tour is already in your cart.");
      } else if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.message.startsWith("Your cart can contain only one tour.")
      ) {
        setShowCartLink(true);
        setMessage(
          "Your cart holds another tour. Remove it from your cart before adding this one.",
        );
      } else if (error instanceof ApiError && error.status === 403) {
        setMessage("This account cannot add tours to a customer cart.");
      } else if (error instanceof ApiError && error.status === 404) {
        setMessage(
          "This tour is no longer available. Please browse other tours.",
        );
      } else {
        setMessage("We couldn't update your cart. Please try again.");
      }
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <p className="text-sm text-muted">Tour price</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{price}</p>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <CalendarDays size={17} aria-hidden="true" />
        {durationDays} {durationDays === 1 ? "day" : "days"}
      </p>
      <div className="mt-6 border-t border-border pt-6">
        {auth.status === "loading" && (
          <Button className="w-full" disabled>
            Checking account...
          </Button>
        )}
        {auth.status === "unavailable" && (
          <p className="text-sm text-muted">
            Account status is unavailable. Refresh to try again.
          </p>
        )}
        {auth.status === "admin" && (
          <p className="text-sm text-muted">
            Cart actions are available to customer accounts.
          </p>
        )}
        {auth.status === "guest" && (
          <Link
            href={loginHref}
            className={buttonClassName({ className: "w-full" })}
          >
            Login to Add
          </Link>
        )}
        {auth.status === "customer" && (
          <Button onClick={addToCart} disabled={pending} className="w-full">
            <ShoppingCart size={17} aria-hidden="true" />
            {pending ? "Adding..." : "Add to Cart"}
          </Button>
        )}
        {showCartLink && (
          <Link
            href="/cart"
            className="mt-4 inline-block text-sm font-semibold text-primary-hover underline underline-offset-4"
          >
            View cart
          </Link>
        )}
        {auth.status === "guest" && message && (
          <Link
            href={loginHref}
            className="mt-4 inline-block text-sm font-semibold text-primary-hover underline underline-offset-4"
          >
            Log in again
          </Link>
        )}
        {message && (
          <p role="alert" className="mt-4 text-sm text-foreground">
            {message}
          </p>
        )}
      </div>
    </Card>
  );
}
