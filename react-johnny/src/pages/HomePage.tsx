import { Link } from "react-router-dom";
import { BrandShowcase } from "../components/BrandShowcase";
import { CategoryShowcase } from "../components/CategoryShowcase";
import { ContactSection } from "../components/ContactSection";
import { HeroBanner } from "../components/HeroBanner";
import { ProductCard } from "../components/ProductCard";
import { StoreHighlights } from "../components/StoreHighlights";
import { YouTubeSection } from "../components/YouTubeSection";
import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export const HomePage = () => {
  useDocumentMeta(
    "Home",
    "Johnny Fishing Tackle - Professional fishing tackle store for rods, reels, lures, accessories, and expert recommendations.",
  );

  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const products = catalogRepository.getProducts();
  const videos = catalogRepository.getYouTubeVideos();
  const reviews = catalogRepository.getReviews();

  return (
    <div className="space-y-10">
      <HeroBanner image="/assets/hero/fishing-hero.jpg" />

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-slate-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            Explore Catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products
            .filter((product) => product.featured)
            .slice(0, 6)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      <StoreHighlights />
      <CategoryShowcase categories={categories} />
      <BrandShowcase brands={brands} />
      <YouTubeSection videos={videos} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-slate-900">Google Reviews Preview</h2>
        <p className="mt-2 text-sm text-slate-600">Prepared section for future Google Reviews and store photo integration.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-3">
                <img src={review.avatar} alt={review.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="font-semibold text-slate-900">{review.name}</p>
                  <p className="text-xs text-amber-500">{"★".repeat(review.rating)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      <ContactSection />
    </div>
  );
};
