import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatCurrencyINR } from "../utils/format";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const outOfStock = typeof product.quantity === "number" && product.quantity <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{product.category}</p>
        <Link to={`/products/${product.id}`} className="line-clamp-2 text-lg font-semibold text-slate-900 hover:text-emerald-700">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.shortDescription}</p>
        <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${outOfStock ? "text-rose-600" : "text-emerald-700"}`}>
          {outOfStock ? "No Stocks Available" : "In Stock"}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">{formatCurrencyINR(product.price)}</p>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            disabled={outOfStock}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {outOfStock ? "Out Of Stock" : "Add To Cart"}
          </button>
        </div>
      </div>
    </article>
  );
};
