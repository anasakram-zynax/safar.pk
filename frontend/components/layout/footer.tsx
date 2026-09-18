import Link from "next/link";
import { Fragment } from "react";
import { Brand } from "@/components/common/brand";
import { Container } from "@/components/ui/container";
import { FooterAccountLinks } from "@/components/layout/footer-account-links";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Tours", href: "/tours" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted/80">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="max-w-xs">
            <Brand />
            <p className="body-copy mt-5 text-sm text-muted">
              Thoughtful journeys and unforgettable places across Pakistan.
            </p>
          </div>
          {groups.map(({ title, links }) => (
            <Fragment key={title}>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="rounded-sm text-sm text-muted transition-colors hover:text-primary-hover"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {title === "Explore" && <FooterAccountLinks />}
            </Fragment>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Safar.pk</p>
          <p>Explore Pakistan, one journey at a time.</p>
        </div>
      </Container>
    </footer>
  );
}
