"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <div className="flex min-h-screen flex-1 flex-col">{children}</div>;
  }
  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
