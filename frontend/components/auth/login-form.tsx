"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { LoginData, LoginPayload } from "@/types/auth";

export function LoginForm({
  next,
  registered,
}: {
  next: string;
  registered: boolean;
}) {
  const router = useRouter();
  const auth = useAuth();
  const pendingRef = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const payload: LoginPayload = {
        email: String(form.get("email") || "").trim(),
        password: String(form.get("password") || ""),
      };
      const response = await apiRequest<ApiResponse<LoginData>>("/auth/login", {
        method: "POST",
        body: { ...payload },
      });
      if (
        !response.data?.accessToken ||
        !response.data.user?.id ||
        !["CUSTOMER", "ADMIN"].includes(response.data.user?.role)
      )
        throw new Error("Invalid login response");
      auth.signIn(response.data.accessToken, response.data.user);
      router.replace(next);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 401
          ? caught.message === "This account is inactive."
            ? "This account is inactive."
            : "Invalid email or password."
          : caught instanceof ApiError && caught.status === 400
            ? "Check your email and password and try again."
            : "Login is unavailable right now. Please try again.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-5">
      {registered && (
        <p
          role="status"
          className="rounded-xl bg-primary-light p-3 text-sm text-primary-hover"
        >
          Account created. Log in to continue.
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          className="min-h-11 w-full rounded-xl border border-border bg-white px-4 focus-visible:outline-2 focus-visible:outline-focus"
        />
      </div>
      <PasswordField
        id="password"
        label="Password"
        autoComplete="current-password"
      />
      {error && (
        <p
          role="alert"
          tabIndex={-1}
          ref={errorRef}
          className="text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in..." : "Log in"}
      </Button>
      <p className="text-center text-sm text-muted">
        New to Safar.pk?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-primary-hover underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
