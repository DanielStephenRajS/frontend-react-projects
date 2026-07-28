import { catalogRepository } from "../data/catalog";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

interface StoreLocation {
  id: string;
  storeName: string;
  cityLabel: string;
  address: string;
  phone: string;
  businessHours: string[];
  mapsUrl: string;
  mapEmbedUrl: string;
  image: string;
}

export const ContactPage = () => {
  useDocumentMeta(
    "Contact & Store Locations",
    "Find Johnny Fishing Tackles stores in Chennai and Pondicherry with direct Google Maps navigation and contact details.",
  );

  const store = catalogRepository.getStore();
  const locations: StoreLocation[] = [
    {
      id: "chennai",
      storeName: "Johnny Fishing Tackle - Chennai",
      cityLabel: "Main Store",
      address: "Ambattur, Chennai, Tamil Nadu",
      phone: "+91 86675 68243",
      businessHours: ["Mon - Sat: 9:00 AM to 8:00 PM", "Sunday: 10:00 AM to 6:00 PM"],
      mapsUrl: "https://maps.app.goo.gl/EbW2WwwopGWftxRg9",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0!2d80.1648!3d13.1143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526f2c5b5b5b5b%3A0x0!2sAmbattur%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
      image: "/assets/location/chennai.jpg",
    },
    {
      id: "pondicherry",
      storeName: "Johnny Fishing Tackle - Pondicherry",
      cityLabel: "Branch Store",
      address: "Pondicherry",
      phone: "+91 86675 68243",
      businessHours: ["Mon - Sat: 9:30 AM to 8:00 PM", "Sunday: 10:30 AM to 6:00 PM"],
      mapsUrl: "https://maps.app.goo.gl/YSrVri1J1hp1TJP58",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0!2d79.8083!3d11.9416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5361d883f19d21%3A0x0!2sPondicherry!5e0!3m2!1sen!2sin!4v1700000000001!5m2!1sen!2sin",
      image: "/assets/location/pondicherry.jpg",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl p-6 shadow-md sm:p-8" style={{background: "linear-gradient(135deg, #1e3a5f 0%, #1a56a0 45%, #0e7490 100%)"}}>
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Contact & Store Locations</p>
          <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Visit Johnny Fishing Tackles</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base">
            Explore our Chennai main store and Pondicherry branch. Tap any location card, map preview, or direction button to open Google Maps instantly.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-3xl text-slate-900">Our Locations</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Direct Google Maps Access</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {locations.map((location) => (
            <article
              key={location.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_-18px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.55)]"
            >
              <div className="relative h-52 overflow-hidden sm:h-56">
                <img
                  src={location.image}
                  alt={`${location.storeName} storefront`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-full border border-white/60 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                  {location.cityLabel}
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{location.storeName}</h3>
                    <p className="mt-1 text-sm text-slate-600">Tap card to open in Google Maps</p>
                  </div>
                  <div className="rounded-full bg-cyan-50 p-2 text-cyan-700" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 6.2 12.1 6.5 12.4a.7.7 0 0 0 1 0C12.8 21.1 19 14.2 19 9a7 7 0 0 0-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-700" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M12 2a7 7 0 0 0-7 7c0 5.2 6.2 12.1 6.5 12.4a.7.7 0 0 0 1 0C12.8 21.1 19 14.2 19 9a7 7 0 0 0-7-7zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                      </svg>
                    </span>
                    {location.address}
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5 text-cyan-700" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M6.6 10.8c1.3 2.6 3.5 4.8 6.1 6.1l2-2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.8c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1l-2.5 2.3z" />
                      </svg>
                    </span>
                    {location.phone}
                  </p>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-amber-600" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M12 1.8A10.2 10.2 0 1 0 22.2 12 10.2 10.2 0 0 0 12 1.8zm.9 5.4v5l4 2.4-.9 1.5-5-3V7.2z" />
                      </svg>
                    </span>
                    <div>
                      {location.businessHours.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group/map block rounded-2xl border border-slate-200 bg-white p-2 transition hover:border-blue-300"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <iframe
                      title={`${location.storeName} map preview`}
                      src={location.mapEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-52 w-full border-0 sm:h-56"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />
                    <div className="absolute left-3 bottom-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                      {location.storeName}
                    </div>
                  </div>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <h3 className="text-base font-semibold text-slate-900">Phone Support</h3>
          <p className="mt-2 text-sm text-slate-600">Talk to our team for stock updates, tackle recommendations, and bulk orders.</p>
          <p className="mt-3 text-sm font-medium text-slate-800">{store.phone}</p>
          <p className="text-sm font-medium text-slate-800">+91 86675 68243</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <h3 className="text-base font-semibold text-slate-900">Email & Digital</h3>
          <p className="mt-2 text-sm text-slate-600">Email placeholder and digital contact channels for future support integrations.</p>
          <p className="mt-3 text-sm font-medium text-slate-800">johnnyfishingtackle@gmail.com</p>
          <p className="text-sm text-slate-600">Contact form and live chat coming soon.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <h3 className="text-base font-semibold text-slate-900">Business Hours</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            {store.businessHours.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-4 border-t border-dashed border-slate-200 pt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            WhatsApp / Contact Form / Live Chat Ready
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:col-span-3">
          <h3 className="text-base font-semibold text-slate-900">Social Media</h3>
          <p className="mt-2 text-sm text-slate-600">Follow us for live stock arrivals, weekend catch updates, and new tackle announcements.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
            <a href="https://instagram.com/johnnyfishingtackle?igshid=" target="_blank" rel="noreferrer" className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">Instagram</a>
            <a href="https://www.facebook.com/share/18saneJjyT/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Facebook</a>
            <a href="https://t.me/johnnyfishingtackle" target="_blank" rel="noreferrer" className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">Telegram</a>
            <a href="https://youtube.com/@johnnyfishingtackle?si=lKVVK5QBaxwN4kK8" target="_blank" rel="noreferrer" className="rounded-full bg-red-50 px-3 py-1 text-red-700">YouTube</a>
            <a href="https://wa.me/c/918667568243" target="_blank" rel="noreferrer" className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">WhatsApp</a>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Live Chat (Coming Soon)</span>
          </div>
        </article>
      </section>
    </div>
  );
};
