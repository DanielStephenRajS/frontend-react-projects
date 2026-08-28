import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { deleteProduct, removeAdminProduct } from "../data/admin-products";
import { ProductCard } from "../components/ProductCard";
import { useAdmin } from "../hooks/useAdmin";
import { useCart } from "../hooks/useCart";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useProducts } from "../hooks/useProducts";
import { formatCurrencyINR } from "../utils/format";
import { normalizeImageUrl } from "../utils/images";
import { getRelatedProducts } from "../utils/products";

export const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAdmin();
  const { products, isLoading } = useProducts();

  const product = products.find((item) => item.id === productId);
  const normalizedActiveImage = normalizeImageUrl(product?.images[0]);
  const [activeImage, setActiveImage] = useState<string | undefined>(normalizedActiveImage);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const metaTitle = product ? product.name : "Product";
  const metaDescription = product
    ? product.description
    : "Explore premium fishing tackle products at Johnny Fishing Tackle.";

  useDocumentMeta(metaTitle, metaDescription);

  useEffect(() => {
    setActiveImage(normalizeImageUrl(product?.images[0]));
    setZoomStyle(null);
    setIsZoomOpen(false);
  }, [product]);

  const handleImageMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width) * 100;
    const offsetY = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomStyle({
      backgroundImage: `url(${activeImage ?? ""})`,
      backgroundPosition: `${offsetX}% ${offsetY}%`,
      backgroundSize: "200% 200%",
      backgroundRepeat: "no-repeat",
      transform: "scale(1)",
    });
  };

  const handleImageMouseLeave = () => {
    setZoomStyle(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading product details...
      </div>
    );
  }

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

  const handleDelete = async () => {
    if (!productId) {
      return;
    }

    try {
      if (productId.startsWith("admin-")) {
        removeAdminProduct(productId);
      } else {
        await deleteProduct(productId);
      }
      navigate("/products");
    } catch {
      window.alert("Unable to delete this product right now.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
            onMouseMove={isZoomOpen ? undefined : handleImageMouseMove}
            onMouseLeave={isZoomOpen ? undefined : handleImageMouseLeave}
            onClick={() => {
              setZoomStyle(null);
              setIsZoomOpen(true);
            }}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="h-[360px] w-full cursor-zoom-in object-cover transition duration-200 ease-out md:h-[440px]"
              style={{ transform: zoomStyle ? "scale(1.02)" : "scale(1)" }}
            />

            {zoomStyle ? (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_20px_45px_rgba(15,23,42,0.25)] md:h-52 md:w-52"
                style={zoomStyle}
              >
                <div className="absolute inset-0 rounded-full border border-slate-200" />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((image) => {
              const normalizedImage = normalizeImageUrl(image);

              return (
                <button
                  key={normalizedImage || image}
                  type="button"
                  onClick={() => setActiveImage(normalizedImage)}
                  className={`overflow-hidden rounded-xl border ${
                    activeImage === normalizedImage ? "border-emerald-600" : "border-slate-200"
                  }`}
                >
                  <img src={normalizedImage} alt={product.name} loading="lazy" className="h-24 w-full object-cover" />
                </button>
              );
            })}
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

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={outOfStock}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {outOfStock ? "Out Of Stock" : "Add To Cart"}
            </button>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin", { state: { editingProduct: product } })}
                  className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </>
            )}
          </div>

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

      {isZoomOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={() => setIsZoomOpen(false)}>
          <div className="relative h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-800/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Close
            </button>

            <div className="relative h-full w-full overflow-hidden bg-slate-100">
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
