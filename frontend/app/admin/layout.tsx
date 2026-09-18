import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminGate } from "@/components/auth/auth-gate";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Administration | Safar.pk",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate><AdminShell>{children}</AdminShell></AdminGate>;
}
