export const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "duration_asc", label: "Duration: shortest" },
  { value: "duration_desc", label: "Duration: longest" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];
export type TourQuery = {
  search: string;
  location: string;
  tag: string;
  minPrice: string;
  maxPrice: string;
  minDuration: string;
  maxDuration: string;
  sort: SortValue;
  page: number;
};
export type QueryKey = keyof TourQuery;

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function nonNegativeNumber(value: string): string {
  if (!/^(?:\d+)(?:\.\d{1,2})?$/.test(value)) return "";
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 9_999_999_999.99
    ? String(number)
    : "";
}

function positiveInteger(value: string): string {
  if (!/^\d+$/.test(value)) return "";
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 && number <= 2_147_483_647
    ? String(number)
    : "";
}

export function parseTourQuery(raw: RawParams): TourQuery {
  const minPrice = nonNegativeNumber(first(raw.minPrice));
  const maxPrice = nonNegativeNumber(first(raw.maxPrice));
  const minDuration = positiveInteger(first(raw.minDuration));
  const maxDuration = positiveInteger(first(raw.maxDuration));
  const sortInput = first(raw.sort);
  const sort = sortOptions.some((option) => option.value === sortInput)
    ? (sortInput as SortValue)
    : "newest";
  return {
    search: first(raw.search),
    location: first(raw.location),
    tag: first(raw.tag).toLowerCase(),
    minPrice,
    maxPrice:
      maxPrice && minPrice && Number(maxPrice) < Number(minPrice)
        ? ""
        : maxPrice,
    minDuration,
    maxDuration:
      maxDuration && minDuration && Number(maxDuration) < Number(minDuration)
        ? ""
        : maxDuration,
    sort,
    page: Math.min(Number(positiveInteger(first(raw.page))) || 1, 1_000_000),
  };
}

export function queryParams(query: TourQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of [
    "search",
    "location",
    "tag",
    "minPrice",
    "maxPrice",
    "minDuration",
    "maxDuration",
  ] as const) {
    if (query[key]) params.set(key, query[key]);
  }
  if (query.sort !== "newest") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function toursHref(query: TourQuery): string {
  const search = queryParams(query).toString();
  return search ? `/tours?${search}` : "/tours";
}
