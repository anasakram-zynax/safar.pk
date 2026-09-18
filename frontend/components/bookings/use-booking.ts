"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isBooking, type Booking } from "@/types/booking";

export type BookingRequestState =
  | { state: "loading" }
  | { state: "not-found" }
  | { state: "error"; message: string }
  | { state: "ready"; booking: Booking };

export function useBooking(bookingId: string) {
  const { authRequest } = useAuth();
  const [view, setView] = useState<BookingRequestState>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<Booking>>(
      `/bookings/${encodeURIComponent(bookingId)}`,
      { cache: "no-store" },
    )
      .then((response) => {
        if (!active) return;
        if (!isBooking(response.data)) throw new Error("Invalid booking response");
        setView({ state: "ready", booking: response.data });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof ApiError && error.status === 401)) return;
        if (error instanceof ApiError && error.status === 404) {
          setView({ state: "not-found" });
          return;
        }
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

  return {
    view,
    retry: () => {
      setView({ state: "loading" });
      setRetryKey((key) => key + 1);
    },
  };
}
