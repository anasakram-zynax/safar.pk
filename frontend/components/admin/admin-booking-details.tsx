"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, RefreshCw } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isBooking, type Booking } from "@/types/booking";

type DetailView = { state: "loading" } | { state: "not-found" } | { state: "error"; message: string } | { state: "ready"; booking: Booking };
const priceFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-PK", { dateStyle: "long", timeStyle: "short" });

function DetailSkeleton() { return <div role="status" aria-label="Loading booking details" className="space-y-5"><div className="h-28 animate-pulse rounded-2xl border border-border bg-surface-muted" /><div className="grid gap-5 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl border border-border bg-surface-muted" />)}</div><span className="sr-only">Loading booking details...</span></div>; }
function SnapshotRow({ label, children }: { label: string; children: ReactNode }) { return <div><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 break-words font-medium">{children}</dd></div>; }

export function AdminBookingDetails({ id }: { id: string }) {
  const { authRequest } = useAuth();
  const [view, setView] = useState<DetailView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<unknown>>(`/admin/bookings/${encodeURIComponent(id)}`, { cache: "no-store" }).then((response) => {
      if (!active) return;
      if (!isBooking(response.data)) throw new Error("Invalid booking response");
      setView({ state: "ready", booking: response.data });
    }).catch((error: unknown) => {
      if (!active || (error instanceof ApiError && error.status === 401)) return;
      if (error instanceof ApiError && error.status === 404) { setView({ state: "not-found" }); return; }
      setView({ state: "error", message: "We couldn't load this booking right now. Please try again." });
    });
    return () => { active = false; };
  }, [authRequest, id, retryKey]);
  if (view.state === "loading") return <div className="mx-auto max-w-5xl"><DetailSkeleton /></div>;
  if (view.state === "not-found") return <div className="mx-auto max-w-5xl"><Card className="max-w-xl"><h1 className="heading-two">Booking not found</h1><p className="mt-3 text-muted">This booking may no longer be available.</p><Link href="/admin/bookings" className={buttonClassName({ variant: "outline", className: "mt-6" })}>Back to Bookings</Link></Card></div>;
  if (view.state === "error") return <div className="mx-auto max-w-5xl"><Card className="max-w-xl"><RefreshCw size={26} className="text-primary" aria-hidden="true" /><h1 className="heading-two mt-4">Booking unavailable</h1><p role="alert" className="mt-3 text-muted">{view.message}</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => { setView({ state: "loading" }); setRetryKey((key) => key + 1); }}>Retry</Button><Link href="/admin/bookings" className={buttonClassName({ variant: "outline" })}>Back to Bookings</Link></div></Card></div>;
  const { booking } = view;
  return <div className="mx-auto max-w-5xl"><Link href="/admin/bookings" className={buttonClassName({ variant: "ghost", size: "sm" })}><ArrowLeft size={16} aria-hidden="true" />Back to Bookings</Link><header className="mt-6 flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Administration</p><h1 className="heading-one mt-3">Booking Details</h1><p className="mt-3 text-muted">Read-only historical booking information.</p></div><BookingStatusBadge status={booking.status} /></header><Card className="mt-8"><h2 className="heading-three">Booking overview</h2><dl className="mt-6 grid gap-5 sm:grid-cols-2"><SnapshotRow label="Status"><BookingStatusBadge status={booking.status} /></SnapshotRow><SnapshotRow label="Booked on"><span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" />{dateFormatter.format(new Date(booking.createdAt))}</span></SnapshotRow><SnapshotRow label="Booking reference"><span className="block break-all font-mono text-sm">{booking.id}</span></SnapshotRow></dl></Card><div className="mt-5 grid gap-5 md:grid-cols-2"><Card><h2 className="heading-three">Tour snapshot</h2><dl className="mt-6 space-y-5"><SnapshotRow label="Tour title">{booking.tourTitleSnapshot}</SnapshotRow><SnapshotRow label="Location">{booking.tourLocationSnapshot}</SnapshotRow><SnapshotRow label="Duration">{booking.durationDaysSnapshot} {booking.durationDaysSnapshot === 1 ? "day" : "days"}</SnapshotRow><SnapshotRow label="Price">{priceFormatter.format(Number(booking.tourPriceSnapshot))}</SnapshotRow></dl></Card><Card><h2 className="heading-three">Customer snapshot</h2><dl className="mt-6 space-y-5"><SnapshotRow label="Customer name">{booking.customerFirstName} {booking.customerLastName}</SnapshotRow><SnapshotRow label="Customer email"><span className="break-all">{booking.customerEmail}</span></SnapshotRow></dl></Card></div></div>;
}



