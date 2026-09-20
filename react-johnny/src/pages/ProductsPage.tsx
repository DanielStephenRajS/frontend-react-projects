import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { FilterBar } from "../components/FilterBar";
import { ProductCard } from "../components/ProductCard";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { getProducts } from "../hooks/useProducts";
import type { Product, ProductFilters } from "../types";
import { defaultFilters } from "../utils/products";

const PAGE_SIZE = 25;

export const ProductsPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const brandFromQuery = searchParams.get("brand") ?? "all";
  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const inFlightOffsetsRef = useRef(new Set<number>());
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  const loadProductsPage = async (nextOffset: number, resetList: boolean, nextFilters: ProductFilters) => {
    if (inFlightOffsetsRef.current.has(nextOffset)) {
      return;
    }

    inFlightOffsetsRef.current.add(nextOffset);
    const currentRequestId = ++requestIdRef.current;

    if (resetList) {
      setProducts([]);
      setOffset(0);
      setHasMore(true);
      setIsLoading(true);
      setIsLoadingMore(false);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getProducts({
        limit: PAGE_SIZE,
        offset: nextOffset,
        category: nextFilters.categorySlug !== "all" ? nextFilters.categorySlug : undefined,
        brand: nextFilters.brandSlug !== "all" ? nextFilters.brandSlug : undefined,
        search: nextFilters.search.trim() || undefined,
        sortBy: nextFilters.sortBy,
      });

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const nextProducts = response.products ?? [];
      setProducts((currentProducts) => {
        if (resetList) {
          return nextProducts;
        }

        const existingIds = new Set(currentProducts.map((item) => item.id));
        return [...currentProducts, ...nextProducts.filter((item) => !existingIds.has(item.id))];
      });

      setOffset(nextOffset + nextProducts.length);
      setHasMore(
        typeof response.hasMore === "boolean"
          ? response.hasMore
          : nextProducts.length === PAGE_SIZE,
      );
    } catch {
      if (currentRequestId === requestIdRef.current) {
        setHasMore(false);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
      inFlightOffsetsRef.current.delete(nextOffset);
    }
  };

  useEffect(() => {
    requestIdRef.current += 1;
    inFlightOffsetsRef.current.clear();
    void loadProductsPage(0, true, activeFilters);
  }, [categorySlug, brandFromQuery]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadProductsPage(offset, false, activeFilters);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [offset, hasMore, isLoading, isLoadingMore, activeFilters]);

  const handleFiltersChange = (nextFilters: ProductFilters) => {
    requestIdRef.current += 1;
    inFlightOffsetsRef.current.clear();
    setFilters(nextFilters);
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    void loadProductsPage(0, true, nextFilters);
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
