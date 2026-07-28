import { Link } from "react-router-dom";
import { catalogRepository } from "../data/catalog";

export const ContactSection = () => {
  const store = catalogRepository.getStore();

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100">
      <h2 className="font-display text-3xl text-white">Visit Our Store</h2>
      <p className="mt-2 text-sm text-slate-300">Talk to our team for local water, rig, and tackle recommendations.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Address</p>
          {store.addressLines.map((line) => (
            <p key={line} className="text-sm text-slate-200">
              {line}
            </p>
          ))}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-amber-200">Business Hours</p>
          {store.businessHours.map((line) => (
            <p key={line} className="text-sm text-slate-200">
              {line}
            </p>
          ))}
          <p className="mt-2 text-sm text-slate-100">Phone: {store.phone}</p>
        </div>
      </div>
      <Link
        to="/contact"
        className="mt-5 inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
      >
        Open Contact Page
      </Link>
    </section>
  );
};
