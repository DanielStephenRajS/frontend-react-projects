import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { FilterBar } from "../components/FilterBar";
import { ProductCard } from "../components/ProductCard";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getProducts } from "../hooks/useProducts";
import type { Product, ProductFilters } from "../types";
import { defaultFilters } from "../utils/products";

const PAGE_SIZE = 10;

const dedupeProductsById = (items: Product[]) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

export const ProductsPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const brandFromQuery = searchParams.get("brand") ?? "all";
  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const requestVersionRef = useRef(0);

  const [filters, setFilters] = useState<ProductFilters>({
    ...defaultFilters,
    categorySlug: categorySlug ?? "all",
    brandSlug: brandFromQuery,
  });

  const activeFilters = useMemo(
    () => ({
      ...filters,
      categorySlug: categorySlug ?? filters.categorySlug,
      brandSlug: brandFromQuery !== "all" ? brandFromQuery : filters.brandSlug,
    }),
    [filters, categorySlug, brandFromQuery],
  );

  const loadProductsPage = useCallback(
    async (requestedOffset: number, resetList: boolean, nextFilters: ProductFilters) => {
      if (!resetList && !hasMoreRef.current) {
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      setIsLoading(true);

      if (resetList) {
        setProducts([]);
        setOffset(0);
        offsetRef.current = 0;
        setHasMore(true);
        hasMoreRef.current = true;
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(true);
      }

      const backendSort =
        nextFilters.sortBy === "price-asc"
          ? "price_asc"
          : nextFilters.sortBy === "price-desc"
            ? "price_desc"
            : "name_asc";

      try {
        const response = await getProducts({
          limit: PAGE_SIZE,
          offset: requestedOffset,
          category: nextFilters.categorySlug !== "all" ? nextFilters.categorySlug : undefined,
          brand: nextFilters.brandSlug !== "all" ? nextFilters.brandSlug : undefined,
          search: nextFilters.search.trim() || undefined,
          sort: backendSort,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const newProducts = dedupeProductsById(response.products ?? []);

        setProducts((currentProducts) => {
          const existingIds = new Set(currentProducts.map((item) => item.id));
          const uniqueNewProducts = newProducts.filter((product) => !existingIds.has(product.id));
          const mergedProducts = resetList ? newProducts : [...currentProducts, ...uniqueNewProducts];
          const nextOffset = mergedProducts.length;

          setOffset(nextOffset);
          offsetRef.current = nextOffset;

          const nextHasMore = Boolean(response.hasMore);
          setHasMore(nextHasMore);
          hasMoreRef.current = nextHasMore;

          return mergedProducts;
        });
      } catch {
        if (requestVersion === requestVersionRef.current) {
          setHasMore(false);
          hasMoreRef.current = false;
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    setProducts([]);
    setOffset(0);
    offsetRef.current = 0;
    setHasMore(true);
    hasMoreRef.current = true;
    void loadProductsPage(0, true, activeFilters);
  }, [categorySlug, brandFromQuery, filters.categorySlug, filters.brandSlug, filters.sortBy, filters.search, loadProductsPage, activeFilters]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isLoading || !hasMoreRef.current) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading && hasMoreRef.current) {
          const nextOffset = offsetRef.current;
          void loadProductsPage(nextOffset, false, activeFilters);
        }
      },
      { rootMargin: "260px 0px" },
    );

    observerRef.current = observer;
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (observerRef.current === observer) {
        observerRef.current = null;
      }
    };
  }, [offset, hasMore, isLoading, activeFilters, loadProductsPage]);

  const handleFiltersChange = (nextFilters: ProductFilters) => {
    setFilters(nextFilters);
  };

  useDocumentMeta("Products", "Browse rods, reels, lures, accessories, and more from Johnny Fishing Tackle.");

  const visibleProducts = useMemo(() => products, [products]);

  const selectedCategory =
    categories.find((category) => category.slug === (categorySlug ?? filters.categorySlug)) ??
    categories.find((category) => category.subcategories?.some((subcategory) => subcategory.slug === (categorySlug ?? filters.categorySlug)));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl text-slate-900">
          {selectedCategory ? selectedCategory.name : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search, filter, and sort across all product lines from our live catalog feed.
        </p>
      </section>

      <FilterBar
        filters={{
          ...filters,
          categorySlug: categorySlug ?? filters.categorySlug,
          brandSlug: brandFromQuery !== "all" ? brandFromQuery : filters.brandSlug,
        }}
        categories={categories}
        brands={brands}
        onChange={handleFiltersChange}
      />

      {isLoading && products.length === 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`product-loading-${index}`} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-52 w-full bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-20 rounded bg-slate-200" />
                  <div className="h-9 w-24 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>

          {visibleProducts.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No products match your filters.
            </section>
          ) : null}

          {isLoadingMore ? (
            <div className="py-4 text-center text-sm text-slate-500">Loading more products...</div>
          ) : null}

          {hasMore && !isLoadingMore ? <div ref={sentinelRef} className="py-4" /> : null}
        </>
      )}
    </div>
  );
};
