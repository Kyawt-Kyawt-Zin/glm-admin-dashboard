import { useEffect, useState } from "react";
import { getProductVariants } from "../services/api.js";

const stockLabel = (variant) => {
  if (variant.fulfillment_type === "preorder") {
    return `Preorder · ${variant.preorder_lead_days} days`;
  }

  return `${variant.stock_quantity} in stock`;
};
const PAGE_LIMIT = 2;

const getVisiblePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push("left-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("right-ellipsis");
  }

  pages.push(totalPages);

  return pages;
};

export default function InventoryPage({ token }) {
  const [variants, setVariants] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const visiblePageNumbers = getVisiblePageNumbers(
    pagination.page,
    pagination.totalPages,
  );

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const filterOptions =
          filter === "in_stock"
            ? { fulfillmentType: "in_stock" }
            : filter === "preorder"
              ? { fulfillmentType: "preorder" }
              : filter === "low_stock"
                ? { lowStock: true }
                : {};

        const data = await getProductVariants(token, {
          page,
          limit: PAGE_LIMIT,
          search: searchTerm,
          ...filterOptions,
        });

        setVariants(data.items);
        setPagination(data.pagination);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load inventory.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, [filter, page, searchTerm, token]);

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
          {pagination.total} variants found
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
              {variants.map((variant) => {
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

          {variants.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No variants match this filter.
            </p>
          )}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages} ·{" "}
                {pagination.total} variants
              </p>

              <div className="flex items-center gap-1">
                <button
                  aria-label="Previous page"
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pagination.page === 1}
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  type="button"
                >
                  ‹
                </button>

                {visiblePageNumbers.map((pageNumber) => {
                  if (typeof pageNumber === "string") {
                    return (
                      <span className="px-2 text-slate-400" key={pageNumber}>
                        …
                      </span>
                    );
                  }

                  return (
                    <button
                      aria-label={`Go to page ${pageNumber}`}
                      className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                        pageNumber === pagination.page
                          ? "bg-emerald-800 text-white"
                          : "border border-stone-300 text-slate-700 hover:bg-stone-100"
                      }`}
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      type="button"
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  aria-label="Next page"
                  className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  type="button"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
