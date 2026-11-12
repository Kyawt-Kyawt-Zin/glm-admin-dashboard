import { useEffect, useState } from "react";
import { ArrowLeft, Layers, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategories,
  getProductById,
  getProductVariantsByProductId,
  updateProduct,
} from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

const genderOptions = ["men", "women", "unisex"];

export default function ProductEditPage({ token }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    targetGender: "unisex",
    isActive: true,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProductPage = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const [productData, categoriesData, variantsData] = await Promise.all([
          getProductById(productId),
          getCategories(),
          getProductVariantsByProductId(productId),
        ]);

        setProduct(productData);
        setCategories(categoriesData);
        setVariants(variantsData.variants);

        setForm({
          categoryId: String(productData.category_id),
          name: productData.name,
          description: productData.description || "",
          targetGender: productData.target_gender,
          isActive: Boolean(productData.is_active),
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load product.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProductPage();
  }, [productId]);

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const categoryId = Number(form.categoryId);
    const name = form.name.trim();
    const description = form.description.trim();

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setErrorMessage("Please choose a category.");
      return;
    }

    if (!name) {
      setErrorMessage("Product name is required.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      const updatedProduct = await updateProduct(token, product.id, {
        categoryId,
        name,
        description,
        targetGender: form.targetGender,
        isActive: form.isActive,
      });

      setProduct(updatedProduct);
      setSuccessMessage("Product details saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading product...</p>
      </section>
    );
  }

  if (errorMessage && !product) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-700">
          Unable to load product: {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            PRODUCT MANAGEMENT
          </p>
          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            Edit {product.name}
          </h3>
          <p className="mt-2 text-sm text-slate-600">Slug: /{product.slug}</p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${
            product.is_active
              ? "bg-emerald-100 text-emerald-800"
              : "bg-stone-200 text-stone-700"
          }`}
        >
          {product.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <form className="mt-6 max-w-2xl" onSubmit={handleSave}>
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="productCategory"
          >
            Category
          </label>

          <div className="relative mt-2">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none focus:border-emerald-600"
              id="productCategory"
              onChange={(event) =>
                updateFormField("categoryId", event.target.value)
              }
              value={form.categoryId}
            >
              <option value="">Choose a category</option>
              {categories
                .filter((category) => category.is_active)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="mt-5">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="productName"
          >
            Product name
          </label>
          <input
            autoFocus
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
            id="productName"
            maxLength={150}
            onChange={(event) => updateFormField("name", event.target.value)}
            value={form.name}
          />
        </div>

        <div className="mt-5">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="productDescription"
          >
            Description
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
            id="productDescription"
            maxLength={1000}
            onChange={(event) =>
              updateFormField("description", event.target.value)
            }
            value={form.description}
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="targetGender"
            >
              Target gender
            </label>

            <div className="relative mt-2">
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none focus:border-emerald-600"
                id="targetGender"
                onChange={(event) =>
                  updateFormField("targetGender", event.target.value)
                }
                value={form.targetGender}
              >
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="productStatus"
            >
              Catalog status
            </label>

            <div className="relative mt-2">
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none focus:border-emerald-600"
                id="productStatus"
                onChange={(event) =>
                  updateFormField("isActive", event.target.value === "active")
                }
                value={form.isActive ? "active" : "inactive"}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <SelectChevron />
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
            onClick={() => navigate("/products")}
            type="button"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to products
          </button>

          <button
            className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
      <section className="mt-10 border-t border-stone-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              PRODUCT OPTIONS
            </p>
            <h4 className="mt-1 text-xl font-bold text-emerald-950">
              Variants
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Colour, size, price, stock, and preorder availability for this
              sweater.
            </p>
          </div>

          <button
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            onClick={() =>
              navigate(`/products/variants/new?productId=${product.id}`)
            }
            type="button"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add variant
          </button>
        </div>

        {variants.length === 0 ? (
          <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
            This product has no variants yet. Add its first colour and size
            option.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Colour</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Availability</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {variants.map((variant) => (
                  <tr
                    className="border-b border-stone-100 text-sm last:border-b-0"
                    key={variant.id}
                  >
                    <td className="px-4 py-4 font-semibold text-emerald-950">
                      {variant.color}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{variant.size}</td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      {variant.sku}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      AED {Number(variant.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {variant.fulfillment_type === "preorder"
                        ? `Preorder · ${variant.preorder_lead_days} days`
                        : `${variant.stock_quantity} in stock`}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          variant.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-700"
                        }`}
                      >
                        {variant.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
