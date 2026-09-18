"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { TourForm } from "@/components/admin/tour-form";
import { TourImageManager } from "@/components/admin/tour-image-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isAdminTour, type AdminTour } from "@/types/admin-tour";

type EditorView = { state: "loading" } | { state: "not-found" } | { state: "error"; message: string } | { state: "ready"; tour: AdminTour };

export function TourFormSkeleton() {
  return <div role="status" aria-label="Loading tour form" className="mx-auto max-w-4xl animate-pulse rounded-2xl border border-border bg-surface p-6 sm:p-7"><div className="h-6 w-1/3 rounded bg-surface-muted" /><div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="h-11 rounded-xl bg-surface-muted sm:col-span-2" /><div className="h-40 rounded-xl bg-surface-muted sm:col-span-2" /><div className="h-11 rounded-xl bg-surface-muted" /><div className="h-11 rounded-xl bg-surface-muted" /><div className="h-11 rounded-xl bg-surface-muted" /><div className="h-11 rounded-xl bg-surface-muted" /></div><span className="sr-only">Loading tour form...</span></div>;
}

export function AdminTourEditor({ tourId }: { tourId: string }) {
  const { authRequest } = useAuth();
  const [view, setView] = useState<EditorView>({ state: "loading" });
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    let active = true;
    authRequest<ApiResponse<AdminTour>>(`/admin/tours/${encodeURIComponent(tourId)}`, { cache: "no-store" })
      .then((response) => { if (!active) return; if (!isAdminTour(response.data)) throw new Error("Invalid admin tour response"); setView({ state: "ready", tour: response.data }); })
      .catch((error: unknown) => { if (!active || (error instanceof ApiError && error.status === 401)) return; if (error instanceof ApiError && error.status === 404) setView({ state: "not-found" }); else setView({ state: "error", message: "We couldn't load this tour right now. Please try again." }); });
    return () => { active = false; };
  }, [authRequest, retryKey, tourId]);
  if (view.state === "loading") return <TourFormSkeleton />;
  if (view.state === "not-found") return <Card className="mx-auto max-w-2xl py-14 text-center"><h1 className="heading-two">Tour not found</h1><p className="mt-3 text-muted">This tour may have been removed.</p></Card>;
  if (view.state === "error") return <Card className="mx-auto max-w-2xl py-14 text-center"><RefreshCw size={30} className="mx-auto text-primary" aria-hidden="true" /><h1 className="heading-two mt-5">Tour unavailable</h1><p role="alert" className="mt-3 text-muted">{view.message}</p><Button onClick={() => { setView({ state: "loading" }); setRetryKey((key) => key + 1); }} className="mt-7">Retry</Button></Card>;
  return <><TourForm tour={view.tour} /><TourImageManager tour={view.tour} onChange={(tour) => setView({ state: "ready", tour })} /></>;
}
