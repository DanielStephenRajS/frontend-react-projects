import { Link, Navigate, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export const BrandDetailsPage = () => {
  const { brandSlug } = useParams();
  const brands = catalogRepository.getBrands();
  const products = catalogRepository.getProducts();

  const brand = brands.find((item) => item.slug === brandSlug);

  useDocumentMeta(
    brand ? `${brand.name} Brand` : "Brand Details",
    brand ? `Explore ${brand.name} product categories, background, and featured products at Johnny Fishing Tackle.` : "Brand details page.",
  );

  if (!brand) {
    return <Navigate to="/brands" replace />;
  }

  const featuredProducts =
    brand.featuredProductIds?.length
      ? brand.featuredProductIds
          .map((productId) => products.find((product) => product.id === productId))
          .filter((product): product is (typeof products)[number] => Boolean(product))
      : products.filter((product) => product.brandSlug === brand.slug).slice(0, 6);

  const brandProducts = products.filter((product) => product.brandSlug === brand.slug);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-56 sm:h-72">
          <img
            src={brand.bannerImage}
            alt={`${brand.name} banner`}
            className="h-full w-full object-cover"
            onError={(event) => {
              if (brand.bannerFallbackImage) {
                event.currentTarget.src = brand.bannerFallbackImage;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="absolute left-5 bottom-5 flex items-center gap-4">
            <img src={brand.logo} alt={`${brand.name} logo`} className="h-14 w-14 rounded-full border border-white/70 bg-white object-cover" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">Authorized Brand Partner</p>
              <h1 className="font-display text-4xl text-white">{brand.name}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Brand History</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{brand.history ?? brand.description}</p>
          <h3 className="mt-6 text-lg font-semibold text-slate-900">About {brand.name}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">{brand.intro}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {brand.categories.map((category) => (
              <span key={category} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                {category}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Product Categories</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {brand.categories.map((category) => (
              <li key={category} className="rounded-lg bg-slate-50 px-3 py-2">
                {category}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex gap-2">
            <Link
              to={`/products?brand=${brand.slug}`}
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-emerald-700"
            >
              View Products
            </Link>
            {brand.websiteUrl ? (
              <a
                href={brand.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50"
              >
                Brand Website
              </a>
            ) : null}
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-slate-500">
            Dealer and distributor info can be added here in future updates.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="font-display text-3xl text-slate-900">Featured Products</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Brand-specific lineup</p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            Featured products for {brand.name} will be published soon. The data structure is ready for quick JSON updates.
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-slate-900">All {brand.name} Products</h2>
        {brandProducts.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            No products are currently tagged to {brand.name}. Add products in JSON with brandSlug "{brand.slug}" to populate this section.
          </div>
        )}
      </section>
    </div>
  );
};
