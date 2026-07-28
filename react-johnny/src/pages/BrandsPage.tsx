import { Link } from "react-router-dom";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export const BrandsPage = () => {
  useDocumentMeta("Brands", "Discover fishing tackle brands available at Johnny Fishing Tackle.");

  const brands = catalogRepository.getBrands();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-4xl text-slate-900">Our Brands</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Johnny Fishing Tackle is an authorized dealer and wholesaler for premium fishing brands. Explore brand histories,
          categories, and product lines in a fully data-driven catalog.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-3xl text-slate-900">All Brands</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dealer & Distribution Ready</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <article
              key={brand.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <img
                src={brand.bannerImage}
                alt={`${brand.name} banner`}
                loading="lazy"
                className="h-40 w-full object-cover"
                onError={(event) => {
                  if (brand.bannerFallbackImage) {
                    event.currentTarget.src = brand.bannerFallbackImage;
                  }
                }}
              />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    loading="lazy"
                    className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover"
                  />
                  <h3 className="text-lg font-semibold text-slate-900">{brand.name}</h3>
                </div>
                <p className="line-clamp-3 text-sm text-slate-600">{brand.description}</p>
                <div className="flex flex-wrap gap-2">
                  {brand.categories.slice(0, 3).map((category) => (
                    <span key={category} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/brands/${brand.slug}`}
                    className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-emerald-700"
                  >
                    View Brand
                  </Link>
                  <Link
                    to={`/products?brand=${brand.slug}`}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50"
                  >
                    View Products
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
