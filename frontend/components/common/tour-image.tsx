import Image from "next/image";
import { MountainSnow, Sun } from "lucide-react";
import { isAllowedCloudinaryImage } from "@/lib/cloudinary-image";
import type { TourImage as TourImageData } from "@/types/tour";

export function TourImage({
  image,
  title,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  image?: TourImageData;
  title: string;
  sizes?: string;
}) {
  if (isAllowedCloudinaryImage(image?.url)) {
    return (
      <Image
        src={image.url}
        alt={image.altText || `${title} tour landscape`}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Illustrated mountain placeholder for ${title}`}
      className="absolute inset-0 overflow-hidden bg-linear-to-br from-[#d9edfa] via-[#eaf5fc] to-[#b9dced]"
    >
      <Sun
        className="absolute right-[18%] top-[19%] size-11 text-[#f7d58d]"
        strokeWidth={1.2}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-[-18%] h-[67%] rounded-[50%] bg-[#b9dbe4]" />
      <MountainSnow
        className="absolute bottom-[14%] left-1/2 h-[60%] w-[70%] -translate-x-1/2 text-[#5d91ad]"
        strokeWidth={0.9}
        aria-hidden="true"
      />
    </div>
  );
}
