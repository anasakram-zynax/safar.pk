export type BookingStatus = "CONFIRMED" | "CANCELLED";

export interface Booking {
  id: string;
  status: BookingStatus;
  userId: string;
  tourId: string | null;
  tourTitleSnapshot: string;
  tourLocationSnapshot: string;
  tourPriceSnapshot: string | number;
  durationDaysSnapshot: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

export function isBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const booking = value as Record<string, unknown>;
  return (
    typeof booking.id === "string" &&
    (booking.status === "CONFIRMED" || booking.status === "CANCELLED") &&
    typeof booking.tourTitleSnapshot === "string" &&
    typeof booking.tourLocationSnapshot === "string" &&
    Number.isFinite(Number(booking.tourPriceSnapshot)) &&
    typeof booking.durationDaysSnapshot === "number"
  );
}
