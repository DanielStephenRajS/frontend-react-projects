import { useState } from "react";
import { Link } from "react-router-dom";
import { catalogRepository } from "../data/catalog";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { formatCurrencyINR } from "../utils/format";
import { normalizeImageUrl } from "../utils/images";

export const CartPage = () => {
  useDocumentMeta("Cart", "Review products in your Johnny Fishing Tackle shopping cart.");

  const [removalTarget, setRemovalTarget] = useState<{ productId: string; variantId?: string } | null>(null);
  const { productsInCart, total, removeFromCart, updateQuantity } = useCart();
  const store = catalogRepository.getStore();
  const whatsappNumber = (store.phone || "918667568243").replace(/\D/g, "");
  const whatsappOrderMessage = encodeURIComponent(
    [
      "Hi Johnny Fishing Tackle, I would like to place my order.",
      ...productsInCart.map(({ product, quantity, variant }) => {
        const variantInfo = variant ? ` (${variant.variant_type}: ${variant.variant_value})` : "";
        return `- ${product.name}${variantInfo} x ${quantity}`;
      }),
      "",
      `Total: ${formatCurrencyINR(total)}`,
    ].join("\n"),
  );
  const whatsappOrderUrl = `https://wa.me/${whatsappNumber}?text=${whatsappOrderMessage}`;

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
              const remainingStock = Math.max(0, displayedStock - quantity);
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
                      <p className="mt-1 text-[11px] text-slate-500">Available: {remainingStock}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-slate-300 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1), variantId)}
                        disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-slate-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextQuantity = quantity + 1;
                          if (displayedStock > 0 && nextQuantity <= displayedStock) {
                            updateQuantity(product.id, nextQuantity, variantId);
                          }
                        }}
                        disabled={displayedStock <= 0 || quantity >= displayedStock}
                        className="flex h-9 w-9 items-center justify-center text-lg font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemovalTarget({ productId: product.id, variantId })}
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-900">Cart Total</p>

              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-slate-900">{formatCurrencyINR(total)}</p>
                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Place order
                </a>
              </div>
            </div>

            <p className="mt-3 text-right text-xs text-slate-500">This order will send to Johnny Fishing Tackle via WhatsApp.</p>
          </section>
        </>
      )}

      {removalTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <p className="text-lg font-semibold text-slate-900">Remove item from cart?</p>
            <p className="mt-2 text-sm text-slate-600">This item will be deleted from your cart. Do you want to continue?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemovalTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(removalTarget.productId, removalTarget.variantId);
                  setRemovalTarget(null);
                }}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
