import { useEffect, useState } from "react";
import { getCategories } from "../services/api.js";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

        <div className="rounded-xl bg-emerald-50 px-3 py-3 text-sm">
          <span className="font-semibold text-emerald-950">{activeCount}</span>{" "}
          active of {categories.length} categories
        </div>
      </div>

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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article
              className="rounded-2xl border border-stone-200 p-5"
              key={category.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-emerald-950">
                    {category.name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    /{category.slug}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    category.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {category.description || "No description added yet."}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
