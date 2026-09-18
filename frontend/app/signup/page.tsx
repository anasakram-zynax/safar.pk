import type { Metadata } from "next";
import { GuestGate } from "@/components/auth/auth-gate";
import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { safeNextPath } from "@/lib/auth/next-path";

export const metadata: Metadata = { title: "Create an account | Safar.pk" };
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const next = safeNextPath((await searchParams).next);
  return (
    <main>
      <Container className="flex min-h-[65vh] items-center justify-center py-12">
        <Card className="w-full max-w-lg">
          <h1 className="heading-two">Join Safar.pk</h1>
          <p className="body-copy mt-2 text-muted">
            Create your account and start exploring Pakistan.
          </p>
          <GuestGate next={next}>
            <SignupForm next={next} />
          </GuestGate>
        </Card>
      </Container>
    </main>
  );
}
