import type { Tour } from "@/types/tour";

export type TourStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AdminTour extends Tour {
  status: TourStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTourSummary {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface AdminTourList {
  tours: AdminTour[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: AdminTourSummary;
}

export type TourMutationPayload = {
  title: string;
  description: string;
  location: string;
  price: number;
  durationDays: number;
  status: TourStatus;
};

function isStatus(value: unknown): value is TourStatus {
  return value === "DRAFT" || value === "PUBLISHED" || value === "ARCHIVED";
}

export function isAdminTour(value: unknown): value is AdminTour {
  if (!value || typeof value !== "object") return false;
  const tour = value as Record<string, unknown>;
  return (
    typeof tour.id === "string" &&
    typeof tour.slug === "string" &&
    typeof tour.title === "string" &&
    typeof tour.description === "string" &&
    typeof tour.location === "string" &&
    Number.isFinite(Number(tour.price)) &&
    typeof tour.durationDays === "number" &&
    Array.isArray(tour.images) &&
    Array.isArray(tour.tags) &&
    isStatus(tour.status) &&
    typeof tour.createdAt === "string" &&
    typeof tour.updatedAt === "string"
  );
}

export function isAdminTourList(value: unknown): value is AdminTourList {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  const pagination = result.pagination as Record<string, unknown> | undefined;
  const summary = result.summary as Record<string, unknown> | undefined;
  return (
    Array.isArray(result.tours) &&
    result.tours.every(isAdminTour) &&
    Boolean(pagination) &&
    Boolean(summary) &&
    ["page", "limit", "total", "totalPages"].every((key) => Number.isInteger(pagination?.[key])) &&
    ["total", "published", "draft", "archived"].every((key) => Number.isInteger(summary?.[key]))
  );
}
