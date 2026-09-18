"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Edit3, ImageOff, MapPin, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { TourStatusBadge } from "@/components/admin/tour-status-badge";
import { TourImage } from "@/components/common/tour-image";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { getTourCover } from "@/lib/tour-cover";
import type { ApiResponse } from "@/types/api";
import { isAdminTourList, type AdminTour, type AdminTourList, type TourStatus } from "@/types/admin-tour";

type ListView = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: AdminTourList };
const statuses: Array<{ value: "" | TourStatus; label: string }> = [{ value: "", label: "All statuses" }, { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }];
const priceFormatter = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

function TourThumbnail({ tour }: { tour: AdminTour }) {
  const cover = getTourCover(tour);
  return <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">{cover ? <TourImage image={cover} title={tour.title} sizes="48px" /> : <ImageOff className="absolute inset-0 m-auto text-muted" size={19} aria-label="No tour image" />}</div>;
}

function DeleteDialog({ tour, onCancel, onDeleted }: { tour: AdminTour; onCancel: () => void; onDeleted: () => void }) {
  const { authRequest } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);
  async function remove() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError("");
    try {
      await authRequest<ApiResponse<{ id: string; title: string }>>(`/tours/${encodeURIComponent(tour.id)}`, { method: "DELETE" });
      onDeleted();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We couldn't delete this tour. Please try again.");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }
  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); if (!pending) onCancel(); }} aria-labelledby="delete-tour-title" className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-foreground/35"><div className="p-6 sm:p-7"><h2 id="delete-tour-title" className="heading-three">Delete “{tour.title}”?</h2><p className="mt-3 text-sm leading-6 text-muted">This permanently removes the tour. Historical bookings are retained, but a tour in a customer cart cannot be deleted.</p>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}<div className="mt-7 flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button><Button onClick={remove} disabled={pending} className="bg-red-700 hover:bg-red-800">{pending ? "Deleting..." : "Delete Tour"}</Button></div></div></dialog>;
}

function ListSkeleton() {
  return <div role="status" aria-label="Loading tours" className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-2xl border border-border bg-surface-muted" />)}<span className="sr-only">Loading tours...</span></div>;
}

function TourActions({ tour, onDelete }: { tour: AdminTour; onDelete: (tour: AdminTour) => void }) {
  return <div className="flex flex-wrap gap-2"><Link href={`/admin/tours/${encodeURIComponent(tour.id)}/edit`} className={buttonClassName({ variant: "outline", size: "sm" })}><Edit3 size={15} aria-hidden="true" />Edit</Link><Button variant="outline" size="sm" onClick={() => onDelete(tour)} className="border-red-200 text-red-700 hover:bg-red-50"><Trash2 size={15} aria-hidden="true" />Delete</Button></div>;
}

export function AdminTourManager() {
  const { authRequest } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const currentStatus = statuses.some((item) => item.value === searchParams.get("status")) ? (searchParams.get("status") as "" | TourStatus) : "";
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [view, setView] = useState<ListView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  const [deleting, setDeleting] = useState<AdminTour | null>(null);
  const updateQuery = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) { if (value) next.set(key, value); else next.delete(key); }
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  }, [pathname, router, searchParams]);
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) query.set("search", search);
    if (currentStatus) query.set("status", currentStatus);
    authRequest<ApiResponse<AdminTourList>>(`/admin/tours?${query}`, { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (!isAdminTourList(response.data)) throw new Error("Invalid admin tours response");
        if (response.data.pagination.totalPages > 0 && page > response.data.pagination.totalPages) { updateQuery({ page: String(response.data.pagination.totalPages) }); return; }
        setView({ state: "ready", data: response.data });
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof ApiError && error.status === 401)) return;
        setView({ state: "error", message: error instanceof ApiError && error.status === 403 ? "This account cannot access tour management." : "We couldn't load tours right now. Please try again." });
      });
    return () => { active = false; };
  }, [authRequest, search, currentStatus, page, retryKey, updateQuery]);
  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const value = String(new FormData(event.currentTarget).get("search") ?? "").trim(); updateQuery({ search: value || null, page: null }); }
  const hasFilters = Boolean(search || currentStatus);
  return <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[0.17em] text-primary-hover">Administration</p><h1 className="heading-one mt-3">Tours</h1><p className="body-copy mt-3 text-muted">Manage the tours available across Safar.pk.</p></div><Link href="/admin/tours/new" className={buttonClassName()}><Plus size={18} aria-hidden="true" />Create Tour</Link></div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2"><label className="sr-only" htmlFor="admin-tour-search">Search tours</label><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" /><input key={search} id="admin-tour-search" name="search" defaultValue={search} placeholder="Search title or location" className="min-h-11 w-full rounded-xl border border-border bg-surface py-2 pl-10 pr-4 focus-visible:outline-2 focus-visible:outline-focus" /></div><Button type="submit" variant="outline">Search</Button></form><label className="sr-only" htmlFor="admin-tour-status">Filter tours by status</label><select id="admin-tour-status" value={currentStatus} onChange={(event) => updateQuery({ status: event.target.value || null, page: null })} className="min-h-11 rounded-xl border border-border bg-surface px-4 focus-visible:outline-2 focus-visible:outline-focus">{statuses.map((status) => <option key={status.label} value={status.value}>{status.label}</option>)}</select></div><div className="mt-6">{view.state === "loading" && <ListSkeleton />}{view.state === "error" && <Card className="max-w-xl"><RefreshCw size={27} className="text-primary" aria-hidden="true" /><h2 className="heading-three mt-4">Tours unavailable</h2><p role="alert" className="mt-2 text-sm text-muted">{view.message}</p><Button onClick={() => { setView({ state: "loading" }); setRetryKey((key) => key + 1); }} className="mt-6">Retry</Button></Card>}{view.state === "ready" && <><div className="hidden overflow-hidden rounded-2xl border border-border bg-surface lg:block"><table className="w-full text-left"><thead className="bg-surface-muted text-xs uppercase tracking-[0.13em] text-muted"><tr><th className="px-5 py-4 font-semibold">Tour</th><th className="px-4 py-4 font-semibold">Location</th><th className="px-4 py-4 font-semibold">Price</th><th className="px-4 py-4 font-semibold">Duration</th><th className="px-4 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead><tbody>{view.data.tours.map((tour) => <tr key={tour.id} className="border-t border-border"><td className="px-5 py-4"><div className="flex items-center gap-3"><TourThumbnail tour={tour} /><div><p className="font-semibold">{tour.title}</p><p className="mt-0.5 text-xs text-muted">{tour.images.length} {tour.images.length === 1 ? "image" : "images"}</p></div></div></td><td className="px-4 py-4 text-sm text-muted">{tour.location}</td><td className="px-4 py-4 text-sm font-medium">{priceFormatter.format(Number(tour.price))}</td><td className="px-4 py-4 text-sm text-muted">{tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}</td><td className="px-4 py-4"><TourStatusBadge status={tour.status} /></td><td className="px-5 py-4"><TourActions tour={tour} onDelete={setDeleting} /></td></tr>)}</tbody></table></div><div className="space-y-4 lg:hidden">{view.data.tours.map((tour) => <Card key={tour.id}><div className="flex gap-3"><TourThumbnail tour={tour} /><div className="min-w-0"><h2 className="heading-three break-words">{tour.title}</h2><p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><MapPin size={15} aria-hidden="true" />{tour.location}</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4 text-sm"><p><span className="block text-xs text-muted">Price</span><span className="font-medium">{priceFormatter.format(Number(tour.price))}</span></p><p><span className="block text-xs text-muted">Duration</span><span className="font-medium">{tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}</span></p></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><TourStatusBadge status={tour.status} /><TourActions tour={tour} onDelete={setDeleting} /></div></Card>)}</div>{view.data.tours.length === 0 && <Card className="py-14 text-center"><h2 className="heading-two">{hasFilters ? "No tours match these filters" : "No tours found"}</h2><p className="mt-3 text-muted">{hasFilters ? "Try changing your search or status filter." : "Create your first tour to get started."}</p>{!hasFilters && <Link href="/admin/tours/new" className={buttonClassName({ className: "mt-7" })}>Create Tour</Link>}</Card>}{view.data.pagination.totalPages > 1 && <nav aria-label="Tour pagination" className="mt-6 flex items-center justify-between gap-4"><p className="text-sm text-muted">Page {view.data.pagination.page} of {view.data.pagination.totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!view.data.pagination.hasPreviousPage} onClick={() => updateQuery({ page: String(page - 1) })}>Previous</Button><Button variant="outline" size="sm" disabled={!view.data.pagination.hasNextPage} onClick={() => updateQuery({ page: String(page + 1) })}>Next</Button></div></nav>}</>}</div>{deleting && <DeleteDialog tour={deleting} onCancel={() => setDeleting(null)} onDeleted={() => { setDeleting(null); setView({ state: "loading" }); setRetryKey((key) => key + 1); }} />}</div>;
}
