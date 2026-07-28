import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { FilterBar } from "../components/FilterBar";
import { ProductCard } from "../components/ProductCard";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { applyProductFilters, defaultFilters } from "../utils/products";

export const ProductsPage = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const brandFromQuery = searchParams.get("brand") ?? "all";
  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const products = catalogRepository.getProducts();

  const [filters, setFilters] = useState({
    ...defaultFilters,
    categorySlug: categorySlug ?? "all",
    brandSlug: brandFromQuery,
  });

  useDocumentMeta("Products", "Browse rods, reels, lures, accessories, and more from Johnny Fishing Tackle.");

  const visibleProducts = useMemo(
    () =>
      applyProductFilters(products, {
        ...filters,
        categorySlug: categorySlug ?? filters.categorySlug,
        brandSlug: brandFromQuery !== "all" ? brandFromQuery : filters.brandSlug,
      }),
    [products, filters, categorySlug, brandFromQuery],
  );

  const selectedCategory = categories.find((category) => category.slug === (categorySlug ?? filters.categorySlug));

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl text-slate-900">
          {selectedCategory ? selectedCategory.name : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Search, filter, and sort across all product lines from our static catalog feed.
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
        onChange={(next) => setFilters(next)}
      />

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
    </div>
  );
};
