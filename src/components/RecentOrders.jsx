import { useEffect, useState } from "react";
import { getRecentOrders } from "../services/api.js";

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
  return value.replaceAll("_", " ");
};

function RecentOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        setErrorMessage("");

        const ordersData = await getRecentOrders(token);
        setOrders(ordersData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadRecentOrders();
  }, [token]);

  return (
    <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-amber-700">LATEST ACTIVITY</p>
        <h3 className="mt-1 text-xl font-bold">Recent orders</h3>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load recent orders: {errorMessage}
        </p>
      )}

      {!errorMessage && orders.length === 0 && (
        <p className="py-6 text-sm text-slate-500">
          No orders have been created yet.
        </p>
      )}

      {!errorMessage && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Order</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Payment</th>
                <th className="px-3 py-3 font-semibold">Total</th>
                <th className="px-3 py-3 font-semibold">Created</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  className="border-b border-stone-100 last:border-b-0"
                  key={order.id}
                >
                  <td className="px-3 py-4 font-semibold text-emerald-950">
                    {order.order_number}
                  </td>
                  <td className="px-3 py-4">{order.customer_name}</td>
                  <td className="px-3 py-4 capitalize">
                    {formatText(order.fulfillment_type)}
                  </td>
                  <td className="px-3 py-4 capitalize">
                    {formatText(order.payment_status)}
                  </td>
                  <td className="px-3 py-4 font-semibold">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-3 py-4 text-slate-500">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecentOrders;
