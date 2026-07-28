import { NavLink } from "react-router-dom";
import type { Category } from "../types";

interface CategorySidebarProps {
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-3 py-2 text-sm transition ${
    isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export const CategorySidebar = ({ categories, open, onClose }: CategorySidebarProps) => (
  <>
    {open ? (
      <button
        type="button"
        aria-label="Close categories"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 lg:hidden"
      />
    ) : null}

    <aside
      className={`fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 lg:sticky lg:top-[88px] lg:z-10 lg:h-[calc(100vh-88px)] lg:w-auto lg:min-w-[250px] lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h2 className="font-display text-2xl text-slate-900">Categories</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-300 px-3 py-1 text-sm"
        >
          Close
        </button>
      </div>

      <h2 className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 lg:block">
        Shop By Category
      </h2>
      <nav className="space-y-1">
        <NavLink to="/products" end className={navClass} onClick={onClose}>
          All Products
        </NavLink>
        {categories.map((category) => (
          <NavLink
            key={category.id}
            to={`/categories/${category.slug}`}
            className={navClass}
            onClick={onClose}
          >
            {category.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
);
