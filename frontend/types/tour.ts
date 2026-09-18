export interface TourImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface TourTag {
  tag: { id: string; name: string; slug: string };
}

export interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  price: string | number;
  durationDays: number;
  images: TourImage[];
  tags: TourTag[];
}

export interface TourList {
  tours: Tour[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
