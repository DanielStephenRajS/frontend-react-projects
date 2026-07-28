import { useState } from "react";
import { Outlet } from "react-router-dom";
import { catalogRepository } from "../data/catalog";
import { CategorySidebar } from "../components/CategorySidebar";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const MainLayout = () => {
  const categories = catalogRepository.getCategories();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onOpenCategories={() => setOpen(true)} />
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        <CategorySidebar categories={categories} open={open} onClose={() => setOpen(false)} />
        <main className="min-w-0 flex-1 space-y-10">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
