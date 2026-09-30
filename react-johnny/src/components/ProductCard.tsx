import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatCurrencyINR } from "../utils/format";
import { normalizeImageUrl } from "../utils/images";
import type { Product } from "../types";

const getButtonLabel = (hasVariants: boolean, outOfStock: boolean) => {
  if (hasVariants) {
    return "Choose Option";
  }

  if (outOfStock) {
    return "Out Of Stock";
  }

  return "Add To Cart";
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const activeVariants = (product.variants ?? []).filter((variant) => variant.is_active !== false);
  const hasVariants = activeVariants.length > 0;
  const displayedStock = hasVariants
    ? activeVariants.reduce((maxStock, variant) => Math.max(maxStock, Number(variant.stock ?? 0)), 0)
    : Number(product.quantity ?? 0);
  const displayedPrice = hasVariants
    ? (activeVariants[0]?.price_inr ?? product.price)
    : product.price;
  const outOfStock = displayedStock <= 0;
  const buttonLabel = getButtonLabel(hasVariants, outOfStock);
  const actionButtonClass =
    "inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300";

  const primaryImage = normalizeImageUrl(product.images[0]);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.id}`} className="block">
        <img
          src={primaryImage}
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
          <p className="text-lg font-bold text-slate-900">{formatCurrencyINR(displayedPrice)}</p>
          {hasVariants ? (
            <button type="button" onClick={() => navigate(`/products/${product.id}`)} className={actionButtonClass}>
              {buttonLabel}
            </button>
          ) : (
            <button type="button" onClick={() => addToCart(product.id)} disabled={outOfStock} className={actionButtonClass}>
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
