import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { catalogRepository } from "./data/catalog";
import { RequireAdmin } from "./components/RequireAdmin";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminPage } from "./pages/AdminPage";
import { BrandsPage } from "./pages/BrandsPage";
import { BrandDetailsPage } from "./pages/BrandDetailsPage";
import { CartPage } from "./pages/CartPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { YouTubePage } from "./pages/YouTubePage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

const staticImageUrls: string[] = Array.from(
  new Set(
    [
      catalogRepository.getStore().logoUrl,
      ...catalogRepository.getCategories().flatMap((category) => (category.image ? [category.image] : [])),
      ...catalogRepository.getBrands().flatMap((brand) =>
        [brand.logo, brand.bannerImage, brand.bannerFallbackImage].filter(
          (value): value is string => Boolean(value),
        ),
      ),
      ...catalogRepository.getProducts().flatMap((product) => product.images ?? []),
      ...catalogRepository.getReviews().flatMap((review) => (review.avatar ? [review.avatar] : [])),
      "/assets/location/chennai.jpg",
      "/assets/location/pondicherry.jpg",
    ].filter((value): value is string => Boolean(value)),
  ),
);

const PreloadStaticImages = () => {
  useEffect(() => {
    staticImageUrls.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  return null;
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
    });
  }, [location.pathname]);

  return null;
};

const WakeApiOnFirstLoad = () => {
  useEffect(() => {
    const checkKey = "johnny-api-health-check";
    const alreadyChecked = sessionStorage.getItem(checkKey) === "done";

    if (alreadyChecked) {
      return;
    }

    const wakeApi = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }

        sessionStorage.setItem(checkKey, "done");
      } catch {
        sessionStorage.setItem(checkKey, "failed");
      }
    };

    void wakeApi();
  }, []);

  return null;
};

const CartSuccessToast = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCartAdd = () => {
      setMessage("Added successfully");
      window.setTimeout(() => setMessage(null), 1800);
    };

    window.addEventListener("cart:add", handleCartAdd);
    return () => window.removeEventListener("cart:add", handleCartAdd);
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50">
      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg ring-1 ring-white">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>
        {message}
      </div>
    </div>
  );
};

const App = () => (
  <>
    <WakeApiOnFirstLoad />
    <CartSuccessToast />
    <PreloadStaticImages />
    <ScrollToTop />
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories/:categorySlug" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/brands/:brandSlug" element={<BrandDetailsPage />} />
        <Route path="/youtube" element={<YouTubePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="/categories" element={<Navigate to="/products" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </>
);

export default App;
