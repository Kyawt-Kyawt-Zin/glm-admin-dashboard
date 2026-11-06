import { useEffect, useMemo, useState } from "react";
import { getProductVariants } from "../services/api.js";

const stockLabel = (variant) => {
  if (variant.fulfillment_type === "preorder") {
    return `Preorder · ${variant.preorder_lead_days} days`;
  }

  return `${variant.stock_quantity} in stock`;
};

export default function InventoryPage({ token }) {
  const [variants, setVariants] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getProductVariants(token);
        setVariants(data);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load inventory.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, [token]);

  const visibleVariants = useMemo(() => {
    return variants.filter((variant) => {
      if (filter === "in_stock") {
        return variant.fulfillment_type === "in_stock";
      }

      if (filter === "preorder") {
        return variant.fulfillment_type === "preorder";
      }

      if (filter === "low_stock") {
        return (
          variant.fulfillment_type === "in_stock" &&
          Number(variant.stock_quantity) <= 3
        );
      }

      return true;
    });
  }, [filter, variants]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
        Stock management
      </p>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Inventory</h1>
          <p className="mt-2 text-slate-500">
            Check sweater variants, stock quantity, and preorder availability.
          </p>
        </div>

        <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          {visibleVariants.length} variants shown
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["all", "All variants"],
          ["in_stock", "In stock"],
          ["preorder", "Preorder"],
          ["low_stock", "Low stock"],
        ].map(([value, label]) => (
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === value
                ? "bg-emerald-800 text-white"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-slate-500">Loading inventory…</p>}

      {errorMessage && (
        <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Variant</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Availability</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {visibleVariants.map((variant) => {
                const isLowStock =
                  variant.fulfillment_type === "in_stock" &&
                  Number(variant.stock_quantity) <= 3;

                return (
                  <tr
                    className="border-b border-stone-100 last:border-b-0"
                    key={variant.id}
                  >
                    <td className="px-3 py-4 font-semibold text-emerald-950">
                      {variant.product_name}
                    </td>

                    <td className="px-3 py-4 text-slate-600">
                      {variant.color} · {variant.size}
                    </td>

                    <td className="px-3 py-4 font-mono text-xs text-slate-500">
                      {variant.sku}
                    </td>

                    <td className="px-3 py-4 capitalize text-slate-700">
                      {variant.fulfillment_type.replace("_", " ")}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={
                          isLowStock
                            ? "font-bold text-amber-700"
                            : "font-semibold text-slate-700"
                        }
                      >
                        {stockLabel(variant)}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          variant.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-slate-600"
                        }`}
                      >
                        {variant.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visibleVariants.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No variants match this filter.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
