import { isBooking, type Booking, type BookingStatus } from "@/types/booking";

export interface AdminBookingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminBookingSummary {
  total: number;
  confirmed: number;
  cancelled: number;
}

export interface AdminBookingList {
  bookings: Booking[];
  pagination: AdminBookingPagination;
  summary: AdminBookingSummary;
}

export function isAdminBookingList(value: unknown): value is AdminBookingList {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const pagination = data.pagination as Record<string, unknown> | undefined;
  const summary = data.summary as Record<string, unknown> | undefined;
  return Array.isArray(data.bookings) && data.bookings.every(isBooking) &&
    !!pagination && ["page", "limit", "total", "totalPages"].every((key) => typeof pagination[key] === "number") &&
    typeof pagination.hasNextPage === "boolean" && typeof pagination.hasPreviousPage === "boolean" &&
    !!summary && ["total", "confirmed", "cancelled"].every((key) => typeof summary[key] === "number");
}

export type { Booking, BookingStatus };
