"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Brand } from "@/components/common/brand";
import { buttonClassName } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "About", href: "/about" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function CartLink({ pathname, count, onClick, mobile = false }: { pathname: string; count?: number; onClick?: () => void; mobile?: boolean }) {
  const active = isActive(pathname, "/cart");
  return (
    <Link href="/cart" onClick={onClick} aria-current={active ? "page" : undefined} className={cn("inline-flex items-center gap-2 rounded-md font-medium transition-colors hover:text-primary-hover", mobile ? "w-full px-3 py-3 text-base" : "px-2 py-2 text-sm", active ? "text-primary-hover" : "text-foreground/80")}>
      <ShoppingCart size={17} strokeWidth={1.8} aria-hidden="true" /> Cart
      {count !== undefined && count > 0 && <span aria-label={`${count} items in cart`} className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] leading-5 text-white">{count}</span>}
    </Link>
  );
}

export function Navbar({ cartCount }: { cartCount?: number }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("resize", onResize); };
  }, [menuOpen]);

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-200", scrolled || menuOpen ? "border-border bg-white/95 shadow-[0_8px_28px_-20px_rgba(23,43,66,.35)] backdrop-blur-md" : "border-border/70 bg-white/80 backdrop-blur-sm")}>
      <Container className="flex h-[72px] items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {primaryLinks.map(({ label, href }) => {
            const active = isActive(pathname, href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("relative rounded-sm py-2 text-sm font-medium transition-colors hover:text-primary-hover", active ? "text-primary-hover" : "text-foreground/75")}>{label}{active && <motion.span layoutId="primary-nav-active" transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }} className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary" />}</Link>;
          })}
        </nav>
        <div className="hidden items-center justify-end gap-4 md:flex">
          <CartLink pathname={pathname} count={cartCount} />
          <Link href="/login" className={buttonClassName({ variant: "primary", size: "sm" })}>Login</Link>
        </div>
        <button ref={menuButtonRef} type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-primary-light hover:text-primary-hover md:hidden">
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </Container>
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav id="mobile-navigation" aria-label="Mobile navigation" initial={reducedMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }} className="absolute inset-x-0 top-full border-b border-border bg-white shadow-[0_18px_32px_-24px_rgba(23,43,66,.45)] md:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {primaryLinks.map(({ label, href }) => {
                const active = isActive(pathname, href);
                return <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={cn("rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-primary-light hover:text-primary-hover", active ? "bg-primary-light text-primary-hover" : "text-foreground/80")}>{label}</Link>;
              })}
              <CartLink pathname={pathname} count={cartCount} mobile onClick={() => setMenuOpen(false)} />
              <Link href="/login" onClick={() => setMenuOpen(false)} className={buttonClassName({ className: "mt-2 w-full" })}>Login</Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
