import { Link } from "react-router-dom";
import { catalogRepository } from "../data/catalog";

export const Footer = () => {
  const store = catalogRepository.getStore();
  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/johnny_fishing_tackle?igsh=ZHAyZGlkaG5idnJ6" },
    { label: "Facebook", href: "https://www.facebook.com/share/18saneJjyT/?mibextid=wwXIfr" },
    { label: "Telegram", href: "https://t.me/johnnyfishingtackle" },
    { label: "YouTube", href: "https://youtube.com/@johnnyfishingtackle?si=lKVVK5QBaxwN4kK8" },
    { label: "WhatsApp", href: "https://wa.me/c/918667568243" },
    { label: "Gmail", href: "mailto:johnnyfishingtackle@gmail.com" },
  ];

  return (
    <footer className="mt-14 border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl text-white">{store.storeName}</h3>
          <p className="mt-3 text-sm text-slate-300">Professional fishing tackle for every water condition.</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-amber-300">{store.domain}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Contact</h4>
          <p className="mt-3 text-sm">{store.phone}</p>
          <div className="mt-3 text-sm leading-relaxed text-slate-300">
            {store.addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/products" className="hover:text-white">Products</Link>
            </li>
            <li>
              <Link to="/brands" className="hover:text-white">Brands</Link>
            </li>
            <li>
              <Link to="/youtube" className="hover:text-white">YouTube</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">Social Media</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer" className="hover:text-white">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
