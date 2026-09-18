import { isAllowedCloudinaryImage } from "@/lib/cloudinary-image";
import type { Tour, TourImage } from "@/types/tour";

export function getTourCover(tour: Tour): TourImage | undefined {
  return tour.images
    ?.filter((image) => isAllowedCloudinaryImage(image.url))
    .reduce<
      TourImage | undefined
    >((cover, image) => (!cover || image.sortOrder < cover.sortOrder ? image : cover), undefined);
}
