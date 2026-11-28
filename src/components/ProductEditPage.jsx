import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Pencil,
  Plus,
  Power,
  Star,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategories,
  getProductById,
  getProductImageUrl,
  getProductImages,
  getProductVariantsByProductId,
  deleteProductImage,
  updateProductImage,
  updateProduct,
  updateProductVariant,
  updateProductVariantStatus,
} from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

const genderOptions = ["men", "women", "unisex"];

export default function ProductEditPage({ token }) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
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
  const [imageActionId, setImageActionId] = useState(null);
  const [imageMessage, setImageMessage] = useState("");
  const [imageErrorMessage, setImageErrorMessage] = useState("");
  const [pendingDeleteImageId, setPendingDeleteImageId] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    color: "",
    size: "",
    sku: "",
    price: "",
    fulfillmentType: "in_stock",
    stockQuantity: "0",
    preorderLeadDays: "14",
  });
  const [variantMessage, setVariantMessage] = useState("");
  const [variantMessageTone, setVariantMessageTone] = useState("success");
  const [variantErrorMessage, setVariantErrorMessage] = useState("");
  const [isVariantSaving, setIsVariantSaving] = useState(false);
  const [variantActionId, setVariantActionId] = useState(null);

  useEffect(() => {
    const loadProductPage = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const [productData, categoriesData, variantsData, imagesData] =
          await Promise.all([
            getProductById(productId),
            getCategories(),
            getProductVariantsByProductId(productId),
            getProductImages(productId),
          ]);

        setProduct(productData);
        setCategories(categoriesData);
        setVariants(variantsData.variants);
        setImages(imagesData);

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

  const reloadImages = async () => {
    const imagesData = await getProductImages(product.id);
    setImages(imagesData);
  };

  const reloadVariants = async () => {
    const variantsData = await getProductVariantsByProductId(product.id);
    setVariants(variantsData.variants);
  };

  const updateVariantForm = (field, value) => {
    setVariantForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const startVariantEdit = (variant) => {
    setEditingVariant(variant);
    setVariantMessage("");
    setVariantErrorMessage("");

    setVariantForm({
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      price: String(variant.price),
      fulfillmentType: variant.fulfillment_type,
      stockQuantity: String(variant.stock_quantity),
      preorderLeadDays: String(variant.preorder_lead_days || 14),
    });
  };

  const cancelVariantEdit = () => {
    setEditingVariant(null);
    setVariantErrorMessage("");
  };

  const handleSaveVariant = async (event) => {
    event.preventDefault();

    if (!editingVariant) {
      return;
    }

    try {
      setVariantErrorMessage("");
      setVariantMessage("");
      setIsVariantSaving(true);

      await updateProductVariant(token, editingVariant.id, {
        productId: product.id,
        color: variantForm.color.trim(),
        size: variantForm.size.trim(),
        sku: variantForm.sku.trim(),
        price: Number(variantForm.price),
        fulfillmentType: variantForm.fulfillmentType,
        stockQuantity:
          variantForm.fulfillmentType === "preorder"
            ? 0
            : Number(variantForm.stockQuantity),
        preorderLeadDays:
          variantForm.fulfillmentType === "preorder"
            ? Number(variantForm.preorderLeadDays)
            : null,
        isActive: Boolean(editingVariant.is_active),
      });

      await reloadVariants();

      setEditingVariant(null);
      setVariantMessageTone("success");
      setVariantMessage(
        `${variantForm.color.trim()} · ${variantForm.size.trim()} was updated successfully.`,
      );
    } catch (error) {
      setVariantErrorMessage(
        error.message || "Unable to update this product variant.",
      );
    } finally {
      setIsVariantSaving(false);
    }
  };

  const handleVariantStatusChange = async (variant) => {
    const nextIsActive = !Boolean(variant.is_active);
    const actionLabel = nextIsActive ? "activate" : "deactivate";

    const shouldContinue = window.confirm(
      `Do you want to ${actionLabel} ${variant.color} · ${variant.size}?`,
    );

    if (!shouldContinue) {
      return;
    }

    try {
      setVariantActionId(variant.id);
      setVariantErrorMessage("");
      setVariantMessage("");

      await updateProductVariantStatus(token, variant.id, nextIsActive);

      await reloadVariants();

      setVariantMessageTone(nextIsActive ? "success" : "inactive");
      setVariantMessage(
        `${variant.color} · ${variant.size} is now ${
          nextIsActive ? "active" : "inactive"
        }.`,
      );
    } catch (error) {
      setVariantErrorMessage(
        error.message || "Unable to update this variant status.",
      );
    } finally {
      setVariantActionId(null);
    }
  };

  const saveImageDetails = async (image, changes, successText) => {
    try {
      setImageActionId(image.id);
      setImageErrorMessage("");
      setImageMessage("");

      await updateProductImage(token, product.id, image.id, {
        altText: image.alt_text || "",
        sortOrder: image.sort_order,
        isPrimary: Boolean(changes.isPrimary ?? image.is_primary),
        variantId:
          changes.variantId === undefined
            ? image.product_variant_id
            : changes.variantId,
      });

      await reloadImages();
      setImageMessage(successText);
    } catch (error) {
      setImageErrorMessage(error.message || "Unable to update this image.");
    } finally {
      setImageActionId(null);
    }
  };

  const handleDeleteImage = async (image) => {
    try {
      setImageActionId(image.id);
      setImageErrorMessage("");
      setImageMessage("");

      await deleteProductImage(token, product.id, image.id);

      await reloadImages();
      setPendingDeleteImageId(null);
      setImageMessage("Image removed from the product.");
    } catch (error) {
      setImageErrorMessage(error.message || "Unable to delete this image.");
    } finally {
      setImageActionId(null);
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

        {variantErrorMessage && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {variantErrorMessage}
          </p>
        )}

        {variantMessage && (
          <p role="status" className={`mt-5 rounded-xl px-4 py-3 text-sm ${variantMessageTone === "inactive" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
            {variantMessage}
          </p>
        )}

        {editingVariant && (
          <form
            className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
            onSubmit={handleSaveVariant}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold tracking-wide text-emerald-800">
                  EDIT VARIANT
                </p>
                <h5 className="mt-1 text-lg font-bold text-emerald-950">
                  {editingVariant.color} · {editingVariant.size}
                </h5>
              </div>

              <button
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                onClick={cancelVariantEdit}
                type="button"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Colour
                <input
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                  onChange={(event) =>
                    updateVariantForm("color", event.target.value)
                  }
                  required
                  value={variantForm.color}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Size
                <input
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                  onChange={(event) =>
                    updateVariantForm("size", event.target.value)
                  }
                  required
                  value={variantForm.size}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                SKU
                <input
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 uppercase outline-none focus:border-emerald-600"
                  onChange={(event) =>
                    updateVariantForm("sku", event.target.value)
                  }
                  required
                  value={variantForm.sku}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Price (AED)
                <input
                  className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                  min="0.25"
                  onChange={(event) =>
                    updateVariantForm("price", event.target.value)
                  }
                  required
                  step="0.25"
                  type="number"
                  value={variantForm.price}
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Fulfilment type
                <span className="relative mt-2 block"><select
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 appearance-none pr-16"
                  onChange={(event) => {
                    const fulfillmentType = event.target.value;

                    setVariantForm((currentForm) => ({
                      ...currentForm,
                      fulfillmentType,
                      stockQuantity:
                        fulfillmentType === "preorder"
                          ? "0"
                          : currentForm.stockQuantity,
                    }));
                  }}
                  value={variantForm.fulfillmentType}
                >
                  <option value="in_stock">In stock</option>
                  <option value="preorder">Preorder</option>
                </select><SelectChevron /></span>
              </label>

              {variantForm.fulfillmentType === "preorder" ? (
                <label className="text-sm font-semibold text-slate-700">
                  Preorder lead days
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                    max="45"
                    min="1"
                    onChange={(event) =>
                      updateVariantForm("preorderLeadDays", event.target.value)
                    }
                    required
                    type="number"
                    value={variantForm.preorderLeadDays}
                  />
                </label>
              ) : (
                <label className="text-sm font-semibold text-slate-700">
                  Stock quantity
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-600"
                    min="0"
                    onChange={(event) =>
                      updateVariantForm("stockQuantity", event.target.value)
                    }
                    required
                    type="number"
                    value={variantForm.stockQuantity}
                  />
                </label>
              )}
            </div>

            <button
              className="mt-5 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isVariantSaving}
              type="submit"
            >
              {isVariantSaving ? "Saving variant..." : "Save variant changes"}
            </button>
          </form>
        )}

        {variants.length === 0 ? (
          <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
            This product has no variants yet. Add its first colour and size
            option.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Colour</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Availability</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Edit ${variant.color} ${variant.size}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={
                            isVariantSaving || variantActionId === variant.id
                          }
                          onClick={() => startVariantEdit(variant)}
                          title="Edit variant"
                          type="button"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          aria-label={
                            variant.is_active
                              ? `Deactivate ${variant.color} ${variant.size}`
                              : `Activate ${variant.color} ${variant.size}`
                          }
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            variant.is_active
                              ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                              : "border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                          }`}
                          disabled={
                            isVariantSaving || variantActionId === variant.id
                          }
                          onClick={() => handleVariantStatusChange(variant)}
                          title={
                            variant.is_active
                              ? "Deactivate variant"
                              : "Activate variant"
                          }
                          type="button"
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-stone-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              IMAGE MANAGEMENT
            </p>
            <h4 className="mt-1 text-xl font-bold text-emerald-950">
              Product images
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Link each photo to the whole product or its exact colour and size.
            </p>
          </div>

          <button
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            onClick={() =>
              navigate(`/products/images/new?productId=${product.id}`)
            }
            type="button"
          >
            <ImagePlus size={18} strokeWidth={2.5} />
            Upload image
          </button>
        </div>

        {imageErrorMessage && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {imageErrorMessage}
          </p>
        )}

        {imageMessage && (
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {imageMessage}
          </p>
        )}

        {images.length === 0 ? (
          <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
            No images have been uploaded for this sweater yet.
          </p>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {images.map((image) => {
              const isDeleting = pendingDeleteImageId === image.id;
              const isWorking = imageActionId === image.id;

              return (
                <article
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
                  key={image.id}
                >
                  <img
                    alt={image.alt_text || `${product.name} product image`}
                    className="h-52 w-full object-cover"
                    src={getProductImageUrl(image.image_path)}
                  />

                  <div className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-emerald-950">
                        {image.is_primary
                          ? "Catalog cover image"
                          : "Additional image"}
                      </p>

                      {image.is_primary && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                          <Star size={14} fill="currentColor" />
                          Cover
                        </span>
                      )}
                    </div>

                    <label
                      className="mt-4 block text-sm font-semibold text-slate-700"
                      htmlFor={`imageVariant-${image.id}`}
                    >
                      Linked to
                    </label>

                    <div className="relative mt-2">
                      <select
                        className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 text-sm text-slate-800 outline-none focus:border-emerald-600 disabled:cursor-not-allowed disabled:bg-stone-100"
                        disabled={isWorking}
                        id={`imageVariant-${image.id}`}
                        onChange={(event) =>
                          saveImageDetails(
                            image,
                            { variantId: event.target.value || null },
                            "Image assignment updated successfully.",
                          )
                        }
                        value={image.product_variant_id || ""}
                      >
                        <option value="">
                          Whole product (not colour-specific)
                        </option>
                        {variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.color} · {variant.size}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {image.alt_text || "No image description has been added."}
                    </p>

                    {isDeleting ? (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          Remove this image from the product?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700">
                          It will disappear from the dashboard and customer
                          shop. Images stored in S3 remain in storage.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-100"
                            disabled={isWorking}
                            onClick={() => setPendingDeleteImageId(null)}
                            type="button"
                          >
                            Keep image
                          </button>
                          <button
                            className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isWorking}
                            onClick={() => handleDeleteImage(image)}
                            type="button"
                          >
                            {isWorking ? "Removing..." : "Remove image"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {!image.is_primary && (
                          <button
                            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isWorking}
                            onClick={() =>
                              saveImageDetails(
                                image,
                                { isPrimary: true },
                                "Catalog cover image updated successfully.",
                              )
                            }
                            type="button"
                          >
                            <Star size={16} />
                            {isWorking ? "Updating..." : "Set as cover"}
                          </button>
                        )}

                        <button
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => setPendingDeleteImageId(image.id)}
                          type="button"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
