import { apiRequest } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Tour, TourList } from "@/types/tour";

export type HomepageTourData = { tours: Tour[]; error: boolean };

export async function getHomepageTours(): Promise<HomepageTourData> {
  try {
    const response = await apiRequest<ApiResponse<TourList>>(
      "/tours?page=1&limit=20",
      { cache: "no-store" },
    );
    if (!response.data || !Array.isArray(response.data.tours)) {
      throw new Error("Unexpected tours response");
    }
    return { tours: response.data.tours, error: false };
  } catch {
    return { tours: [], error: true };
  }
}
