"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

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
    next === "/login" ||
    next.startsWith("/login?") ||
    next === "/signup" ||
    next.startsWith("/signup?") ||
    (status === "admin" &&
      (next === "/cart" ||
        next.startsWith("/cart?") ||
        next === "/checkout" ||
        next.startsWith("/checkout?")))
      ? "/"
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
