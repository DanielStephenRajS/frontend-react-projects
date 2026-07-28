import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { catalogRepository } from "../data/catalog";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { formatCurrencyINR } from "../utils/format";
import { getRelatedProducts } from "../utils/products";

export const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const products = catalogRepository.getProducts();

  const product = products.find((item) => item.id === productId);
  const [activeImage, setActiveImage] = useState(product?.images[0]);
  const metaTitle = product ? product.name : "Product";
  const metaDescription = product
    ? product.description
    : "Explore premium fishing tackle products at Johnny Fishing Tackle.";

  useDocumentMeta(metaTitle, metaDescription);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const related = getRelatedProducts(products, product);
  const outOfStock = typeof product.quantity === "number" && product.quantity <= 0;
  const keyFeatures =
    product.keyFeatures && product.keyFeatures.length > 0
      ? product.keyFeatures
      : Object.entries(product.specifications)
          .slice(0, 4)
          .map(([key, value]) => `${key}: ${value}`);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <img
            src={activeImage}
            alt={product.name}
            className="h-[360px] w-full rounded-2xl border border-slate-200 object-cover md:h-[440px]"
          />
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((image) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`overflow-hidden rounded-xl border ${
                  activeImage === image ? "border-emerald-600" : "border-slate-200"
                }`}
              >
                <img src={image} alt={product.name} loading="lazy" className="h-24 w-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl text-slate-900">{product.name}</h1>
          <p className="mt-3 text-sm text-slate-600">{product.description}</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{formatCurrencyINR(product.price)}</p>
          <p className="mt-2 text-sm text-slate-500">Brand: {product.brand}</p>
          <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.1em] ${outOfStock ? "text-rose-600" : "text-emerald-700"}`}>
            {outOfStock ? "No Stocks Available" : "In Stock"}
          </p>

          <button
            type="button"
            onClick={() => addToCart(product.id)}
            disabled={outOfStock}
            className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {outOfStock ? "Out Of Stock" : "Add To Cart"}
          </button>

          <h2 className="mt-6 text-lg font-semibold text-slate-900">Key Features</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {keyFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-lg font-semibold text-slate-900">Specifications</h2>
          <dl className="mt-2 space-y-2 text-sm">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2 border-b border-slate-100 py-1.5">
                <dt className="text-slate-600">{key}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Payment Options</h2>
            <p className="mt-1 text-sm text-slate-600">Secure checkout with Razorpay and flexible EMI plans.</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              <li>Razorpay: UPI, cards, netbanking, wallets</li>
              <li>EMI plans: 3, 6, 9, and 12 months (bank eligibility applies)</li>
              <li>No-cost EMI options available on selected products</li>
            </ul>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl text-slate-900">Related Products</h2>
          <Link to="/products" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            View Catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
};
