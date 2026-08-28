import { useEffect, useMemo, useState } from "react";
import { getAdminProducts, pruneStaleAdminProducts } from "../data/admin-products";
import { normalizeImageUrl } from "../utils/images";
import type { Product } from "../types";

const PRODUCTS_API_URL = "http://127.0.0.1:8000/api/products";

interface ApiProductImage {
  image_url?: string | null;
  image_data?: string | null;
  image_content_type?: string | null;
  sort_order?: number;
  is_primary?: boolean;
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

  const items = raw
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
};

const parseSpecifications = (raw: string | null | undefined): Record<string, string> => {
  if (!raw) {
    return {};
  }

  return raw
    .split(";")
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
  };
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
