import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { formatCurrencyINR } from "../utils/format";

export const CartPage = () => {
  useDocumentMeta("Cart", "Review products in your Johnny Fishing Tackle shopping cart.");

  const { productsInCart, total, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl text-slate-900">Your Cart</h1>
        <p className="mt-1 text-sm text-slate-600">Cart state is persisted in local storage for future checkout integration.</p>
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
            {productsInCart.map(({ product, quantity }) => (
              <article
                key={product.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
              >
                <img src={product.images[0]} alt={product.name} className="h-24 w-full rounded-xl object-cover" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-600">{product.category}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrencyINR(product.price)}</p>
                  {typeof product.quantity === "number" ? (
                    <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.08em] ${product.quantity <= 0 ? "text-rose-600" : "text-slate-500"}`}>
                      {product.quantity <= 0 ? "No Stocks Available" : `Available: ${product.quantity}`}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={typeof product.quantity === "number" ? product.quantity : undefined}
                    value={quantity}
                    onChange={(event) => updateQuantity(product.id, Number(event.target.value))}
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
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
