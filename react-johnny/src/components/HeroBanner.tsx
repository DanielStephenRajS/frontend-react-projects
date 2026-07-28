import { Link } from "react-router-dom";

interface HeroBannerProps {
  image: string;
}

export const HeroBanner = ({ image }: HeroBannerProps) => (
  <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-xl">
    <img
      src={image}
      alt="Fishing tackle hero"
      loading="eager"
      className="h-[340px] w-full object-cover opacity-45 md:h-[420px]"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
    <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 sm:p-10">
      <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Johnny Fishing Tackle</p>
      <h1 className="max-w-2xl font-display text-4xl leading-tight md:text-6xl">
        Gear Up For Your Next Big Catch
      </h1>
      <p className="max-w-xl text-sm text-slate-200 md:text-base">
        Premium rods, reels, lures, and accessories curated for freshwater and saltwater anglers.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/products"
          className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
        >
          Shop Products
        </Link>
        <Link
          to="/youtube"
          className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Watch Tutorials
        </Link>
      </div>
    </div>
  </section>
);
