import { cache } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Tour } from "@/types/tour";

export const getTourDetail = cache(
  async (slug: string): Promise<Tour | null> => {
    try {
      const response = await apiRequest<ApiResponse<Tour>>(
        `/tours/${encodeURIComponent(slug)}`,
        { cache: "no-store" },
      );
      const tour = response.data;
      if (
        !tour ||
        !tour.id ||
        !tour.slug ||
        !Array.isArray(tour.images) ||
        !Array.isArray(tour.tags)
      ) {
        throw new Error("Invalid tour response");
      }
      return tour;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
);
