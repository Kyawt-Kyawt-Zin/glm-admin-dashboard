import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
} from "../services/api.js";

export default function CategoryEditPage({ token }) {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successTone, setSuccessTone] = useState("success");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const data = await getCategoryById(categoryId);

        setCategory(data);
        setForm({
          name: data.name,
          description: data.description || "",
        });
      } catch (error) {
        setErrorMessage(error.message || "Unable to load category.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setErrorMessage("Category name is required.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      const updatedCategory = await updateCategory(token, category.id, {
        name,
        description,
        isActive: Boolean(category.is_active),
      });

      setCategory(updatedCategory);
      setForm({
        name: updatedCategory.name,
        description: updatedCategory.description || "",
      });
      setSuccessTone("success");
      setSuccessMessage("Category details saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  const applyStatusChange = async (nextIsActive) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsChangingStatus(true);

      await updateCategoryStatus(token, category.id, nextIsActive);

      setCategory((currentCategory) => ({
        ...currentCategory,
        is_active: nextIsActive ? 1 : 0,
      }));

      setSuccessTone(nextIsActive ? "success" : "danger");

      setSuccessMessage(
        nextIsActive
          ? "Category activated successfully."
          : "Category deactivated successfully.",
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to update category status.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleStatusChange = () => {
    if (category.is_active) {
      setIsDeactivateConfirmOpen(true);
      return;
    }

    applyStatusChange(true);
  };

  const confirmDeactivation = () => {
    setIsDeactivateConfirmOpen(false);
    applyStatusChange(false);
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading category...</p>
      </section>
    );
  }

  if (errorMessage && !category) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-red-700">
          Unable to load category: {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            CATEGORY MANAGEMENT
          </p>
          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            Edit {category.name}
          </h3>
          <p className="mt-2 text-sm text-slate-600">Slug: /{category.slug}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-semibold ${
              category.is_active ? "text-emerald-800" : "text-stone-600"
            }`}
          >
            {category.is_active ? "Active" : "Inactive"}
          </span>

          <button
            aria-checked={Boolean(category.is_active)}
            aria-label={
              category.is_active ? "Deactivate category" : "Activate category"
            }
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
              category.is_active ? "bg-emerald-700" : "bg-stone-300"
            }`}
            disabled={isChangingStatus}
            onClick={handleStatusChange}
            role="switch"
            type="button"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                category.is_active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <form className="mt-6 max-w-2xl" onSubmit={handleSave}>
        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="categoryName"
          >
            Category name
          </label>
          <input
            autoFocus
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
            id="categoryName"
            maxLength={100}
            onChange={(event) => updateFormField("name", event.target.value)}
            value={form.name}
          />
        </div>

        <div className="mt-5">
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="categoryDescription"
          >
            Description <span className="font-normal">(optional)</span>
          </label>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
            id="categoryDescription"
            maxLength={500}
            onChange={(event) =>
              updateFormField("description", event.target.value)
            }
            value={form.description}
          />
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-700">{errorMessage}</p>
        )}

        {successMessage && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              successTone === "danger"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {successMessage}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
            onClick={() => navigate("/categories")}
            type="button"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to categories
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
      {isDeactivateConfirmOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold text-red-700">
              DEACTIVATE CATEGORY
            </p>

            <h4 className="mt-2 text-xl font-bold text-emerald-950">
              Deactivate {category.name}?
            </h4>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              This category will remain in historical records, but staff will no
              longer be able to select it for new products.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
                onClick={() => setIsDeactivateConfirmOpen(false)}
                type="button"
              >
                Keep active
              </button>

              <button
                className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-800"
                onClick={confirmDeactivation}
                type="button"
              >
                Deactivate category
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
