"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { RegisterData, RegisterPayload } from "@/types/auth";

const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus";
export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const pendingRef = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (password !== form.get("confirmPassword")) {
      setConfirmError("Passwords do not match.");
      document.getElementById("confirmPassword")?.focus();
      return;
    }
    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    if (!firstName || !lastName) {
      setError("Enter your first and last name.");
      document.getElementById(!firstName ? "firstName" : "lastName")?.focus();
      return;
    }
    setConfirmError("");
    setError("");
    pendingRef.current = true;
    setPending(true);
    const payload: RegisterPayload = {
      firstName,
      lastName,
      email: String(form.get("email") || "").trim(),
      password,
    };
    try {
      const response = await apiRequest<ApiResponse<RegisterData>>(
        "/auth/register",
        { method: "POST", body: { ...payload } },
      );
      if (response.data?.user?.role !== "CUSTOMER" || !response.data.user.id)
        throw new Error("Invalid registration response");
      router.replace(`/login?registered=1&next=${encodeURIComponent(next)}`);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 409
          ? "An account with this email already exists. Log in instead."
          : caught instanceof ApiError && caught.status === 400
            ? "Please check your details and try again."
            : "Signup is unavailable right now. Please try again.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={50}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={50}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="signup-email"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          className={inputClass}
        />
      </div>
      <PasswordField
        id="password"
        label="Password"
        autoComplete="new-password"
      />
      <PasswordField
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={confirmError}
      />
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-primary-hover underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
