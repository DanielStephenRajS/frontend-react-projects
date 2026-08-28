import brandsData from "./brands.json";
import categoriesData from "./categories.json";
import reviewsData from "./reviews.json";
import storeData from "./store.json";
import youtubeData from "./youtube.json";
import { getAdminProducts } from "./admin-products";
import type {
  Brand,
  Category,
  GoogleReview,
  Product,
  StoreInfo,
  YouTubeVideo,
} from "../types";

// This module acts as a local repository layer so API-backed fetchers can replace it later.
export const catalogRepository = {
  getCategories: (): Category[] => categoriesData as unknown as Category[],
  getBrands: (): Brand[] => brandsData as unknown as Brand[],
  getProducts: (): Product[] => getAdminProducts(),
  getStore: (): StoreInfo => storeData as unknown as StoreInfo,
  getYouTubeVideos: (): YouTubeVideo[] => youtubeData as unknown as YouTubeVideo[],
  getReviews: (): GoogleReview[] => reviewsData as unknown as GoogleReview[],
};
