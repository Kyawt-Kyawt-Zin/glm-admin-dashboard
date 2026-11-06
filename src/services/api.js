const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong");
  }

  return result.data;
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
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to update order status");
  }

  return result.data;
};

export const correctOrderStatus = async (token, orderId, status, reason) => {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/status-correction`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, reason }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to correct order status");
  }

  return result.data;
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

export const getProductVariants = async (token) => {
  return request("/product-variants", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
