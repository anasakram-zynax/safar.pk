import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { GuestGate } from "@/components/auth/auth-gate";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = { title: "Log in | Safar.pk" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; registered?: string }>;
}) {
  const query = await searchParams;
  const next = safeNextPath(query.next);
  return (
    <main>
      <Container className="flex min-h-[65vh] items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <h1 className="heading-two">Welcome back</h1>
          <p className="body-copy mt-2 text-muted">
            Log in to continue your journey.
          </p>
          <GuestGate next={next}>
            <LoginForm next={next} registered={query.registered === "1"} />
          </GuestGate>
        </Card>
      </Container>
    </main>
  );
}
