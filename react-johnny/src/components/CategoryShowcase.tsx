import { Link } from "react-router-dom";
import type { Category } from "../types";

interface CategoryShowcaseProps {
  categories: Category[];
}

export const CategoryShowcase = ({ categories }: CategoryShowcaseProps) => (
  <section>
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-display text-3xl text-slate-900">Explore Categories</h2>
      <Link to="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
        View All
      </Link>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/categories/${category.slug}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{category.description}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);
