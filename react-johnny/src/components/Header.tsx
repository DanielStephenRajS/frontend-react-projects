import { NavLink } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAdmin } from "../hooks/useAdmin";
import { catalogRepository } from "../data/catalog";

interface HeaderProps {
  onOpenCategories: () => void;
}

type SocialPlatform = "Facebook" | "Instagram" | "Telegram" | "YouTube" | "WhatsApp" | "Gmail";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-3 text-sm font-semibold transition ${isActive ? "border-b-2 border-emerald-600 text-emerald-700" : "text-slate-700 hover:text-slate-900"}`;

export const Header = ({ onOpenCategories }: HeaderProps) => {
  const { itemCount } = useCart();
  const { isAdmin } = useAdmin();
  const store = catalogRepository.getStore();
  const socialLinks = [
    { label: "Facebook", href: "https://www.facebook.com/share/18saneJjyT/?mibextid=wwXIfr" },
    { label: "Instagram", href: "https://www.instagram.com/johnny_fishing_tackle?igsh=ZHAyZGlkaG5idnJ6" },
    { label: "Telegram", href: "https://t.me/johnnyfishingtackle" },
    { label: "YouTube", href: "https://youtube.com/@johnnyfishingtackle?si=lKVVK5QBaxwN4kK8" },
    { label: "WhatsApp", href: "https://wa.me/c/918667568243" },
    { label: "Gmail", href: "mailto:johnnyfishingtackle@gmail.com" },
  ] as const satisfies ReadonlyArray<{ label: SocialPlatform; href: string }>;

  const renderSocialIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case "Facebook":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
            <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.3-1.6 1.6-1.6h1.3V4.8c-.2 0-1-.1-2-.1-2.4 0-4 1.5-4 4.2V11H8v3h2.4v7h3.1z" />
          </svg>
        );
      case "Instagram":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.8A5.2 5.2 0 1 1 6.8 13 5.2 5.2 0 0 1 12 7.8zm0 2A3.2 3.2 0 1 0 15.2 13 3.2 3.2 0 0 0 12 9.8zM17.6 6.7a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z" />
          </svg>
        );
      case "Telegram":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
            <path d="M20.9 4.3 3.8 10.9c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 1.7 5.2c.2.7.1.9.9.9.6 0 .9-.3 1.2-.6l2.1-2.1 4.3 3.2c.8.4 1.3.2 1.5-.7L22.6 6c.3-1.3-.5-1.9-1.7-1.4zM9 13.5l9.6-6.1c.5-.3.9-.1.5.2L11.2 15l-.3 3.5L9 13.5z" />
          </svg>
        );
      case "YouTube":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
            <path d="M23 12s0-3.3-.4-4.8a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.4a2.5 2.5 0 0 0-1.8 1.8C1 8.7 1 12 1 12s0 3.3.4 4.8a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.5.4-4.8.4-4.8zM9.5 15.5v-7L16 12l-6.5 3.5z" />
          </svg>
        );
      case "WhatsApp":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
            <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1l-.5.7c-.1.2-.3.2-.6.1a6.5 6.5 0 0 1-1.9-1.2 7.4 7.4 0 0 1-1.4-1.8c-.1-.3 0-.4.1-.6l.3-.3.3-.4c.1-.1.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3.1 3.1 0 0 0-1 2.3c0 1.4 1 2.7 1.2 2.9.2.2 2.1 3.3 5.1 4.5 3 1.2 3 0 3.6 0 .6-.1 1.8-.7 2.1-1.4.2-.8.2-1.4.2-1.5-.1-.2-.3-.3-.5-.4z" />
          </svg>
        );
      case "Gmail":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path d="M3 6.2 12 13l9-6.8V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.2z" fill="currentColor" opacity="0.28" />
            <path d="M3 6.2 12 13l9-6.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="3" y="6" width="18" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
    }
  };

  const socialButtonClass = (platform: SocialPlatform) => {
    const baseClass =
      "flex h-10 w-10 items-center justify-center rounded-full border text-white shadow-sm transition hover:-translate-y-0.5";

    switch (platform) {
      case "Facebook":
        return `${baseClass} border-[#1877F2] bg-[#1877F2] hover:bg-[#166fe5]`;
      case "Instagram":
        return `${baseClass} border-transparent bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#515bd4] hover:brightness-110`;
      case "Telegram":
        return `${baseClass} border-[#229ED9] bg-[#229ED9] hover:bg-[#1c8ec3]`;
      case "YouTube":
        return `${baseClass} border-[#FF0000] bg-[#FF0000] hover:bg-[#e50000]`;
      case "WhatsApp":
        return `${baseClass} border-[#25D366] bg-[#25D366] hover:bg-[#1fb357]`;
      case "Gmail":
        return `${baseClass} border-[#EA4335] bg-white text-[#EA4335] hover:bg-[#fff4f3]`;
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      {/* Logo + title + social icons row */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 sm:flex-1">
            <button
              type="button"
              onClick={onOpenCategories}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-700 lg:hidden hover:bg-slate-50"
            >
              Categories
            </button>

            <NavLink to="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <img
                src={store.logoUrl}
                alt="Johnny Fishing Tackle logo"
                className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-sm sm:h-12 sm:w-12"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold leading-tight text-slate-900 sm:text-2xl">
                  Johnny Fishing Tackles
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                  johnnyfishingtackles.com
                </p>
              </div>
            </NavLink>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className={`${socialButtonClass(social.label)} h-8 w-8 sm:h-10 sm:w-10`}
                >
                  {renderSocialIcon(social.label)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-2 sm:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 md:flex md:gap-2">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navClass}>
              Categories
            </NavLink>
            <NavLink to="/brands" className={navClass}>
              Brands
            </NavLink>
            <NavLink to="/youtube" className={navClass}>
              YouTube
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              Contact
            </NavLink>
            <NavLink to="/cart" className={navClass}>
              Cart ({itemCount})
            </NavLink>
            {isAdmin ? (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
};
