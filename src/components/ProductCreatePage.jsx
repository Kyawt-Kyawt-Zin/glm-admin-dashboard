import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectChevron from "./SelectChevron.jsx";
import { createProduct, getCategories } from "../services/api.js";

export default function ProductCreatePage({ token }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    targetGender: "unisex",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        setCategories(
          data.filter((category) => Number(category.is_active) === 1),
        );
      } catch (error) {
        setErrorMessage(error.message || "Unable to load categories.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.categoryId) {
      errors.categoryId = "Please select a category.";
    }

    if (form.name.trim().length < 3) {
      errors.name = "Product name must contain at least 3 characters.";
    }

    if (form.description.trim().length < 10) {
      errors.description = "Description must contain at least 10 characters.";
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

      await createProduct(token, {
        categoryId: Number(form.categoryId),
        name: form.name.trim(),
        description: form.description.trim(),
        targetGender: form.targetGender,
      });

      navigate("/products");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create product.");
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
        Add a new sweater
      </h1>

      <p className="mt-2 text-slate-500">
        Create the main product first. You can add colour, size, stock, and
        images as variants afterwards.
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
            htmlFor="categoryId"
          >
            Category
          </label>

          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              disabled={isLoadingCategories}
              id="categoryId"
              onChange={(event) =>
                updateField("categoryId", event.target.value)
              }
              value={form.categoryId}
            >
              <option value="">
                {isLoadingCategories
                  ? "Loading categories..."
                  : "Choose a category"}
              </option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <SelectChevron />
          </div>

          {fieldErrors.categoryId && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.categoryId}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="name"
          >
            Product name
          </label>

          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            id="name"
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Example: Hand-knitted cable pullover"
            type="text"
            value={form.name}
          />

          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="targetGender"
          >
            Target gender
          </label>

          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              id="targetGender"
              onChange={(event) =>
                updateField("targetGender", event.target.value)
              }
              value={form.targetGender}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>

            <SelectChevron />
          </div>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="description"
          >
            Description
          </label>

          <textarea
            className="min-h-32 w-full rounded-xl border border-stone-300 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            id="description"
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe the material, design, comfort, and Myanmar-made details."
            value={form.description}
          />

          {fieldErrors.description && (
            <p className="mt-1 text-sm text-red-600">
              {fieldErrors.description}
            </p>
          )}
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
            disabled={isSubmitting || isLoadingCategories}
            type="submit"
          >
            {isSubmitting ? "Creating product..." : "Create product"}
          </button>
        </div>
      </form>
    </section>
  );
}
