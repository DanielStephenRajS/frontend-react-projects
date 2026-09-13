import { catalogRepository } from "../data/catalog";
import type { Product, ProductFilters } from "../types";

const getCategoryMatchSlugs = (categorySlug: string): string[] => {
  const categories = catalogRepository.getCategories();

  if (!categorySlug || categorySlug === "all") {
    return ["all"];
  }

  const matchingParent = categories.find((category) => category.slug === categorySlug);
  if (matchingParent && matchingParent.subcategories?.length) {
    return [matchingParent.slug, ...matchingParent.subcategories.map((subcategory) => subcategory.slug)];
  }

  const matchingSubcategory = categories.find((category) => category.subcategories?.some((subcategory) => subcategory.slug === categorySlug));
  if (matchingSubcategory) {
    return [categorySlug];
  }

  return [categorySlug];
};

export const defaultFilters: ProductFilters = {
  search: "",
  categorySlug: "all",
  brandSlug: "all",
  sortBy: "name-asc",
};

export const sortProducts = (products: Product[], sortBy: ProductFilters["sortBy"]): Product[] => {
  const clone = [...products];

  if (sortBy === "price-asc") {
    return clone.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "price-desc") {
    return clone.sort((a, b) => b.price - a.price);
  }

  return clone.sort((a, b) => a.name.localeCompare(b.name));
};

export const applyProductFilters = (products: Product[], filters: ProductFilters): Product[] => {
  const searchNormalized = filters.search.trim().toLowerCase();

  return sortProducts(
    products.filter((product) => {
      const matchesSearch =
        searchNormalized.length === 0 ||
        product.name.toLowerCase().includes(searchNormalized) ||
        product.description.toLowerCase().includes(searchNormalized);

      const matchesCategory =
        filters.categorySlug === "all" || getCategoryMatchSlugs(filters.categorySlug).includes(product.categorySlug);

      const matchesBrand =
        filters.brandSlug === "all" || product.brandSlug === filters.brandSlug;

      return matchesSearch && matchesCategory && matchesBrand;
    }),
    filters.sortBy,
  );
};

export const getRelatedProducts = (products: Product[], product: Product): Product[] =>
  products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categorySlug === product.categorySlug || item.brandSlug === product.brandSlug),
    )
    .slice(0, 4);
