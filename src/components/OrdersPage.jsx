import { useEffect, useState } from "react";
import { getOrderById, getOrders } from "../services/api.js";
import OrderDetailsPanel from "./OrderDetailsPanel.jsx";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
};

const formatDate = (dateValue) => {
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
};

const formatText = (value) => {
  return value ? value.replaceAll("_", " ") : "—";
};

const statusStyle = (status) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-violet-100 text-violet-800",
    ready_for_delivery: "bg-cyan-100 text-cyan-800",
    out_for_delivery: "bg-sky-100 text-sky-800",
    ready_for_pickup: "bg-indigo-100 text-indigo-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

function OrdersPage({ token }) {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setErrorMessage("");

        const ordersData = await getOrders(token);
        setOrders(ordersData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadOrders();
  }, [token]);

  const handleViewDetails = async (orderId) => {
    try {
      setDetailsError("");
      setSelectedOrderDetails(null);
      setIsDetailsLoading(true);

      const detailsData = await getOrderById(token, orderId);
      setSelectedOrderDetails(detailsData);
    } catch (error) {
      setDetailsError(error.message);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-amber-700">ORDER MANAGEMENT</p>
        <h3 className="mt-1 text-2xl font-bold">All orders</h3>
        <p className="mt-2 text-sm text-slate-600">
          Review customer orders, payment status, and delivery progress.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load orders: {errorMessage}
        </p>
      )}

      {!errorMessage && orders.length === 0 && (
        <p className="rounded-lg bg-stone-50 p-4 text-sm text-slate-600">
          No orders have been created yet.
        </p>
      )}

      {!errorMessage && orders.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Fulfillment</th>
                  <th className="px-3 py-3 font-semibold">Order status</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-3 py-3 font-semibold">Delivery</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Created</th>
                  <th className="px-3 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    className={`border-b border-stone-100 last:border-b-0 ${
                      selectedOrderDetails?.order.id === order.id
                        ? "bg-emerald-50"
                        : "hover:bg-stone-50"
                    }`}
                    key={order.id}
                  >
                    <td className="px-3 py-4 font-semibold text-emerald-950">
                      {order.order_number}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.customer_email}
                      </p>
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {formatText(order.fulfillment_type)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                          order.status,
                        )}`}
                      >
                        {formatText(order.status)}
                      </span>
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {formatText(order.payment_status)}
                    </td>
                    <td className="px-3 py-4 capitalize">
                      {formatText(order.delivery_method)}
                    </td>
                    <td className="px-3 py-4 font-semibold">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-3 py-4">
                      <button
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          selectedOrderDetails?.order.id === order.id
                            ? "bg-emerald-900 text-white"
                            : "border border-emerald-800 text-emerald-900 hover:bg-emerald-50"
                        }`}
                        onClick={() => handleViewDetails(order.id)}
                        type="button"
                      >
                        {selectedOrderDetails?.order.id === order.id
                          ? "Viewing"
                          : "View details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isDetailsLoading && (
            <p className="mt-5 text-sm text-slate-500">
              Loading order details...
            </p>
          )}

          {detailsError && (
            <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              Unable to load order details: {detailsError}
            </p>
          )}

          {selectedOrderDetails && (
            <OrderDetailsPanel
              details={selectedOrderDetails}
              onClose={() => setSelectedOrderDetails(null)}
            />
          )}
        </>
      )}
    </section>
  );
}

export default OrdersPage;
