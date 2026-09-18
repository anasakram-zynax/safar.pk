"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

const linkClass =
  "rounded-sm text-sm text-muted transition-colors hover:text-primary-hover";
export function FooterAccountLinks() {
  const { status } = useAuth();
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">Account</h2>
      <ul className="mt-5 space-y-3">
        {status === "guest" && (
          <>
            <li>
              <Link href="/login" className={linkClass}>
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className={linkClass}>
                Sign up
              </Link>
            </li>
          </>
        )}
        {(status === "guest" || status === "customer") && (
          <li>
            <Link href="/cart" className={linkClass}>
              Cart
            </Link>
          </li>
        )}
        {status === "admin" && (
          <li className="text-sm text-muted">Admin account</li>
        )}
        {(status === "loading" || status === "unavailable") && (
          <li
            className="h-4 w-20 animate-pulse rounded bg-border"
            aria-label="Checking account"
          />
        )}
      </ul>
    </div>
  );
}
