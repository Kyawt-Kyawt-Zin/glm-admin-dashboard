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

export const getDashboardAnalytics = async (token) => {
  return request("/dashboard/analytics", {
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

export const uploadProductImage = async (token, productId, formData) => {
  return request(`/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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
