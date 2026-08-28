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
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950/30" />
    <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300 drop-shadow-md">Johnny Fishing Tackle</p>
      <h1 className="max-w-2xl font-display text-4xl leading-[0.95] text-white drop-shadow-[0_4px_14px_rgba(15,23,42,0.7)] md:text-6xl">
        Gear Up For Your Next Big Catch
      </h1>
      <p className="max-w-xl text-sm text-slate-100 md:text-base">
        Premium rods, reels, lures, and accessories built for serious anglers on rivers, lakes, and coastlines.
      </p>
      <div className="flex flex-wrap gap-3 pt-1">
        <Link
          to="/products"
          className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:bg-amber-200"
        >
          Shop Products
        </Link>
        <Link
          to="/youtube"
          className="rounded-full border border-white/60 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          Watch Tutorials
        </Link>
      </div>
    </div>
  </section>
);
