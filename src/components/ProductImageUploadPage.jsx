import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, uploadProductImage } from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

export default function ProductImageUploadPage({ token }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    altText: "",
    sortOrder: "0",
    isPrimary: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();

        setProducts(data.filter((product) => Number(product.is_active) === 1));
      } catch (error) {
        setErrorMessage(error.message || "Unable to load products.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.productId) {
      errors.productId = "Please choose a product.";
    }

    if (!imageFile) {
      errors.image = "Please choose an image file.";
    } else if (!imageFile.type.startsWith("image/")) {
      errors.image = "Please choose a valid image file.";
    }

    if (!form.altText.trim()) {
      errors.altText = "Please describe the product image.";
    }

    if (Number(form.sortOrder) < 0) {
      errors.sortOrder = "Sort order cannot be negative.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const imageData = new FormData();

      imageData.append("image", imageFile);
      imageData.append("altText", form.altText.trim());
      imageData.append("sortOrder", form.sortOrder);
      imageData.append("isPrimary", String(form.isPrimary));

      await uploadProductImage(token, Number(form.productId), imageData);

      navigate("/products");
    } catch (error) {
      setErrorMessage(error.message || "Unable to upload product image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
        Product management
      </p>

      <h1 className="mt-2 text-3xl font-bold text-emerald-950">
        Upload product image
      </h1>

      <p className="mt-2 text-slate-500">
        Add a clear sweater photo and choose whether it is the main catalog
        image.
      </p>

      {errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="productId"
          >
            Product
          </label>

          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              disabled={isLoadingProducts}
              id="productId"
              onChange={(event) => updateField("productId", event.target.value)}
              value={form.productId}
            >
              <option value="">
                {isLoadingProducts ? "Loading products..." : "Choose a sweater"}
              </option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {fieldErrors.productId && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.productId}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="image"
          >
            Image file
          </label>

          <input
            accept="image/*"
            className="block w-full cursor-pointer rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-900"
            id="image"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            type="file"
          />

          {fieldErrors.image && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.image}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="altText"
          >
            Image description
          </label>

          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            id="altText"
            onChange={(event) => updateField("altText", event.target.value)}
            placeholder="Example: Cream cable-knit cardigan shown from the front"
            type="text"
            value={form.altText}
          />

          <p className="mt-1 text-sm text-slate-500">
            This helps customers and screen-reader users understand the photo.
          </p>

          {fieldErrors.altText && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.altText}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="sortOrder"
            >
              Display order
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="sortOrder"
              min="0"
              onChange={(event) => updateField("sortOrder", event.target.value)}
              type="number"
              value={form.sortOrder}
            />

            {fieldErrors.sortOrder && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.sortOrder}
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <input
              checked={form.isPrimary}
              className="h-4 w-4 accent-emerald-800"
              onChange={(event) =>
                updateField("isPrimary", event.target.checked)
              }
              type="checkbox"
            />

            <span>
              <span className="block font-semibold">Primary image</span>
              <span className="mt-1 block text-emerald-800">
                Show this image first in the catalog.
              </span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-6">
          <button
            className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
            onClick={() => navigate("/products")}
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || isLoadingProducts}
            type="submit"
          >
            {isSubmitting ? "Uploading image..." : "Upload image"}
          </button>
        </div>
      </form>
    </section>
  );
}
