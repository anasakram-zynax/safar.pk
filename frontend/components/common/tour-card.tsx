import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TourImage } from "@/components/common/tour-image";
import { getTourCover } from "@/lib/tour-cover";
import type { Tour } from "@/types/tour";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function TourCard({ tour }: { tour: Tour }) {
  const price = Number(tour.price);
  const formattedPrice = Number.isFinite(price)
    ? priceFormatter.format(price)
    : "See details";
  return (
    <Card className="group overflow-hidden p-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_-26px_rgba(23,43,66,.28)] sm:p-0">
      <Link
        href={`/tours/${encodeURIComponent(tour.slug)}`}
        className="block rounded-2xl focus-visible:outline-offset-[-3px]"
      >
        <div className="relative aspect-4/3 overflow-hidden">
          <TourImage image={getTourCover(tour)} title={tour.title} />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex min-h-7 items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <MapPin size={14} aria-hidden="true" />
              {tour.location}
            </span>
            {tour.tags?.[0] && (
              <Badge className="shrink-0">{tour.tags[0].tag.name}</Badge>
            )}
          </div>
          <h3 className="heading-three mt-3 line-clamp-2">{tour.title}</h3>
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays size={15} aria-hidden="true" />
            {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
          </p>
          <div className="mt-5 flex items-end justify-between gap-2 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted">From</p>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                {formattedPrice}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-hover">
              View details <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
