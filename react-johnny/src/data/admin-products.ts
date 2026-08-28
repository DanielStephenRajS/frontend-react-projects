import type { Product } from "../types";

const ADMIN_PRODUCTS_STORAGE_KEY = "johnny-fishing-admin-products";
const PRODUCTS_API_URL = "http://127.0.0.1:8000/api/products";

export interface ProductApiPayload {
  product_name: string;
  product_description: string;
  short_description?: string | null;
  brand_name: string;
  category_name: string;
  price_inr: number | string;
  key_features?: string | null;
  specifications?: string | Record<string, string> | null;
  stock_quantity?: number | string | null;
  is_featured?: boolean;
  is_active?: boolean;
  images?: Array<string | File>;
}

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

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(",");
  const mime = (header.match(/data:(.*?);base64/) ?? ["", "image/jpeg"])[1];
  const binary = atob(base64 ?? "");
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime || "image/jpeg" });
};

const formatSpecifications = (specs: ProductApiPayload["specifications"]): string => {
  if (!specs) {
    return "";
  }

  if (typeof specs === "string") {
    return specs;
  }

  return Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
};

const appendImagesToFormData = (formData: FormData, images: Array<string | File> = []): void => {
  images.filter(Boolean).forEach((image) => {
    if (image instanceof File) {
      formData.append("images", image, image.name || "uploaded-product-image.jpg");
      return;
    }

    const imageValue = String(image).trim();
    if (!imageValue) {
      return;
    }

    if (imageValue.startsWith("data:")) {
      const blob = dataUrlToBlob(imageValue);
      const fallbackName = `uploaded-product-image-${Date.now()}.jpg`;
      formData.append("images", blob, fallbackName);
      return;
    }

    formData.append("images", imageValue);
  });
};

const buildProductFormData = (payload: ProductApiPayload): FormData => {
  const formData = new FormData();

  formData.append("product_name", payload.product_name);
  formData.append("product_description", payload.product_description);
  if (payload.short_description) {
    formData.append("short_description", payload.short_description);
  }
  formData.append("brand_name", payload.brand_name);
  formData.append("category_name", payload.category_name);
  formData.append("price_inr", String(payload.price_inr));

  const features = payload.key_features?.trim();
  if (features) {
    formData.append("key_features", features);
  }

  const specifications = formatSpecifications(payload.specifications);
  if (specifications) {
    formData.append("specifications", specifications);
  }

  if (payload.stock_quantity !== undefined && payload.stock_quantity !== null) {
    formData.append("stock_quantity", String(payload.stock_quantity));
  }

  formData.append("is_featured", String(Boolean(payload.is_featured)));
  formData.append("is_active", String(Boolean(payload.is_active ?? true)));

  appendImagesToFormData(formData, payload.images ?? []);

  return formData;
};

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const text = await response.text();
    if (!text) {
      return "Request failed";
    }
    return text;
  } catch {
    return "Request failed";
  }
};

export const notifyProductsRefresh = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("johnny-products-refresh"));
  }
};

export const createProduct = async (payload: ProductApiPayload): Promise<unknown> => {
  const response = await fetch(PRODUCTS_API_URL, {
    method: "POST",
    body: buildProductFormData(payload),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  notifyProductsRefresh();

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const updateProduct = async (productId: number | string, payload: ProductApiPayload): Promise<unknown> => {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: "PUT",
    body: buildProductFormData(payload),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  notifyProductsRefresh();

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const deleteProduct = async (productId: number | string): Promise<void> => {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const idToRemove = String(productId);
  const existing = getAdminProducts();
  const next = existing.filter((item) => String(item.id) !== idToRemove);
  if (next.length !== existing.length) {
    saveAdminProducts(next);
  }

  notifyProductsRefresh();
};

export const pruneStaleAdminProducts = (liveProductIds: Iterable<string | number>): void => {
  const validIds = new Set(Array.from(liveProductIds, (id) => String(id)));
  const existing = getAdminProducts();
  const next = existing.filter((product) => product.id.startsWith("admin-") || !validIds.has(String(product.id)));

  if (next.length !== existing.length) {
    saveAdminProducts(next);
  }
};

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
  notifyProductsRefresh();
};

export const updateAdminProduct = (product: Product): void => {
  const existing = getAdminProducts();
  saveAdminProducts(existing.map((item) => (item.id === product.id ? product : item)));
  notifyProductsRefresh();
};

export const removeAdminProduct = (productId: string): void => {
  const existing = getAdminProducts();
  saveAdminProducts(existing.filter((item) => item.id !== productId));
  notifyProductsRefresh();
};
