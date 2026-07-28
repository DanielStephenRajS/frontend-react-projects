import { Link } from "react-router-dom";
import type { Brand } from "../types";

interface BrandShowcaseProps {
  brands: Brand[];
}

export const BrandShowcase = ({ brands }: BrandShowcaseProps) => (
  <section className="space-y-4">
    <div className="flex items-end justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Featured Brands</p>
        <h2 className="font-display text-3xl text-slate-900">Brands You Trust</h2>
        <p className="mt-1 text-sm text-slate-600">Authorized wholesale and retail fishing brands curated for quality and reliability.</p>
      </div>
      <Link to="/brands" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
        View All Brands
      </Link>
    </div>

    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
      {brands.map((brand) => {
        const bannerImage = brand.bannerImage;

        return (
          <article
            key={brand.id}
            className="min-w-[300px] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-w-[360px]"
          >
            <img
              src={bannerImage}
              alt={`${brand.name} brand banner`}
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
                <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" className="h-12 w-12 rounded-full border border-slate-200 bg-white object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{brand.name}</h3>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Authorized Dealer</p>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-slate-600">{brand.intro}</p>
              <Link
                to={`/brands/${brand.slug}`}
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-slate-700"
              >
                Explore Brand
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);
