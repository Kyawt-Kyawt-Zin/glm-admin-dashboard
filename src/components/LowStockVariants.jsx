import { useEffect, useState } from "react";
import { getLowStockVariants } from "../services/api.js";

function LowStockVariants({ token }) {
  const [variants, setVariants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadLowStockVariants = async () => {
      try {
        setErrorMessage("");

        const variantsData = await getLowStockVariants(token);
        setVariants(variantsData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadLowStockVariants();
  }, [token]);

  return (
    <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-amber-700">
          INVENTORY ATTENTION
        </p>
        <h3 className="mt-1 text-xl font-bold">Low-stock variants</h3>
        <p className="mt-1 text-sm text-slate-500">
          Active in-stock variants with three or fewer items remaining.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load low-stock variants: {errorMessage}
        </p>
      )}

      {!errorMessage && variants.length === 0 && (
        <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          Good news: all active in-stock variants have more than three items.
        </p>
      )}

      {!errorMessage && variants.length > 0 && (
        <div className="space-y-3">
          {variants.map((variant) => (
            <article
              className="flex flex-col gap-3 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={variant.variant_id}
            >
              <div>
                <p className="font-semibold text-emerald-950">
                  {variant.product_name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {variant.category_name} · {variant.color} · {variant.size}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  SKU: {variant.sku}
                </p>
              </div>

              <div className="rounded-lg bg-amber-100 px-4 py-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-amber-950">
                  {variant.stock_quantity}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default LowStockVariants;
