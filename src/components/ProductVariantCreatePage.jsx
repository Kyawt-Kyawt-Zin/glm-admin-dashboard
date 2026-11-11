import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProductVariant, getProducts } from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

export default function ProductVariantCreatePage({ token }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    productId: "",
    color: "",
    size: "Free Size",
    sku: "",
    price: "",
    fulfillmentType: "in_stock",
    stockQuantity: "",
    preorderLeadDays: "14",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPreorder = form.fulfillmentType === "preorder";

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

    if (!form.color.trim()) {
      errors.color = "Colour is required.";
    }

    if (!form.size.trim()) {
      errors.size = "Size is required. Use Free Size when appropriate.";
    }

    if (form.sku.trim().length < 3) {
      errors.sku = "SKU must contain at least 3 characters.";
    }

    const price = Number(form.price);
    const priceInFils = Math.round(price * 100);

    if (!form.price || !Number.isFinite(price) || price <= 0) {
      errors.price = "Price must be greater than zero.";
    } else if (priceInFils % 25 !== 0) {
      errors.price = "Price must use .00, .25, .50, or .75!";
    }

    if (
      !isPreorder &&
      (!form.stockQuantity || Number(form.stockQuantity) < 0)
    ) {
      errors.stockQuantity = "Enter a stock quantity of zero or more.";
    }

    if (
      isPreorder &&
      (Number(form.preorderLeadDays) < 1 || Number(form.preorderLeadDays) > 45)
    ) {
      errors.preorderLeadDays =
        "Preorder lead time must be between 1 and 45 days.";
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

      await createProductVariant(token, {
        productId: Number(form.productId),
        color: form.color.trim(),
        size: form.size.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: Number(form.price),
        fulfillmentType: form.fulfillmentType,
        stockQuantity: isPreorder ? 0 : Number(form.stockQuantity),
        preorderLeadDays: isPreorder ? Number(form.preorderLeadDays) : null,
        depositPercentage: isPreorder ? 20 : null,
      });

      navigate("/inventory");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create product variant.");
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
        Add a product variant
      </h1>

      <p className="mt-2 text-slate-500">
        Create a sellable colour and size option for an existing sweater.
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
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
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

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="color"
            >
              Colour
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="color"
              onChange={(event) => updateField("color", event.target.value)}
              placeholder="Example: Cream"
              type="text"
              value={form.color}
            />

            {fieldErrors.color && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.color}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="size"
            >
              Size
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="size"
              onChange={(event) => updateField("size", event.target.value)}
              placeholder="Example: Free Size or M"
              type="text"
              value={form.size}
            />

            {fieldErrors.size && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.size}</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="sku"
            >
              SKU
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="sku"
              onChange={(event) => updateField("sku", event.target.value)}
              placeholder="Example: CAR-CRM-FS"
              type="text"
              value={form.sku}
            />

            {fieldErrors.sku && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.sku}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="price"
            >
              Price (AED)
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="price"
              min="0.25"
              step="0.25"
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="Example: 150"
              type="number"
              value={form.price}
            />

            {fieldErrors.price && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Fulfillment type
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={`rounded-xl border p-4 text-left transition ${
                !isPreorder
                  ? "border-emerald-700 bg-emerald-50 text-emerald-950"
                  : "border-stone-300 bg-white text-slate-600 hover:bg-stone-50"
              }`}
              onClick={() => updateField("fulfillmentType", "in_stock")}
              type="button"
            >
              <span className="block font-semibold">In stock</span>
              <span className="mt-1 block text-sm">
                Ready for Dubai delivery or pickup.
              </span>
            </button>

            <button
              className={`rounded-xl border p-4 text-left transition ${
                isPreorder
                  ? "border-amber-600 bg-amber-50 text-amber-950"
                  : "border-stone-300 bg-white text-slate-600 hover:bg-stone-50"
              }`}
              onClick={() => updateField("fulfillmentType", "preorder")}
              type="button"
            >
              <span className="block font-semibold">Preorder</span>
              <span className="mt-1 block text-sm">
                Imported from Myanmar after a 20% deposit.
              </span>
            </button>
          </div>
        </div>

        {!isPreorder ? (
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="stockQuantity"
            >
              Stock quantity
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="stockQuantity"
              min="0"
              onChange={(event) =>
                updateField("stockQuantity", event.target.value)
              }
              placeholder="Example: 8"
              type="number"
              value={form.stockQuantity}
            />

            {fieldErrors.stockQuantity && (
              <p className="mt-1 text-sm text-red-600">
                {fieldErrors.stockQuantity}
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 rounded-2xl bg-amber-50 p-5 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-amber-950"
                htmlFor="preorderLeadDays"
              >
                Preorder lead time (1–45 days)
              </label>

              <input
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                id="preorderLeadDays"
                min="1"
                max="45"
                onChange={(event) =>
                  updateField("preorderLeadDays", event.target.value)
                }
                type="number"
                value={form.preorderLeadDays}
              />

              {fieldErrors.preorderLeadDays && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.preorderLeadDays}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-950">
                Required deposit
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-800">20%</p>
              <p className="mt-1 text-sm text-amber-800">
                Fixed according to your preorder policy.
              </p>
            </div>
          </div>
        )}

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
            {isSubmitting ? "Creating variant..." : "Create variant"}
          </button>
        </div>
      </form>
    </section>
  );
}
