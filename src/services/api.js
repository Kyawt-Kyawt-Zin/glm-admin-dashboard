const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  const result = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("glm-session-expired"));
    }

    throw new Error(result?.message || "Something went wrong");
  }

  return result?.data;
};

export const login = async ({ email, password }) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const getDashboardOverview = async (token) => {
  return request("/dashboard/overview", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getDashboardAnalytics = async (token, weekStart) => {
  const query = weekStart
    ? `?${new URLSearchParams({ weekStart }).toString()}`
    : "";

  return request(`/dashboard/analytics${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getRecentOrders = async (token) => {
  return request("/dashboard/recent-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLowStockVariants = async (token) => {
  return request("/dashboard/low-stock", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getOrders = async (token) => {
  return request("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getOrderById = async (token, orderId) => {
  return request(`/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateOrderStatus = async (token, orderId, status) => {
  return request(`/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
};

export const correctOrderStatus = async (token, orderId, status, reason) => {
  return request(`/orders/${orderId}/status-correction`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, reason }),
  });
};

export const getProducts = async () => {
  return request("/products");
};

export const getProductImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const backendBaseUrl = API_BASE_URL.replace(/\/api$/, "");

  return `${backendBaseUrl}${imagePath}`;
};

export const getProductVariants = async (
  token,
  {
    page = 1,
    limit = 5,
    fulfillmentType = "",
    lowStock = false,
    search = "",
  } = {},
) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (fulfillmentType) {
    query.set("fulfillmentType", fulfillmentType);
  }

  if (lowStock) {
    query.set("lowStock", "true");
  }

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return request(`/product-variants?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCategories = async () => {
  return request("/categories");
};

export const getCategoryById = async (categoryId) => {
  return request(`/categories/${categoryId}`);
};

export const createProduct = async (token, product) => {
  return request("/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
};

export const createProductVariant = async (token, variant) => {
  return request("/product-variants", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(variant),
  });
};

export const updateProductVariant = async (token, variantId, variant) => {
  return request(`/product-variants/${variantId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(variant),
  });
};

export const deactivateProductVariant = async (token, variantId) => {
  return request(`/product-variants/${variantId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProductVariantStatus = async (
  token,
  variantId,
  isActive,
) => {
  return request(`/product-variants/${variantId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
};

export const uploadProductImage = async (token, productId, formData) => {
  return request(`/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};

export const uploadProductImageToS3 = async (token, productId, imageData) => {
  const image = imageData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Choose an image file first");
  }

  if (image.size > 5 * 1024 * 1024) {
    throw new Error("The image must be 5 MB or smaller");
  }

  const upload = await request(`/products/${productId}/images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contentType: image.type,
      variantId: imageData.get("variantId"),
      altText: imageData.get("altText"),
      sortOrder: imageData.get("sortOrder"),
      isPrimary: imageData.get("isPrimary"),
    }),
  });

  const s3Form = new FormData();

  for (const [name, value] of Object.entries(upload.fields)) {
    s3Form.append(name, value);
  }

  // Add the file after the signed form fields.
  s3Form.append("file", image);

  const s3Response = await fetch(upload.uploadUrl, {
    method: "POST",
    body: s3Form,
    credentials: "omit",
  });

  if (!s3Response.ok) {
    throw new Error("Unable to upload the image to storage");
  }

  return request(`/products/${productId}/images/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      uploadId: upload.uploadId,
    }),
  });
};

export const getProductImages = async (productId) => {
  return request(`/products/${productId}/images`);
};

export const updateProductImage = async (
  token,
  productId,
  imageId,
  imageDetails,
) => {
  return request(`/products/${productId}/images/${imageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(imageDetails),
  });
};

export const deleteProductImage = async (token, productId, imageId) => {
  return request(`/products/${productId}/images/${imageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getProductVariantsByProductId = async (productId) => {
  return request(`/products/${productId}/variants`);
};

export const createCategory = async (token, category) => {
  return request("/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
};

export const updateCategory = async (token, categoryId, category) => {
  return request(`/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
};

export const updateCategoryStatus = async (token, categoryId, isActive) => {
  return request(`/categories/${categoryId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
};

export const getProductById = async (productId) => {
  return request(`/products/${productId}`);
};

export const updateProduct = async (token, productId, product) => {
  return request(`/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
};

export const getCustomers = async (
  token,
  { page = 1, limit = 5, search = "", status = "all" } = {},
) => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  if (status !== "all") {
    query.set("status", status);
  }

  return request(`/users/customers?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCustomerOrderHistory = async (token, customerId) => {
  return request(`/users/${customerId}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCustomerActiveStatus = async (
  token,
  customerId,
  isActive,
) => {
  return request(`/users/${customerId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
};

export const getFeedbackForManagement = async (token) => {
  return request("/feedback", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const reviewFeedback = async (
  token,
  feedbackId,
  { status, staffNote },
) => {
  return request(`/feedback/${feedbackId}/review`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, staffNote }),
  });
};

export const getFeedbackById = async (token, feedbackId) => {
  return request(`/feedback/${feedbackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPendingDeposits = async (token) => {
  return request("/payments/pending-deposits", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPaymentById = async (token, paymentId) => {
  return request(`/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPaymentProofBlob = async (token, paymentId) => {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/proof`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("glm-session-expired"));
    }

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : null;

    throw new Error(result?.message || "Unable to load payment proof");
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const result = await response.json();

    if (!result.url) {
      throw new Error("Unable to load payment proof");
    }

    const imageResponse = await fetch(result.url, {
      credentials: "omit",
      cache: "no-store",
    });

    if (!imageResponse.ok) {
      throw new Error("Unable to load payment proof from storage");
    }

    return imageResponse.blob();
  }

  return response.blob();
};

export const confirmDeposit = async (
  token,
  paymentId,
  { transactionReference, notes },
) => {
  return request(`/payments/${paymentId}/confirm`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionReference, notes }),
  });
};

export const getRefundPendingPayments = async (token) => {
  return request("/payments/refund-pending", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const refundDeposit = async (
  token,
  paymentId,
  { refundReference, refundNotes },
) => {
  return request(`/payments/${paymentId}/refund`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refundReference, refundNotes }),
  });
};

export const getOrderChangeRequests = async (token) => {
  return request("/order-change-requests", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getOrderChangeRequestById = async (token, requestId) => {
  return request(`/order-change-requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const reviewOrderChangeRequest = async (
  token,
  requestId,
  { status, staffComment },
) => {
  return request(`/order-change-requests/${requestId}/review`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      staffComment,
    }),
  });
};

export const getBankAccountsForManagement = async (token) => {
  return request("/bank-accounts/management", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createBankAccount = async (token, account) => {
  return request("/bank-accounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(account),
  });
};

export const updateBankAccount = async (token, accountId, account) => {
  return request(`/bank-accounts/${accountId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(account),
  });
};

export const updateBankAccountStatus = async (token, accountId, isActive) => {
  return request(`/bank-accounts/${accountId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });
};
