export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  bannerImage: string;
  bannerFallbackImage?: string;
  intro: string;
  history?: string;
  categories: string[];
  websiteUrl?: string;
  featuredProductIds?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  price: number;
  images: string[];
  featured: boolean;
  specifications: Record<string, string>;
  keyFeatures?: string[];
  quantity?: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  channelName: string;
}

export interface StoreInfo {
  storeName: string;
  domain: string;
  logoUrl: string;
  phone: string;
  addressLines: string[];
  businessHours: string[];
}

export interface GoogleReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type ProductSort = "price-asc" | "price-desc" | "name-asc";

export interface ProductFilters {
  search: string;
  categorySlug: string;
  brandSlug: string;
  sortBy: ProductSort;
}
