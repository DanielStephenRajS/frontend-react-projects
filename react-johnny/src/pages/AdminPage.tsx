import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { addAdminProduct, AdminStorageQuotaError } from "../data/admin-products";
import { catalogRepository } from "../data/catalog";
import { useAdmin } from "../hooks/useAdmin";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const MAX_UPLOAD_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_IMAGE_DIMENSION = 1280;
const COMPRESS_QUALITY = 0.72;

const optimizeImageForStorage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const widthRatio = MAX_IMAGE_DIMENSION / image.width;
      const heightRatio = MAX_IMAGE_DIMENSION / image.height;
      const ratio = Math.min(1, widthRatio, heightRatio);

      const targetWidth = Math.max(1, Math.round(image.width * ratio));
      const targetHeight = Math.max(1, Math.round(image.height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Unable to process file: ${file.name}`));
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      const optimized = canvas.toDataURL("image/webp", COMPRESS_QUALITY);
      URL.revokeObjectURL(objectUrl);
      resolve(optimized);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read file: ${file.name}`));
    };

    image.src = objectUrl;
  });

export const AdminPage = () => {
  useDocumentMeta("Admin", "Admin product management for Johnny Fishing Tackle.");

  const { logout } = useAdmin();
  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const products = catalogRepository.getProducts();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "rods");
  const [brandSlug, setBrandSlug] = useState(brands[0]?.slug ?? "lucana");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [keyFeaturesInput, setKeyFeaturesInput] = useState("");
  const [specInput, setSpecInput] = useState("Length: 7'\nAction: Medium Fast");
  const [featured, setFeatured] = useState(false);
  const [message, setMessage] = useState("");

  const brand = useMemo(() => brands.find((item) => item.slug === brandSlug), [brands, brandSlug]);
  const category = useMemo(() => categories.find((item) => item.slug === categorySlug), [categories, categorySlug]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const invalid = files.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));
    if (invalid) {
      setMessage("Only PNG, JPG/JPEG, and WEBP formats are supported.");
      event.target.value = "";
      return;
    }

    const availableSlots = MAX_UPLOAD_IMAGES - uploadedImages.length;
    if (availableSlots <= 0) {
      setMessage(`Maximum ${MAX_UPLOAD_IMAGES} images allowed.`);
      event.target.value = "";
      return;
    }

    const filesToRead = files.slice(0, availableSlots);

    try {
      const dataUrls = await Promise.all(filesToRead.map((file) => optimizeImageForStorage(file)));
      setUploadedImages((current) => [...current, ...dataUrls]);

      if (files.length > availableSlots) {
        setMessage(`Only ${MAX_UPLOAD_IMAGES} images can be uploaded. Extra files were skipped.`);
      } else {
        setMessage(`${dataUrls.length} image(s) uploaded and optimized for storage.`);
      }
    } catch {
      setMessage("Failed to upload one or more images. Please try again.");
    } finally {
      event.target.value = "";
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setMessage("Please enter a valid quantity (0 or more).");
      return;
    }

    if (!brand || !category) {
      setMessage("Please select valid brand and category.");
      return;
    }

    const specs = specInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, line) => {
        const [key, ...rest] = line.split(":");
        const value = rest.join(":").trim();
        if (key && value) {
          acc[key.trim()] = value;
        }
        return acc;
      }, {});

    const keyFeatures = keyFeaturesInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const idSeed = `${slugify(name)}-${Date.now()}`;

    try {
      addAdminProduct({
        id: `admin-${idSeed}`,
        slug: slugify(name),
        name: name.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim() || description.trim().slice(0, 90),
        brand: brand.name,
        brandSlug: brand.slug,
        category: category.name,
        categorySlug: category.slug,
        price: parsedPrice,
        images: uploadedImages.length > 0 ? uploadedImages : ["/assets/products/rod-1-a.jpg"],
        featured,
        specifications: Object.keys(specs).length ? specs : { Feature: "Details coming soon" },
        keyFeatures,
        quantity: parsedQuantity,
      });
    } catch (error) {
      if (error instanceof AdminStorageQuotaError) {
        setMessage(
          "Storage is full. Reduce image count/size, remove old admin products, or refresh and retry with fewer images.",
        );
        return;
      }

      setMessage("Failed to save product. Please retry.");
      return;
    }

    setMessage("Product added successfully. It is now visible in categories/products.");
    setName("");
    setDescription("");
    setShortDescription("");
    setPrice("");
    setQuantity("");
    setUploadedImages([]);
    setKeyFeaturesInput("");
    setSpecInput("Length: 7'\nAction: Medium Fast");
    setFeatured(false);
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Admin Product Manager</h1>
          <p className="mt-1 text-sm text-slate-600">Add rods, reels, lures, and more. New items appear automatically in the catalog.</p>
        </div>
        <button onClick={logout} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Logout
        </button>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Product Name
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Upload Product Images (Max 5)
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            onChange={handleImageUpload}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-slate-500">Supported: PNG, JPG/JPEG, WEBP. You can upload up to 5 images.</p>
          <p className="mt-1 text-xs text-slate-500">Images are auto-optimized to reduce storage usage and improve loading speed.</p>
        </label>

        <div className="text-sm font-medium text-slate-700">
          Uploaded Images
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-slate-200 p-2">
            {uploadedImages.length > 0 ? (
              uploadedImages.map((image, index) => (
                <div key={`${image.slice(0, 20)}-${index}`} className="relative">
                  <img src={image} alt={`Uploaded product ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-[10px] font-semibold text-white"
                  >
                    X
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-xs text-slate-500">No images uploaded yet.</p>
            )}
          </div>
        </div>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Short Description
          <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Optional short summary" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Brand
          <select value={brandSlug} onChange={(e) => setBrandSlug(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            {brands.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Category
          <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>{item.name}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Price (INR)
          <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Quantity
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Key Features (comma separated)
          <input
            value={keyFeaturesInput}
            onChange={(e) => setKeyFeaturesInput(e.target.value)}
            placeholder="Lightweight body, Corrosion resistant, High drag power"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Specifications (one per line, key:value)
          <textarea value={specInput} onChange={(e) => setSpecInput(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 lg:col-span-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Mark as featured product
        </label>

        <div className="lg:col-span-2 flex items-center justify-between gap-3">
          <p className="text-sm text-emerald-700">{message}</p>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            Add Product
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Catalog Snapshot</h2>
        <p className="mt-1 text-sm text-slate-600">Total products currently available: {products.length}</p>
      </section>
    </div>
  );
};
