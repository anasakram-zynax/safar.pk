import type { Tour } from "@/types/tour";

export interface CartItem {
  id: string;
  cartId: string;
  tourId: string;
  createdAt: string;
  tour: Tour;
}

export interface CartData {
  id?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  item: CartItem | null;
}

export function isCartData(value: unknown): value is CartData {
  if (!value || typeof value !== "object" || !("item" in value)) return false;
  const item = value.item;
  if (item === null) return true;
  if (!item || typeof item !== "object" || !("tour" in item)) return false;
  const tour = item.tour;
  return (
    !!tour &&
    typeof tour === "object" &&
    "id" in tour &&
    typeof tour.id === "string" &&
    "slug" in tour &&
    typeof tour.slug === "string" &&
    "title" in tour &&
    typeof tour.title === "string" &&
    "price" in tour &&
    Number.isFinite(Number(tour.price)) &&
    "images" in tour &&
    Array.isArray(tour.images) &&
    "tags" in tour &&
    Array.isArray(tour.tags)
  );
}
