import { useEffect, useMemo, useState } from "react";
import { getProductImageUrl, getProducts } from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { Pencil, ImagePlus, Plus } from "lucide-react";

const formatText = (value) => {
  return value ? value.replaceAll("_", " ") : "—";
};

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const cleanSearchText = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !cleanSearchText ||
        product.name.toLowerCase().includes(cleanSearchText) ||
        product.category_name.toLowerCase().includes(cleanSearchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && Boolean(product.is_active)) ||
        (statusFilter === "inactive" && !Boolean(product.is_active));

      return matchesSearch && matchesStatus;
    });
  }, [products, searchText, statusFilter]);

  const activeCount = products.filter((product) =>
    Boolean(product.is_active),
  ).length;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            PRODUCT CATALOG
          </p>
          <h3 className="mt-1 text-2xl font-bold">Products</h3>
          <p className="mt-2 text-sm text-slate-600">
            Review your sweater catalog, primary images, categories, and
            availability.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="rounded-xl bg-emerald-50 px-3 py-3 text-sm">
            <span className="font-semibold text-emerald-950">
              {activeCount}
            </span>{" "}
            active of {products.length} products
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <button
              className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              onClick={() => navigate("/products/images/new")}
              type="button"
            >
              <ImagePlus size={18} strokeWidth={2.5} />
              Upload image
            </button>

            <button
              className="shrink-0 whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
              onClick={() => navigate("/products/new")}
              type="button"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add product
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-700 md:flex-1"
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by product or category..."
          type="search"
          value={searchText}
        />

        <select
          className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-700"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {isLoading && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          Loading products...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load products: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && filteredProducts.length === 0 && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          No products match your search or selected status.
        </p>
      )}

      {!isLoading && !errorMessage && filteredProducts.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const imageUrl = getProductImageUrl(product.primary_image_path);

            return (
              <article
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
                key={product.id}
              >
                <div className="flex h-48 items-center justify-center bg-stone-100">
                  {imageUrl ? (
                    <img
                      alt={product.name}
                      className="h-full w-full object-cover"
                      src={imageUrl}
                    />
                  ) : (
                    <p className="text-sm text-slate-500">No primary image</p>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-amber-700">
                        {product.category_name}
                      </p>
                      <h4 className="mt-1 text-lg font-bold text-emerald-950">
                        {product.name}
                      </h4>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {product.description || "No description added yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-stone-100 px-3 py-1 font-medium capitalize text-slate-700">
                      {formatText(product.target_gender)}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-slate-700">
                      /{product.slug}
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                      onClick={() => navigate(`/products/${product.id}`)}
                      type="button"
                    >
                      <Pencil size={16} strokeWidth={2.5} />
                      Edit product
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
