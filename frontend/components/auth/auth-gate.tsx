"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { postLoginPath } from "@/lib/auth/next-path";

export function CustomerGate({
  children,
  next,
  resourceLabel = "cart",
}: {
  children: ReactNode;
  next: string;
  resourceLabel?: string;
}) {
  const { status } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "guest")
      router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [status, router, next]);
  if (status === "customer") return <>{children}</>;
  if (status === "admin")
    return (
      <p role="alert">
        The {resourceLabel} is available to customer accounts.{" "}
        <Link href="/tours" className="text-primary-hover underline">
          Browse tours
        </Link>
      </p>
    );
  if (status === "unavailable")
    return (
      <p role="alert">
        We couldn&apos;t verify your account. Refresh to try again.
      </p>
    );
  return (
    <p role="status" className="text-muted">
      Checking your account...
    </p>
  );
}

export function AdminGate({
  children,
  next,
}: {
  children: ReactNode;
  next?: string;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const destination = next ?? pathname;
  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?next=${encodeURIComponent(destination)}`);
    }
    if (status === "customer") router.replace("/");
  }, [status, router, destination]);
  if (status === "admin") return <>{children}</>;
  if (status === "unavailable") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p role="alert" className="text-center text-muted">
          We couldn&apos;t verify your account. Refresh to try again.
        </p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-background p-5 sm:p-8">
      <div role="status" aria-label="Loading administration" className="mx-auto max-w-7xl animate-pulse">
        <div className="h-14 w-full rounded-2xl bg-surface-muted md:hidden" />
        <div className="mt-5 grid min-h-[75vh] gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="hidden rounded-2xl bg-surface-muted md:block" />
          <div className="rounded-2xl bg-surface-muted p-7">
            <div className="h-10 w-64 max-w-full rounded bg-white/80" />
            <div className="mt-4 h-5 w-96 max-w-full rounded bg-white/80" />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-32 rounded-xl bg-white/80" />
            </div>
          </div>
        </div>
        <span className="sr-only">Checking administration access...</span>
      </div>
    </main>
  );
}

export function GuestGate({
  children,
  next,
}: {
  children: ReactNode;
  next: string;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const destination =
    status === "admin" || status === "customer"
      ? postLoginPath(status === "admin" ? "ADMIN" : "CUSTOMER", next)
      : next;
  useEffect(() => {
    if (status === "customer" || status === "admin")
      router.replace(destination);
  }, [status, router, destination]);
  if (status === "guest") return <>{children}</>;
  if (status === "unavailable")
    return (
      <p role="alert">
        We couldn&apos;t verify your account. Refresh to try again.
      </p>
    );
  return (
    <p role="status" className="text-muted">
      Checking your account...
    </p>
  );
}
