"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ExternalLink, RefreshCw, Search } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isAdminBookingList, type AdminBookingList, type Booking, type BookingStatus } from "@/types/admin-booking";

type ListView = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: AdminBookingList };
const statuses: Array<{ value: "" | BookingStatus; label: string }> = [{ value: "", label: "All statuses" }, { value: "CONFIRMED", label: "Confirmed" }, { value: "CANCELLED", label: "Cancelled" }];
const priceFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" });

function LoadingList() {
  return <div role="status" aria-label="Loading bookings" className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-border bg-surface-muted" />)}<span className="sr-only">Loading bookings...</span></div>;
}

function DetailsLink({ id }: { id: string }) {
  return <Link href={`/admin/bookings/${encodeURIComponent(id)}`} className={buttonClassName({ variant: "outline", size: "sm" })}>View Details<ExternalLink size={14} aria-hidden="true" /></Link>;
}

function BookingCard({ booking }: { booking: Booking }) {
  return <Card><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Reference</p><p title={booking.id} className="mt-1 break-all font-mono text-sm font-medium">{booking.id}</p></div><BookingStatusBadge status={booking.status} /></div><div className="mt-5 space-y-4 border-y border-border py-4 text-sm"><div><p className="text-xs text-muted">Tour</p><p className="mt-1 font-semibold break-words">{booking.tourTitleSnapshot}</p><p className="mt-1 text-muted break-words">{booking.tourLocationSnapshot}</p></div><div><p className="text-xs text-muted">Customer</p><p className="mt-1 font-medium break-words">{booking.customerFirstName} {booking.customerLastName}</p><p className="mt-1 break-all text-muted">{booking.customerEmail}</p></div><div className="grid grid-cols-2 gap-4"><p><span className="block text-xs text-muted">Price</span><span className="mt-1 block font-medium">{priceFormatter.format(Number(booking.tourPriceSnapshot))}</span></p><p><span className="block text-xs text-muted">Booked on</span><span className="mt-1 block">{dateFormatter.format(new Date(booking.createdAt))}</span></p></div></div><div className="mt-4"><DetailsLink id={booking.id} /></div></Card>;
}

export function AdminBookingManager() {
  const { authRequest } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const status = statuses.some((option) => option.value === statusParam) ? (statusParam as "" | BookingStatus) : "";
  const rawPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const [view, setView] = useState<ListView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const updateQuery = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) query.set("search", search);
    if (status) query.set("status", status);
    authRequest<ApiResponse<unknown>>(`/admin/bookings?${query}`, { cache: "no-store" }).then((response) => {
      if (!active) return;
      if (!isAdminBookingList(response.data)) throw new Error("Invalid admin booking response");
      if (response.data.pagination.totalPages > 0 && page > response.data.pagination.totalPages) { updateQuery({ page: String(response.data.pagination.totalPages) }); return; }
      setView({ state: "ready", data: response.data });
    }).catch((error: unknown) => {
      if (!active || (error instanceof ApiError && error.status === 401)) return;
      setView({ state: "error", message: error instanceof ApiError && error.status === 403 ? "This account cannot access booking management." : "We couldn't load bookings right now. Please try again." });
    });
    return () => { active = false; };
  }, [authRequest, page, retryKey, search, status, updateQuery]);

  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = String(new FormData(event.currentTarget).get("search") ?? "").trim(); updateQuery({ search: value || null, page: null }); }
  const hasFilters = Boolean(search || status);
  return <div className="mx-auto max-w-7xl"><header><p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Administration</p><h1 className="heading-one mt-3">Bookings</h1><p className="body-copy mt-3 text-muted">Review customer bookings across Safar.pk.</p></header><div className="mt-9 flex flex-col gap-3 sm:flex-row"><form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2"><label className="sr-only" htmlFor="admin-booking-search">Search bookings</label><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" /><input key={search} id="admin-booking-search" name="search" defaultValue={search} placeholder="Search ID, customer, or tour" className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 focus-visible:outline-2 focus-visible:outline-focus" /></div><Button type="submit" variant="outline">Search</Button></form><label className="sr-only" htmlFor="admin-booking-status">Filter bookings by status</label><select id="admin-booking-status" value={status} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} className="min-h-11 rounded-xl border border-border bg-surface px-4 focus-visible:outline-2 focus-visible:outline-focus">{statuses.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}</select></div><section aria-label="Booking summary" className="mt-6">{view.state === "ready" && <div className="grid gap-4 sm:grid-cols-3">{[["Total Bookings", view.data.summary.total], ["Confirmed", view.data.summary.confirmed], ["Cancelled", view.data.summary.cancelled]].map(([label, count]) => <Card key={String(label)} className="p-5"><p className="text-sm text-muted">{label}</p><p className="mt-1 text-3xl font-semibold">{count}</p></Card>)}</div>}</section><div className="mt-6">{view.state === "loading" && <LoadingList />}{view.state === "error" && <Card className="max-w-xl"><RefreshCw size={26} className="text-primary" aria-hidden="true" /><h2 className="heading-three mt-4">Bookings unavailable</h2><p role="alert" className="mt-2 text-sm text-muted">{view.message}</p><Button onClick={() => { setView({ state: "loading" }); setRetryKey((value) => value + 1); }} className="mt-6">Retry</Button></Card>}{view.state === "ready" && <><div className="hidden overflow-hidden rounded-2xl border border-border bg-surface lg:block"><table className="w-full table-fixed text-left"><thead className="bg-surface-muted text-xs uppercase tracking-[0.13em] text-muted"><tr><th className="w-[16%] px-5 py-4 font-semibold">Booking</th><th className="w-[19%] px-4 py-4 font-semibold">Customer</th><th className="w-[20%] px-4 py-4 font-semibold">Tour</th><th className="w-[11%] px-4 py-4 font-semibold">Price</th><th className="w-[11%] px-4 py-4 font-semibold">Status</th><th className="w-[13%] px-4 py-4 font-semibold">Booked On</th><th className="w-[10%] px-5 py-4 font-semibold">Action</th></tr></thead><tbody>{view.data.bookings.map((booking) => <tr key={booking.id} className="border-t border-border align-top"><td className="px-5 py-4"><p title={booking.id} className="truncate font-mono text-sm font-medium">{booking.id}</p></td><td className="px-4 py-4"><p className="font-medium break-words">{booking.customerFirstName} {booking.customerLastName}</p><p className="mt-1 break-all text-sm text-muted">{booking.customerEmail}</p></td><td className="px-4 py-4"><p className="font-medium break-words">{booking.tourTitleSnapshot}</p><p className="mt-1 break-words text-sm text-muted">{booking.tourLocationSnapshot}</p></td><td className="px-4 py-4 text-sm font-medium">{priceFormatter.format(Number(booking.tourPriceSnapshot))}</td><td className="px-4 py-4"><BookingStatusBadge status={booking.status} /></td><td className="px-4 py-4 text-sm text-muted"><CalendarDays size={15} className="mb-1" aria-hidden="true" />{dateFormatter.format(new Date(booking.createdAt))}</td><td className="px-5 py-4"><DetailsLink id={booking.id} /></td></tr>)}</tbody></table></div><div className="space-y-4 lg:hidden">{view.data.bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)}</div>{view.data.bookings.length === 0 && <Card className="py-14 text-center"><h2 className="heading-two">{hasFilters ? "No bookings match these filters." : "No bookings yet."}</h2>{hasFilters && <p className="mt-3 text-muted">Try changing your search or status filter.</p>}</Card>}{view.data.pagination.totalPages > 1 && <nav aria-label="Booking pagination" className="mt-6 flex items-center justify-between gap-4"><p className="text-sm text-muted">Page {view.data.pagination.page} of {view.data.pagination.totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!view.data.pagination.hasPreviousPage} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</Button><Button variant="outline" size="sm" disabled={!view.data.pagination.hasNextPage} onClick={() => updateQuery({ page: String(page + 1) })}>Next</Button></div></nav>}</>}</div></div>;
}
