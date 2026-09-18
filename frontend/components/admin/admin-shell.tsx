"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Map, Menu, MoveLeft, ReceiptText, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Brand } from "@/components/common/brand";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Tours", href: "/admin/tours", icon: Map },
  { label: "Bookings", href: "/admin/bookings", icon: ReceiptText },
] as const;

function AdminNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const logout = () => {
    signOut();
    window.location.replace("/");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-5">
        <Brand />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-hover">Administration</p>
      </div>
      <nav aria-label="Admin navigation" className="mt-3 space-y-1 px-2">
        {links.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                active ? "bg-primary text-white" : "text-foreground/80 hover:bg-primary-light hover:text-primary-hover",
              )}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2 border-t border-border px-2 pt-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-primary-light hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-focus"
        >
          <MoveLeft size={18} aria-hidden="true" />
          Back to Safar.pk
        </Link>
        <button
          type="button"
          onClick={logout}
          className={cn(buttonClassName({ variant: "outline" }), "mb-2 w-full justify-start gap-3")}
        >
          <LogOut size={18} aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-border bg-surface px-4 py-5 md:block">
        <AdminNavigation />
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-[72px] items-center justify-between border-b border-border bg-surface px-5 sm:px-8 md:hidden">
          <div>
            <p className="text-sm font-semibold text-foreground">Safar.pk Admin</p>
            <p className="text-xs text-muted">Administration</p>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary-light hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-focus"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </header>
        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-foreground/30"
            />
            <aside
              id="admin-mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className="relative h-full w-[min(82vw,320px)] border-r border-border bg-surface px-4 py-5 shadow-xl"
            >
              <AdminNavigation onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}
        <main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}


