import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addAdminProduct, AdminStorageQuotaError, createProduct, updateAdminProduct, updateProduct } from "../data/admin-products";
import { catalogRepository } from "../data/catalog";
import { useAdmin } from "../hooks/useAdmin";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useProducts } from "../hooks/useProducts";
import type { ProductVariant } from "../types";

const MAX_UPLOAD_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);
const MAX_IMAGE_DIMENSION = 1280;
const COMPRESS_QUALITY = 0.72;

const buildImageFileName = (productName: string, index: number, extension: string): string => {
  const baseName = (productName || "product")
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const finalBase = baseName || "product";
  return `${finalBase}_${index}${extension}`;
};

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

  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const categories = catalogRepository.getCategories();
  const brands = catalogRepository.getBrands();
  const categoryOptions: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentName?: string;
    parentSlug?: string;
  }> = categories.flatMap((category) =>
    category.subcategories?.length
      ? category.subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          image: subcategory.image,
          parentName: category.name,
          parentSlug: category.slug,
        }))
      : [{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentName: category.name,
          parentSlug: category.slug,
        }],
  );
  const [refreshTick, setRefreshTick] = useState(0);
  const { products } = useProducts(refreshTick);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categorySlug, setCategorySlug] = useState(categoryOptions[0]?.slug ?? categories[0]?.slug ?? "rods");
  const [brandSlug, setBrandSlug] = useState(brands[0]?.slug ?? "lucana");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [imageUrlsInput, setImageUrlsInput] = useState("");
  const [keyFeaturesInput, setKeyFeaturesInput] = useState("");
  const [specInput, setSpecInput] = useState("");
  const [variantTypePreset, setVariantTypePreset] = useState("Size");
  const [customVariantType, setCustomVariantType] = useState("");
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [featured, setFeatured] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const editingProduct = (location.state as { editingProduct?: (typeof products)[number] } | null)?.editingProduct ?? null;

  useMemo(() => {
    if (!editingProduct) {
      return;
    }

    const specLines = Object.entries(editingProduct.specifications ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    setName(editingProduct.name);
    setDescription(editingProduct.description);
    setBrandSlug(editingProduct.brandSlug || brands[0]?.slug || "lucana");
    setCategorySlug(editingProduct.categorySlug || categoryOptions[0]?.slug || categories[0]?.slug || "rods");
    setPrice(String(editingProduct.price));
    setQuantity(editingProduct.quantity != null ? String(editingProduct.quantity) : "");
    setUploadedImages(
      (editingProduct.images ?? [])
        .filter((image) => image.startsWith("data:") || image.startsWith("http"))
        .map((image, index) => ({
          name: buildImageFileName(editingProduct.name, index + 1, ".jpg"),
          dataUrl: image,
        })) ?? [],
    );
    setImageUrlsInput(editingProduct.images?.filter((image) => image.startsWith("http")).join("\n") ?? "");
    setKeyFeaturesInput(editingProduct.keyFeatures?.join("\n") ?? "");
    setSpecInput(specLines || "");
    setProductVariants(
      (editingProduct.variants ?? []).map((variant) => ({
        ...variant,
        variant_type: variant.variant_type || "Size",
        variant_value: variant.variant_value || "",
        stock: typeof variant.stock === "number" ? variant.stock : Number(variant.stock ?? 0),
        sku: variant.sku ?? "",
        price_inr: variant.price_inr ?? null,
        is_active: variant.is_active !== false,
        sort_order: variant.sort_order ?? 0,
      })),
    );
    setVariantTypePreset((editingProduct.variants ?? [])[0]?.variant_type ?? "Size");
    setCustomVariantType("");
    setFeatured(Boolean(editingProduct.featured));
    setEditingProductId(editingProduct.id);
    setMessage(`Editing ${editingProduct.name}. Update the fields and save.`);
  }, [brands, categories, editingProduct]);

  const brand = useMemo(() => brands.find((item) => item.slug === brandSlug), [brands, brandSlug]);
  const category = useMemo(
    () => categoryOptions.find((item) => item.slug === categorySlug) ?? categories.find((item) => item.slug === categorySlug),
    [categories, categoryOptions, categorySlug],
  );

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
      const imageEntries = await Promise.all(
        filesToRead.map(async (file) => ({
          name: file.name,
          dataUrl: await optimizeImageForStorage(file),
        })),
      );
      setUploadedImages((current) => [...current, ...imageEntries]);

      if (files.length > availableSlots) {
        setMessage(`Only ${MAX_UPLOAD_IMAGES} images can be uploaded. Extra files were skipped.`);
      } else {
        setMessage(`${imageEntries.length} image(s) uploaded and optimized for storage.`);
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

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setUploadedImages([]);
    setImageUrlsInput("");
    setKeyFeaturesInput("");
    setSpecInput("");
    setVariantTypePreset("Size");
    setCustomVariantType("");
    setProductVariants([]);
    setFeatured(false);
    setBrandSlug(brands[0]?.slug ?? "lucana");
    setCategorySlug(categoryOptions[0]?.slug ?? categories[0]?.slug ?? "rods");
    setEditingProductId(null);
  };

  const addVariantRow = () => {
    const resolvedType = (variantTypePreset === "Other" ? customVariantType : variantTypePreset).trim();
    if (!resolvedType) {
      setMessage("Please choose a variant type or enter a custom type before adding a variant.");
      return;
    }

    setProductVariants((current) => [
      ...current,
      {
        variant_type: resolvedType,
        variant_value: "",
        stock: 0,
        sku: "",
        price_inr: null,
        is_active: true,
        sort_order: current.length + 1,
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: ProductVariant[keyof ProductVariant]) => {
    setProductVariants((current) =>
      current.map((variant, variantIndex) => (variantIndex === index ? { ...variant, [field]: value } : variant)),
    );
  };

  const removeVariant = (index: number) => {
    setProductVariants((current) => current.filter((_, variantIndex) => variantIndex !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasVariants = productVariants.length > 0;

    const normalizedVariants = productVariants
      .map((variant, index) => {
        const variantType = String(variant.variant_type ?? "").trim();
        const variantValue = String(variant.variant_value ?? "").trim();

        if (!variantType || !variantValue) {
          return null;
        }

        const parsedVariantStock = Number(variant.stock ?? 0);
        const parsedVariantPrice = variant.price_inr === null || variant.price_inr === undefined ? null : Number(variant.price_inr);

        return {
          variant_id: variant.variant_id,
          product_id: editingProductId ?? undefined,
          variant_type: variantType,
          variant_value: variantValue,
          sku: variant.sku?.trim() || undefined,
          price_inr: Number.isFinite(parsedVariantPrice) ? parsedVariantPrice : null,
          stock: Number.isFinite(parsedVariantStock) ? parsedVariantStock : 0,
          is_active: variant.is_active !== false,
          sort_order: Number.isFinite(Number(variant.sort_order)) ? Number(variant.sort_order) : index + 1,
        } satisfies ProductVariant;
      })
      .filter(Boolean) as ProductVariant[];

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const computedProductQuantity = hasVariants
      ? normalizedVariants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock ?? 0)), 0)
      : parsedQuantity;

    if (!hasVariants) {
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        setMessage("Please enter a valid price.");
        return;
      }

      if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
        setMessage("Please enter a valid quantity (0 or more).");
        return;
      }
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

    const parsedKeyFeatures = keyFeaturesInput
      .replace(/\r/g, "\n")
      .split(/\n+/)
      .flatMap((segment) =>
        segment
          .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
          .map((part) => part.trim())
          .filter(Boolean),
      )
      .map((item) => item.replace(/^[\-\*\d\.\)]\s*/, "").replace(/^[:\-–—]\s*/, "").trim())
      .filter(Boolean);

    const keyFeaturesText = parsedKeyFeatures.join("\n");

    const imageUrls = imageUrlsInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const allImages = [...uploadedImages.map((image) => image.dataUrl), ...imageUrls].filter(Boolean);
    const uploadedFiles = await Promise.all(
      uploadedImages.map(async (image, index) => {
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const extension = blob.type.includes("png") ? ".png" : blob.type.includes("webp") ? ".webp" : ".jpg";
        return new File([blob], buildImageFileName(name.trim() || "product", index + 1, extension), {
          type: blob.type || "image/webp",
        });
      }),
    );
    const idSeed = `${Date.now()}`;

    const productSpecifications = Object.keys(specs).length
      ? Object.entries(specs)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ")
      : "";

    const selectedCategoryName = category?.name ?? "";
    const selectedCategorySlugValue = category?.slug ?? categorySlug;

    const productPayload = {
      product_name: name.trim(),
      product_description: description.trim(),
      brand_name: brand.name,
      category_name: selectedCategoryName,
      price_inr: parsedPrice,
      key_features: keyFeaturesText || undefined,
      specifications: productSpecifications || undefined,
      stock_quantity: computedProductQuantity,
      is_featured: featured,
      is_active: true,
      images: uploadedFiles.length > 0 ? [...uploadedFiles, ...imageUrls] : allImages.length > 0 ? allImages : ["/assets/products/rod-1-a.jpg"],
      variants: normalizedVariants,
    };

    try {
      if (editingProductId) {
        const updatedProduct: (typeof products)[number] = {
          id: editingProductId,
          name: name.trim(),
          description: description.trim(),
          shortDescription: "",
          brand: brand.name,
          brandSlug: brand.slug,
          category: selectedCategoryName,
          categorySlug: selectedCategorySlugValue,
          price: parsedPrice,
          images: allImages.length > 0 ? allImages : ["/assets/products/rod-1-a.jpg"],
          featured,
          specifications: Object.keys(specs).length ? specs : {},
          keyFeatures: parsedKeyFeatures,
          quantity: computedProductQuantity,
          variants: normalizedVariants,
        };

        if (editingProductId.startsWith("admin-")) {
          updateAdminProduct(updatedProduct);
        } else {
          await updateProduct(editingProductId, productPayload);
        }

        setMessage("Product updated successfully.");
      } else {
        const createdProduct = await createProduct(productPayload);
        const createdId = String((createdProduct as { product_id?: number | string } | null)?.product_id ?? `admin-${idSeed}`);

        addAdminProduct({
          id: createdId,
          name: name.trim(),
          description: description.trim(),
          shortDescription: "",
          brand: brand.name,
          brandSlug: brand.slug,
          category: selectedCategoryName,
          categorySlug: selectedCategorySlugValue,
          price: parsedPrice,
          images: allImages.length > 0 ? allImages : ["/assets/products/rod-1-a.jpg"],
          featured,
          specifications: Object.keys(specs).length ? specs : {},
          keyFeatures: parsedKeyFeatures,
          quantity: computedProductQuantity,
          variants: normalizedVariants,
        });

        setMessage("Product added successfully. It is now visible in categories/products.");
      }

      setRefreshTick((value) => value + 1);
      if (!editingProductId) {
        resetForm();
      }
    } catch (error) {
      if (error instanceof AdminStorageQuotaError) {
        setMessage(
          "Storage is full. Reduce image count/size, remove old admin products, or refresh and retry with fewer images.",
        );
        return;
      }

      setMessage(error instanceof Error ? `Failed to save product: ${error.message}` : "Failed to save product. Please retry.");
      return;
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Admin Product Manager</h1>
          <p className="mt-1 text-sm text-slate-600">Add rods, reels, lures, and more. New items appear automatically in the catalog.</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
        <div className="lg:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          API input hint: write each key feature on a new line or as a sentence; the page will display them as bullets. Specifications stay as one key:value per line.
        </div>

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
                <div key={`${image.name}-${index}`} className="relative">
                  <img src={image.dataUrl} alt={`Uploaded product ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />
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
            {categories.map((categoryItem) => {
              if (categoryItem.subcategories?.length) {
                return (
                  <optgroup key={categoryItem.id} label={categoryItem.name}>
                    {categoryItem.subcategories.map((subcategory) => (
                      <option key={subcategory.slug} value={subcategory.slug}>
                        {subcategory.name}
                      </option>
                    ))}
                  </optgroup>
                );
              }

              return (
                <option key={categoryItem.slug} value={categoryItem.slug}>
                  {categoryItem.name}
                </option>
              );
            })}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Price (INR)
          <input
            type="number"
            min={productVariants.length > 0 ? 0 : 1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={!productVariants.length}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Quantity
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} required={!productVariants.length} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Key Features
          <textarea
            value={keyFeaturesInput}
            onChange={(e) => setKeyFeaturesInput(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Product Variants</p>
              <p className="text-xs text-slate-500">Add variant entries for Size, Color, Length, Weight, Model, or custom values.</p>
            </div>
            <button type="button" onClick={addVariantRow} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              + Add Variant
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
            <label className="text-sm font-medium text-slate-700">
              Variant Type
              <select value={variantTypePreset} onChange={(event) => setVariantTypePreset(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="Size">Size</option>
                <option value="Color">Color</option>
                <option value="Length">Length</option>
                <option value="Weight">Weight</option>
                <option value="Model">Model</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {variantTypePreset === "Other" ? (
              <label className="text-sm font-medium text-slate-700">
                Custom Variant Type
                <input value={customVariantType} onChange={(event) => setCustomVariantType(event.target.value)} placeholder="e.g. Finish" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {productVariants.length === 0 ? (
              <p className="text-sm text-slate-500">No variants added yet. The product will use the standard product stock.</p>
            ) : (
              productVariants.map((variant, index) => (
                <div key={`${variant.variant_type}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_0.7fr_1fr_0.7fr_auto_auto]">
                  <label className="text-xs font-medium text-slate-600">
                    Type
                    <input
                      value={variant.variant_type ?? ""}
                      onChange={(event) => updateVariant(index, "variant_type", event.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Value
                    <input
                      value={variant.variant_value ?? ""}
                      onChange={(event) => updateVariant(index, "variant_value", event.target.value)}
                      placeholder="S - 38"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Stock
                    <input
                      type="number"
                      min={0}
                      value={Number(variant.stock ?? 0)}
                      onChange={(event) => updateVariant(index, "stock", Number(event.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Price
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={variant.price_inr ?? ""}
                      onChange={(event) => updateVariant(index, "price_inr", event.target.value === "" ? null : Number(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-600">
                    Sort
                    <input
                      type="number"
                      min={0}
                      value={Number(variant.sort_order ?? 0)}
                      onChange={(event) => updateVariant(index, "sort_order", Number(event.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={variant.is_active !== false}
                      onChange={(event) => updateVariant(index, "is_active", event.target.checked)}
                    />
                    Active
                  </label>
                  <button type="button" onClick={() => removeVariant(index)} className="mt-6 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700">
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <label className="text-sm font-medium text-slate-700 lg:col-span-2">
          Specifications (one per line, key:value)
          <textarea
            value={specInput}
            onChange={(e) => setSpecInput(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 lg:col-span-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Mark as featured product
        </label>

        <div className="lg:col-span-2 flex items-center justify-between gap-3">
          <p className="text-sm text-emerald-700">{message}</p>
          <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            {editingProductId ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

    </div>
  );
};
