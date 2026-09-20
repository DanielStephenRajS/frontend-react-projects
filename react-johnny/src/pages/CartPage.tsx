import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { formatCurrencyINR } from "../utils/format";
import { normalizeImageUrl } from "../utils/images";

export const CartPage = () => {
  useDocumentMeta("Cart", "Review products in your Johnny Fishing Tackle shopping cart.");

  const { productsInCart, total, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl text-slate-900">Your Cart</h1>
      </section>

      {productsInCart.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">Your cart is currently empty.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Browse Products
          </Link>
        </section>
      ) : (
        <>
          <section className="space-y-3">
            {productsInCart.map(({ product, quantity, variant }) => {
              const variantId = variant ? String(variant.variant_id ?? `${variant.variant_type}-${variant.variant_value}`) : undefined;
              const hasVariant = Boolean(variant);
              const displayedStock = hasVariant
                ? Number(variant?.stock ?? product.quantity ?? 0)
                : Number(product.quantity ?? 0);
              const isOutOfStock = displayedStock <= 0;

              return (
                <article
                  key={`${product.id}-${variantId ?? "base"}`}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
                >
                  <img src={normalizeImageUrl(product.images[0])} alt={product.name} className="h-24 w-full rounded-xl object-cover" />
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.category}</p>
                    {variant ? (
                      <p className="mt-1 text-sm font-medium text-emerald-700">
                        {variant.variant_type}: {variant.variant_value}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrencyINR(variant?.price_inr ?? product.price)}</p>
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.08em] ${isOutOfStock ? "text-rose-600" : "text-emerald-700"}`}>
                      {isOutOfStock ? "No Stocks Available" : "In Stock"}
                    </p>
                    {!isOutOfStock ? (
                      <p className="mt-1 text-[11px] text-slate-500">Available: {displayedStock}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={displayedStock > 0 ? displayedStock : 1}
                      value={quantity}
                      onChange={(event) => updateQuantity(product.id, Number(event.target.value), variantId)}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id, variantId)}
                      className="text-sm font-semibold text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900">Cart Total</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrencyINR(total)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">Checkout will be added in a future integration phase.</p>
          </section>
        </>
      )}
    </div>
  );
};
