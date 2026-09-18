import Link from "next/link";
import { ArrowLeft, ArrowRight, Compass, RefreshCw } from "lucide-react";
import { TourCard } from "@/components/common/tour-card";
import { TourCardSkeleton } from "@/components/skeletons/tour-card-skeleton";
import { apiRequest } from "@/lib/api/client";
import { queryParams, toursHref, type TourQuery } from "@/lib/tours-query";
import type { ApiResponse } from "@/types/api";
import type { TourList } from "@/types/tour";

export function ResultsSkeleton() {
  return (
    <div role="status" aria-label="Loading tour results" className="space-y-6">
      <div className="h-5 w-40 animate-pulse rounded bg-surface-muted" />
      <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <TourCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function PageLink({
  query,
  page,
  current,
}: {
  query: TourQuery;
  page: number;
  current?: boolean;
}) {
  return (
    <Link
      href={`${toursHref({ ...query, page })}#results`}
      aria-current={current ? "page" : undefined}
      className={`inline-flex size-10 items-center justify-center rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-offset-2 ${current ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-light"}`}
    >
      {page}
    </Link>
  );
}

function Pagination({
  query,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: {
  query: TourQuery;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}) {
  if (totalPages <= 1) return null;
  const first = Math.max(1, Math.min(query.page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(5, totalPages - first + 1) },
    (_, index) => first + index,
  );
  const control =
    "inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-primary-light focus-visible:outline-offset-2";
  return (
    <nav
      aria-label="Tour result pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {hasPreviousPage ? (
        <Link
          href={`${toursHref({ ...query, page: query.page - 1 })}#results`}
          className={control}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${control} cursor-not-allowed opacity-45`}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Previous
        </span>
      )}
      {first > 1 && (
        <>
          <PageLink query={query} page={1} />
          <span aria-hidden="true" className="px-1 text-muted">
            …
          </span>
        </>
      )}
      {pages.map((page) => (
        <PageLink
          key={page}
          query={query}
          page={page}
          current={page === query.page}
        />
      ))}
      {pages.at(-1)! < totalPages && (
        <>
          <span aria-hidden="true" className="px-1 text-muted">
            …
          </span>
          <PageLink query={query} page={totalPages} />
        </>
      )}
      {hasNextPage ? (
        <Link
          href={`${toursHref({ ...query, page: query.page + 1 })}#results`}
          className={control}
        >
          Next <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={`${control} cursor-not-allowed opacity-45`}
        >
          Next <ArrowRight size={16} aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}

export async function TourResults({ query }: { query: TourQuery }) {
  let result: TourList;
  try {
    const params = queryParams(query);
    params.set("limit", "9");
    const response = await apiRequest<ApiResponse<TourList>>(
      `/tours?${params}`,
      { cache: "no-store" },
    );
    if (
      !response.data ||
      !Array.isArray(response.data.tours) ||
      !response.data.pagination
    )
      throw new Error("Invalid tours response");
    result = response.data;
  } catch {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-border bg-surface p-10 text-center"
      >
        <RefreshCw
          className="mx-auto text-primary"
          size={30}
          aria-hidden="true"
        />
        <h2 className="heading-three mt-4">
          We couldn&apos;t load tours right now.
        </h2>
        <p className="body-copy mt-2">Please try again in a moment.</p>
        <a
          href={toursHref(query)}
          className="mt-5 inline-flex text-sm font-semibold text-primary-hover underline underline-offset-4"
        >
          Retry
        </a>
      </div>
    );
  }

  const { tours, pagination } = result;
  if (!tours.length && pagination.total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <Compass
          className="mx-auto text-primary"
          size={32}
          aria-hidden="true"
        />
        <h2 className="heading-three mt-4">No tours found</h2>
        <p className="body-copy mt-2">
          We couldn&apos;t find tours matching those filters.
        </p>
        <Link
          href="/tours"
          className="mt-5 inline-flex text-sm font-semibold text-primary-hover underline underline-offset-4"
        >
          Clear filters
        </Link>
      </div>
    );
  }
  if (!tours.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <Compass
          className="mx-auto text-primary"
          size={32}
          aria-hidden="true"
        />
        <h2 className="heading-three mt-4">Page out of range</h2>
        <p className="body-copy mt-2">
          There are {pagination.totalPages} pages of tours for this search.
        </p>
        <Link
          href={toursHref({
            ...query,
            page: Math.max(1, pagination.totalPages),
          })}
          className="mt-5 inline-flex text-sm font-semibold text-primary-hover underline underline-offset-4"
        >
          Go to last page
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-5 text-sm text-muted" aria-live="polite">
        <span className="font-semibold text-foreground">
          {pagination.total}
        </span>{" "}
        {pagination.total === 1 ? "tour" : "tours"} found
        {query.search ? ` for “${query.search}”` : ""}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
      <Pagination
        query={query}
        totalPages={pagination.totalPages}
        hasPreviousPage={pagination.hasPreviousPage}
        hasNextPage={pagination.hasNextPage}
      />
    </>
  );
}
