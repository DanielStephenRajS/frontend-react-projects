export interface CategorySubcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories?: CategorySubcategory[];
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

export interface ProductVariant {
  variant_id?: string | number;
  product_id?: string | number;
  variant_type: string;
  variant_value: string;
  sku?: string;
  price_inr?: number | null;
  stock?: number;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
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
  variants?: ProductVariant[];
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
  variantId?: string;
  variantType?: string;
  variantValue?: string;
  price?: number;
}

export type ProductSort = "price-asc" | "price-desc" | "name-asc";

export interface ProductFilters {
  search: string;
  categorySlug: string;
  brandSlug: string;
  sortBy: ProductSort;
}
