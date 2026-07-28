import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <h1 className="font-display text-5xl text-slate-900">404</h1>
    <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
      Go Home
    </Link>
  </section>
);
