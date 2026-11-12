import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createCategory, getCategories } from "../services/api.js";

export default function CategoriesPage({ token }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load categories.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const activeCount = categories.filter((category) =>
    Boolean(category.is_active),
  ).length;

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setCreateError("Category name is required.");
      return;
    }

    try {
      setCreateError("");
      setIsCreating(true);

      const newCategory = await createCategory(token, {
        name,
        description,
      });

      setCategories((currentCategories) => [...currentCategories, newCategory]);

      setForm({
        name: "",
        description: "",
      });

      setIsCreateOpen(false);
    } catch (error) {
      setCreateError(error.message || "Unable to create category.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            PRODUCT ORGANIZATION
          </p>
          <h3 className="mt-1 text-2xl font-bold">Categories</h3>
          <p className="mt-2 text-sm text-slate-600">
            Organize sweaters into clear groups such as Hoodies, Pullovers,
            Cardigans, and Turtlenecks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-emerald-50 px-3 py-3 text-sm">
            <span className="font-semibold text-emerald-950">
              {activeCount}
            </span>{" "}
            active of {categories.length} categories
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
            onClick={() => {
              setCreateError("");
              setIsCreateOpen(true);
            }}
            type="button"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add category
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <form
          className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          onSubmit={handleCreateCategory}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="categoryName"
              >
                Category name
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                id="categoryName"
                maxLength={100}
                onChange={(event) =>
                  updateFormField("name", event.target.value)
                }
                placeholder="Example: Hoodie"
                value={form.name}
              />
            </div>

            <div className="flex-1">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="categoryDescription"
              >
                Description <span className="font-normal">(optional)</span>
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                id="categoryDescription"
                maxLength={500}
                onChange={(event) =>
                  updateFormField("description", event.target.value)
                }
                placeholder="Example: Sweaters with attached hoods"
                value={form.description}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
                onClick={() => {
                  setCreateError("");
                  setIsCreateOpen(false);
                }}
                type="button"
              >
                Cancel
              </button>

              <button
                className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isCreating}
                type="submit"
              >
                {isCreating ? "Creating..." : "Create category"}
              </button>
            </div>
          </div>

          {createError && (
            <p className="mt-4 text-sm text-red-700">{createError}</p>
          )}
        </form>
      )}

      {isLoading && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          Loading categories...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load categories: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && categories.length === 0 && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          No categories have been created yet.
        </p>
      )}

      {!isLoading && !errorMessage && categories.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr
                  className="border-b border-stone-100 text-sm last:border-b-0 hover:bg-emerald-50/50"
                  key={category.id}
                >
                  <td className="px-4 py-4 font-semibold text-emerald-950">
                    {category.name}
                  </td>

                  <td className="px-4 py-4 text-slate-500">/{category.slug}</td>

                  <td className="max-w-md px-4 py-4 text-slate-600">
                    <span className="block truncate">
                      {category.description || "No description added yet."}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                      onClick={() => navigate(`/categories/${category.id}`)}
                      type="button"
                    >
                      Edit
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
