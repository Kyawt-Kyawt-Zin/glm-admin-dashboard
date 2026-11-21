import { useEffect, useState } from "react";
import { ArrowLeft, Eye, PackageOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomerOrderHistory } from "../services/api.js";

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(Number(amount));
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
    picked_up: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-rose-100 text-rose-800",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

function CustomerOrderHistoryPage({ token }) {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomerHistory = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const historyData = await getCustomerOrderHistory(token, customerId);

        setHistory(historyData);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load customer history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerHistory();
  }, [customerId, token]);

  if (isLoading) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading customer history...
      </p>
    );
  }

  if (errorMessage || !history) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate("/customers")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to customers
        </button>

        <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load customer history:{" "}
          {errorMessage || "Customer not found"}
        </p>
      </section>
    );
  }

  const { customer, orders = [] } = history;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate("/customers")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to customers
        </button>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              CUSTOMER RECORD
            </p>

            <h3 className="mt-1 text-2xl font-bold text-emerald-950">
              {customer.full_name}
            </h3>

            <p className="mt-2 text-sm text-slate-600">{customer.email}</p>

            <p className="mt-1 text-sm text-slate-600">
              {customer.phone || "No phone number provided"}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                customer.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {customer.is_active ? "Active account" : "Inactive account"}
            </span>

            <p className="mt-3 text-sm text-slate-500">
              Joined {formatDate(customer.created_at)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              ORDER HISTORY
            </p>

            <h3 className="mt-1 text-2xl font-bold text-emerald-950">
              Customer orders
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 sm:self-auto">
            <PackageOpen aria-hidden="true" size={18} />
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
            This customer has not placed any orders yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Fulfillment</th>
                  <th className="px-4 py-3 font-semibold">Order status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    className="border-b border-stone-100 last:border-b-0 hover:bg-emerald-50/50"
                    key={order.id}
                  >
                    <td className="px-4 py-4 font-semibold text-emerald-950">
                      {order.order_number}
                    </td>

                    <td className="px-4 py-4 capitalize text-slate-600">
                      {formatText(order.fulfillment_type)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                          order.status,
                        )}`}
                      >
                        {formatText(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 capitalize text-slate-600">
                      {formatText(order.payment_status)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-emerald-950">
                      {formatCurrency(order.total_amount)}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        aria-label={`View order ${order.order_number}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800 text-emerald-900 transition hover:bg-emerald-50"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        title="View order details"
                        type="button"
                      >
                        <Eye aria-hidden="true" size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerOrderHistoryPage;
