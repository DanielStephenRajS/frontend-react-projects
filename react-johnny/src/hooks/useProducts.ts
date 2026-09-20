import { useEffect, useMemo, useState } from "react";
import { getAdminProducts, pruneStaleAdminProducts } from "../data/admin-products";
import { normalizeImageUrl } from "../utils/images";
import type { Product, ProductVariant } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");
const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`;

export interface ProductQueryParams {
  limit?: number;
  offset?: number;
  category?: string;
  brand?: string;
  search?: string;
  sortBy?: string;
}

export interface ProductsApiResponse {
  products?: ApiProduct[];
  data?: ApiProduct[];
  items?: ApiProduct[];
  has_more?: boolean;
  hasMore?: boolean;
  total?: number;
}

interface ApiProductImage {
  image_url?: string | null;
  image_data?: string | null;
  image_content_type?: string | null;
  sort_order?: number;
  is_primary?: boolean;
}

interface ApiProductVariant {
  variant_id?: number | string;
  product_id?: number | string;
  variant_type?: string;
  variant_value?: string;
  sku?: string | null;
  price_inr?: number | null;
  stock?: number | null;
  is_active?: boolean;
  sort_order?: number | null;
}

interface ApiProduct {
  product_id: number | string;
  product_name: string;
  product_description: string;
  short_description: string;
  brand_name: string;
  category_name: string;
  price_inr: number;
  key_features?: string | null;
  specifications?: string | null;
  stock_quantity?: number | null;
  is_featured: boolean;
  is_active: boolean;
  images?: ApiProductImage[];
  variants?: ApiProductVariant[] | string | null;
  product_variants?: ApiProductVariant[] | string | null;
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const parseKeyFeatures = (raw: string | null | undefined): string[] | undefined => {
  if (!raw) {
    return undefined;
  }

  const normalized = raw
    .replace(/\r/g, "\n")
    .replace(/\u2022|•|●/g, "\n")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

  if (!normalized) {
    return undefined;
  }

  const items = normalized
    .split(/\n+/)
    .flatMap((segment) =>
      segment
        .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
        .map((part) => part.trim())
        .filter(Boolean),
    )
    .map((item) => item.replace(/^[\-\*\d\.\)]\s*/, "").replace(/^[:\-–—]\s*/, "").trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
};

const parseSpecifications = (raw: string | null | undefined): Record<string, string> => {
  if (!raw) {
    return {};
  }

  return raw
    .split(/[;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const separatorIndex = pair.indexOf(":");
      if (separatorIndex === -1) {
        return acc;
      }

      const key = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
};

const parseVariants = (raw: ApiProduct["variants"] | ApiProduct["product_variants"]): ProductVariant[] => {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw
      .filter((variant) => Boolean(variant && variant.variant_type && variant.variant_value))
      .map((variant) => ({
        variant_id: variant.variant_id ?? `${variant.variant_type}-${variant.variant_value}`,
        product_id: variant.product_id ?? undefined,
        variant_type: String(variant.variant_type ?? ""),
        variant_value: String(variant.variant_value ?? ""),
        sku: variant.sku ?? undefined,
        price_inr: variant.price_inr ?? null,
        stock: variant.stock ?? 0,
        is_active: variant.is_active ?? true,
        sort_order: variant.sort_order ?? 0,
      })) as ProductVariant[];
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as ApiProductVariant[];
      return parseVariants(parsed);
    } catch {
      return [];
    }
  }

  return [];
};

const normalizeProduct = (item: ApiProduct): Product => {
  const images = [...(item.images ?? [])]
    .sort((a, b) => {
      if (Boolean(a.is_primary) && !Boolean(b.is_primary)) {
        return -1;
      }
      if (!Boolean(a.is_primary) && Boolean(b.is_primary)) {
        return 1;
      }
      return Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
    })
    .map((image) => {
      const rawImageUrl = image.image_url?.trim();
      const rawImageData = image.image_data?.trim();

      if (rawImageUrl) {
        return normalizeImageUrl(rawImageUrl);
      }

      if (rawImageData) {
        const sanitizedBase64 = rawImageData.replace(/^data:.*;base64,/, "").trim();
        const mimeType = image.image_content_type?.trim() || "image/jpeg";

        if (sanitizedBase64) {
          return `data:${mimeType};base64,${sanitizedBase64}`;
        }

        return normalizeImageUrl(rawImageData);
      }

      return "";
    })
    .filter(Boolean);

  const brandSlug = slugify(item.brand_name);
  const categorySlug = slugify(item.category_name);

  return {
    id: String(item.product_id),
    name: item.product_name,
    description: item.product_description,
    shortDescription: item.short_description,
    brand: item.brand_name,
    brandSlug,
    category: item.category_name,
    categorySlug,
    price: Number(item.price_inr),
    images: images.map((image) => normalizeImageUrl(image)).filter(Boolean),
    featured: Boolean(item.is_featured),
    specifications: parseSpecifications(item.specifications),
    keyFeatures: parseKeyFeatures(item.key_features),
    quantity: item.stock_quantity ?? undefined,
    variants: parseVariants(item.variants ?? item.product_variants),
  };
};

const buildProductsQuery = (params: ProductQueryParams = {}) => {
  const query = new URLSearchParams();

  if (typeof params.limit === "number") query.set("limit", String(params.limit));
  if (typeof params.offset === "number") query.set("offset", String(params.offset));
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.brand && params.brand !== "all") query.set("brand", params.brand);
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (params.sortBy && params.sortBy !== "name-asc") query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  return queryString ? `${PRODUCTS_API_URL}?${queryString}` : PRODUCTS_API_URL;
};

export const getProducts = async (params: ProductQueryParams = {}) => {
  const response = await fetch(buildProductsQuery(params));
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const payload = (await response.json()) as ApiProduct[] | ProductsApiResponse | null;
  const responseList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.products)
      ? payload.products
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

  const products = responseList
    .filter((item): item is ApiProduct => Boolean(item && typeof item === "object"))
    .filter((item) => item.is_active !== false)
    .map(normalizeProduct);

  const responseMeta =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as ProductsApiResponse)
      : undefined;

  const hasMore =
    responseMeta && (responseMeta.has_more !== undefined || responseMeta.hasMore !== undefined)
      ? Boolean(responseMeta.has_more ?? responseMeta.hasMore)
      : products.length === (params.limit ?? 0);

  return {
    products,
    hasMore,
    total: responseMeta?.total,
  };
};

export const getProductById = async (productId: number | string) => {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }

  const payload = (await response.json()) as ApiProduct | { product?: ApiProduct; data?: ApiProduct; item?: ApiProduct } | null;
  const productRecord = Array.isArray(payload)
    ? payload[0]
    : payload && typeof payload === "object" && !("product_id" in payload)
      ? (payload.product ?? payload.data ?? payload.item ?? null)
      : payload && typeof payload === "object"
        ? payload
        : null;

  if (!productRecord || typeof productRecord !== "object") {
    throw new Error("Product not found");
  }

  return normalizeProduct(productRecord as ApiProduct);
};

export const useProducts = (refreshKey = 0) => {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    const onProductsRefresh = () => {
      setRefreshNonce((value) => value + 1);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("johnny-products-refresh", onProductsRefresh);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("johnny-products-refresh", onProductsRefresh);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch(PRODUCTS_API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = (await response.json()) as ApiProduct[];
        if (!isMounted) {
          return;
        }

        const normalized = Array.isArray(data)
          ? data.filter((item) => item.is_active !== false).map(normalizeProduct)
          : [];

        pruneStaleAdminProducts(normalized.map((item) => item.id));
        setApiProducts(normalized);
      } catch {
        if (isMounted) {
          setApiProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    load();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, refreshNonce]);

  const products = useMemo(() => {
    const adminProducts = getAdminProducts().filter((item) => item.id.startsWith("admin-"));
    const apiIds = new Set(apiProducts.map((item) => item.id));
    const preservedAdminProducts = adminProducts.filter((item) => !apiIds.has(item.id));
    return [...apiProducts, ...preservedAdminProducts];
  }, [apiProducts]);

  return { products, isLoading };
};
