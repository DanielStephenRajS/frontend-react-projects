import type { Brand, Category, ProductFilters } from "../types";

interface FilterBarProps {
  filters: ProductFilters;
  categories: Category[];
  brands: Brand[];
  onChange: (next: ProductFilters) => void;
}

export const FilterBar = ({ filters, categories, brands, onChange }: FilterBarProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input
        type="search"
        placeholder="Search products"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
      />

      <select
        value={filters.categorySlug}
        onChange={(event) => onChange({ ...filters, categorySlug: event.target.value })}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={filters.brandSlug}
        onChange={(event) => onChange({ ...filters, brandSlug: event.target.value })}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
      >
        <option value="all">All Brands</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.slug}>
            {brand.name}
          </option>
        ))}
      </select>

      <select
        value={filters.sortBy}
        onChange={(event) => onChange({ ...filters, sortBy: event.target.value as ProductFilters["sortBy"] })}
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-300 focus:ring"
      >
        <option value="name-asc">Name A-Z</option>
        <option value="price-asc">Price Low to High</option>
        <option value="price-desc">Price High to Low</option>
      </select>
    </div>
  </section>
);
