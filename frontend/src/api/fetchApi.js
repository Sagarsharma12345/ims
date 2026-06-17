const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Something went wrong");
  }

  return json.data;
}

// Products EndPoint
export const getProducts = () => request("/products");
export const createProduct = (body) =>
  request("/products", { method: "POST", body: JSON.stringify(body) });
export const updateProduct = (id, body) =>
  request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: "DELETE" });

// Customer Endpoint
export const getCustomers = () => request("/customers");
export const createCustomer = (body) =>
  request("/customers", { method: "POST", body: JSON.stringify(body) });
export const deleteCustomer = (id) =>
  request(`/customers/${id}`, { method: "DELETE" });

// Orders Enpoint
export const getOrders = () => request("/orders");
export const getOrder = (id) => request(`/orders/${id}`);
export const createOrder = (body) =>
  request("/orders", { method: "POST", body: JSON.stringify(body) });
export const deleteOrder = (id) =>
  request(`/orders/${id}`, { method: "DELETE" });

// Dashboard Endpoint
export const getDashboard = () => request("/dashboard/summary");
