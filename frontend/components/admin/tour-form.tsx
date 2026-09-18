"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import { isAdminTour, type AdminTour, type TourMutationPayload, type TourStatus } from "@/types/admin-tour";

const statuses: TourStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
type Values = { title: string; description: string; location: string; price: string; durationDays: string; status: TourStatus };

function valuesFor(tour?: AdminTour): Values {
  return {
    title: tour?.title ?? "",
    description: tour?.description ?? "",
    location: tour?.location ?? "",
    price: tour ? String(tour.price) : "",
    durationDays: tour ? String(tour.durationDays) : "",
    status: tour?.status ?? "DRAFT",
  };
}

export function TourForm({ tour }: { tour?: AdminTour }) {
  const creating = !tour;
  const { authRequest } = useAuth();
  const router = useRouter();
  const pendingRef = useRef(false);
  const [values, setValues] = useState<Values>(() => valuesFor(tour));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const setValue = <Key extends keyof Values>(key: Key, value: Values[Key]) => setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const price = Number(values.price);
    const durationDays = Number(values.durationDays);
    if (!values.title.trim() || !values.description.trim() || !values.location.trim()) {
      setError("Title, description, and location are required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price of zero or more.");
      return;
    }
    if (!Number.isInteger(durationDays) || durationDays < 1) {
      setError("Duration must be a whole number of at least one day.");
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setError("");
    const payload: TourMutationPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      location: values.location.trim(),
      price,
      durationDays,
      status: values.status,
    };
    try {
      const response = await authRequest<ApiResponse<AdminTour>>(
        creating ? "/tours" : `/tours/${encodeURIComponent(tour.id)}`,
        { method: creating ? "POST" : "PATCH", body: payload },
      );
      if (!isAdminTour(response.data)) throw new Error("Invalid tour response");
      router.replace(creating ? `/admin/tours/${encodeURIComponent(response.data.id)}/edit` : "/admin/tours");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "We couldn't save this tour. Please try again.");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
      <Card>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Tour title <span aria-hidden="true">*</span></span>
            <input value={values.title} onChange={(event) => setValue("title", event.target.value)} required maxLength={150} placeholder="e.g. Hunza Valley Escape" className="min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Description <span aria-hidden="true">*</span></span>
            <textarea value={values.description} onChange={(event) => setValue("description", event.target.value)} required rows={7} placeholder="Describe the tour for travelers." className="w-full rounded-xl border border-border bg-white px-4 py-3 focus-visible:outline-2 focus-visible:outline-focus" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Location <span aria-hidden="true">*</span></span>
            <input value={values.location} onChange={(event) => setValue("location", event.target.value)} required maxLength={150} placeholder="e.g. Hunza, Gilgit-Baltistan" className="min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Status <span aria-hidden="true">*</span></span>
            <select value={values.status} onChange={(event) => setValue("status", event.target.value as TourStatus)} className="min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Price <span aria-hidden="true">*</span></span>
            <div className="flex rounded-xl border border-border bg-white focus-within:outline-2 focus-within:outline-focus"><span className="flex items-center border-r border-border px-3 text-sm text-muted">PKR</span><input value={values.price} onChange={(event) => setValue("price", event.target.value)} required type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" className="min-h-11 min-w-0 flex-1 rounded-r-xl px-4 outline-none" /></div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Duration (days) <span aria-hidden="true">*</span></span>
            <input value={values.durationDays} onChange={(event) => setValue("durationDays", event.target.value)} required type="number" min="1" step="1" inputMode="numeric" placeholder="1" className="min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus" />
          </label>
        </div>
        {!creating && tour.tags.length > 0 && <p className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-muted">Existing tags are retained. Tag management is not available in this phase.</p>}
        {error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>{pending ? (creating ? "Creating..." : "Saving...") : (creating ? "Create Tour" : "Save Changes")}</Button>
        <Link href="/admin/tours" className={buttonClassName({ variant: "outline" })}>Cancel</Link>
      </div>
    </form>
  );
}
