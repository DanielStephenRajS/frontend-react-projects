import { useState } from "react";
import { NavLink } from "react-router-dom";
import type { Category } from "../types";

interface CategorySidebarProps {
  categories: Category[];
  open: boolean;
  onClose: () => void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  `block flex-1 rounded-xl px-3 py-2 text-sm transition ${
    isActive ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

const subNavClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm transition ${
    isActive ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
  }`;

export const CategorySidebar = ({ categories, open, onClose }: CategorySidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCategory = (categorySlug: string) => {
    setExpanded((current) => ({
      ...current,
      [categorySlug]: !current[categorySlug],
    }));
  };

  return (
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

          {categories.map((category) => {
            const hasChildren = Boolean(category.subcategories?.length);
            const isExpanded = Boolean(expanded[category.slug]);

            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center gap-2 rounded-xl border border-transparent bg-transparent">
                  <NavLink
                    to={`/categories/${category.slug}`}
                    className={navClass}
                    onClick={onClose}
                  >
                    {category.name}
                  </NavLink>

                  {hasChildren ? (
                    <button
                      type="button"
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
                      aria-expanded={isExpanded}
                      onClick={() => toggleCategory(category.slug)}
                      className="group flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-3.5 w-3.5 transition-all duration-200 ease-out ${
                          isExpanded ? "translate-x-0.5 rotate-90" : "rotate-0"
                        }`}
                        aria-hidden="true"
                      >
                        <path d="M7.25 4.75 12.5 10l-5.25 5.25" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {hasChildren && isExpanded ? (
                  <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                    {category.subcategories?.map((subcategory) => (
                      <NavLink
                        key={subcategory.slug}
                        to={`/categories/${subcategory.slug}`}
                        className={subNavClass}
                        onClick={onClose}
                      >
                        {subcategory.name}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
