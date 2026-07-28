import type { Product } from "../types";

const ADMIN_PRODUCTS_STORAGE_KEY = "johnny-fishing-admin-products";

export class AdminStorageQuotaError extends Error {
  constructor() {
    super("Admin product storage quota exceeded");
    this.name = "AdminStorageQuotaError";
  }
}

const isQuotaExceeded = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014);

export const getAdminProducts = (): Product[] => {
  const raw = localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY);
    return [];
  }
};

export const saveAdminProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(ADMIN_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    if (isQuotaExceeded(error)) {
      throw new AdminStorageQuotaError();
    }
    throw error;
  }
};

export const addAdminProduct = (product: Product): void => {
  const existing = getAdminProducts();
  saveAdminProducts([product, ...existing.filter((item) => item.id !== product.id)]);
};
