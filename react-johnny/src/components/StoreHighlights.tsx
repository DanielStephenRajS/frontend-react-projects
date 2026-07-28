const highlights = [
  { title: "Same Day Dispatch", value: "Before 3 PM" },
  { title: "Product Expertise", value: "Category Specialists" },
  { title: "Store Support", value: "6 Days A Week" },
  { title: "Curated Inventory", value: "Fresh + Saltwater" },
];

export const StoreHighlights = () => (
  <section>
    <h2 className="mb-4 font-display text-3xl text-slate-900">Store Highlights</h2>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {highlights.map((item) => (
        <article key={item.title} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-800">{item.title}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
        </article>
      ))}
    </div>
  </section>
);
