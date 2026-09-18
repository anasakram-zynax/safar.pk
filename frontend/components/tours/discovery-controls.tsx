"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, buttonClassName } from "@/components/ui/button";
import {
  parseTourQuery,
  sortOptions,
  toursHref,
  type SortValue,
  type TourQuery,
} from "@/lib/tours-query";

type FilterKey =
  | "location"
  | "tag"
  | "minPrice"
  | "maxPrice"
  | "minDuration"
  | "maxDuration";
type Draft = Pick<TourQuery, FilterKey>;
const filterKeys: FilterKey[] = [
  "location",
  "tag",
  "minPrice",
  "maxPrice",
  "minDuration",
  "maxDuration",
];
const filterLabels: Record<FilterKey, string> = {
  location: "Location",
  tag: "Tag",
  minPrice: "Min PKR",
  maxPrice: "Max PKR",
  minDuration: "Min days",
  maxDuration: "Max days",
};
const controlClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25";

function FilterFields({
  prefix,
  draft,
  setDraft,
}: {
  prefix: string;
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  const field = (
    key: FilterKey,
    label: string,
    placeholder: string,
    type = "text",
  ) => (
    <div className="space-y-1.5" key={key}>
      <label
        htmlFor={`${prefix}-${key}`}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={`${prefix}-${key}`}
        name={key}
        type={type}
        min={type === "number" ? (key.includes("Duration") ? 1 : 0) : undefined}
        step={key.includes("Price") ? "0.01" : undefined}
        value={draft[key]}
        onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
        placeholder={placeholder}
        className={controlClass}
      />
    </div>
  );
  return (
    <div className="space-y-5">
      {field("location", "Location", "e.g. Hunza")}
      <div className="grid grid-cols-2 gap-3">
        {field("minPrice", "Min price", "PKR 0", "number")}
        {field("maxPrice", "Max price", "Any", "number")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {field("minDuration", "Min days", "1", "number")}
        {field("maxDuration", "Max days", "Any", "number")}
      </div>
      {field("tag", "Tag slug", "e.g. nature")}
    </div>
  );
}

export function DiscoveryControls({
  query,
  children,
}: {
  query: TourQuery;
  children: ReactNode;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(query.search);
  const [draft, setDraft] = useState<Draft>(
    () =>
      Object.fromEntries(filterKeys.map((key) => [key, query[key]])) as Draft,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLInputElement>("input")?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  function navigate(next: TourQuery) {
    router.push(toursHref(next));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ ...query, search: search.trim(), page: 1 });
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = parseTourQuery({
      search: query.search,
      sort: query.sort,
      ...draft,
    });
    setOpen(false);
    navigate(next);
  }

  const chips: { key: FilterKey | "search" | "sort"; label: string }[] = [];
  if (query.search)
    chips.push({ key: "search", label: `Search: ${query.search}` });
  for (const key of filterKeys)
    if (query[key])
      chips.push({ key, label: `${filterLabels[key]}: ${query[key]}` });
  if (query.sort !== "newest")
    chips.push({
      key: "sort",
      label: `Sort: ${sortOptions.find((option) => option.value === query.sort)?.label}`,
    });

  return (
    <>
      <form
        onSubmit={submitSearch}
        role="search"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[0_16px_48px_-36px_rgba(23,43,66,.38)] sm:flex-row sm:items-center sm:p-4"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-background px-4 py-3.5 focus-within:ring-2 focus-within:ring-primary/35">
          <Search
            size={19}
            className="shrink-0 text-primary"
            aria-hidden="true"
          />
          <label htmlFor="discovery-search" className="sr-only">
            Search destinations or tours
          </label>
          <input
            id="discovery-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search destinations or tours..."
            className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none focus:ring-0 focus-visible:outline-none placeholder:text-muted"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      <div className="mt-9 grid gap-7 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Tour filters">
          <form
            onSubmit={applyFilters}
            className="sticky top-24 rounded-2xl border border-border bg-surface p-5 shadow-[0_16px_48px_-36px_rgba(23,43,66,.38)]"
          >
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
              <SlidersHorizontal
                size={19}
                className="text-primary"
                aria-hidden="true"
              />{" "}
              Filters
            </h2>
            <FilterFields prefix="desktop" draft={draft} setDraft={setDraft} />
            <Button type="submit" className="mt-6 w-full">
              Apply filters
            </Button>
            <button
              type="button"
              onClick={() => navigate({ ...parseTourQuery({}), page: 1 })}
              className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold text-primary-hover hover:bg-primary-light focus-visible:outline-offset-2"
            >
              Clear all
            </button>
          </form>
        </aside>

        <div id="results" className="min-w-0 scroll-mt-24">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={buttonClassName({
                variant: "outline",
                size: "sm",
                className: "lg:hidden",
              })}
            >
              <Filter size={17} aria-hidden="true" /> Filters
              {filterKeys.filter((key) => query[key]).length > 0
                ? ` (${filterKeys.filter((key) => query[key]).length})`
                : ""}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <label
                htmlFor="tour-sort"
                className="text-sm font-medium text-muted"
              >
                Sort by
              </label>
              <select
                id="tour-sort"
                value={query.sort}
                onChange={(event) =>
                  navigate({
                    ...query,
                    sort: event.target.value as SortValue,
                    page: 1,
                  })
                }
                className="min-h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chips.length > 0 && (
            <div
              aria-label="Active filters"
              className="mb-5 flex flex-wrap items-center gap-2"
            >
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() =>
                    navigate({
                      ...query,
                      [chip.key]: chip.key === "sort" ? "newest" : "",
                      page: 1,
                    })
                  }
                  aria-label={`Remove ${chip.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-light px-3 py-1.5 text-xs font-medium text-primary-hover hover:border-primary/50 focus-visible:outline-offset-2"
                >
                  {chip.label}
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigate(parseTourQuery({}))}
                className="px-2 py-1.5 text-xs font-semibold text-primary-hover underline underline-offset-4"
              >
                Clear all
              </button>
            </div>
          )}
          {children}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        aria-label="Tour filters"
        className="fixed inset-0 m-0 ml-auto h-full max-h-full w-[min(24rem,100%)] max-w-none border-0 bg-transparent p-0 backdrop:bg-[#092b41]/55 lg:hidden"
      >
        <motion.div
          initial={reducedMotion ? false : { x: 28, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.24 }}
          className="flex h-full flex-col bg-surface shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="rounded-lg p-2 text-muted hover:bg-surface-muted focus-visible:outline-offset-2"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <form
            onSubmit={applyFilters}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              <FilterFields prefix="mobile" draft={draft} setDraft={setDraft} />
            </div>
            <div className="flex gap-3 border-t border-border bg-surface px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(parseTourQuery({}));
                }}
                className={buttonClassName({
                  variant: "outline",
                  className: "flex-1",
                })}
              >
                Clear all
              </button>
              <Button type="submit" className="flex-1">
                Apply filters
              </Button>
            </div>
          </form>
        </motion.div>
      </dialog>
    </>
  );
}
