import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../services/api.js";
import StatusHistoryList from "./StatusHistoryList.jsx";

function OrderStatusHistoryPage({ token }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const orderDetails = await getOrderById(token, orderId);
        setDetails(orderDetails);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderHistory();
  }, [orderId, token]);

  if (isLoading) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading status history...
      </p>
    );
  }

  if (errorMessage || !details) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate(`/orders/${orderId}`)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to order details
        </button>

        <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load status history: {errorMessage || "Order not found"}
        </p>
      </section>
    );
  }

  const { order, statusHistory = [] } = details;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate(`/orders/${orderId}`)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to order details
        </button>

        <div className="mt-5">
          <p className="text-sm font-semibold text-amber-700">
            ORDER RECORD
          </p>
          <h2 className="mt-1 text-2xl font-bold text-emerald-950">
            {order.order_number}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {order.customer_name} · {order.fulfillment_type} ·{" "}
            {order.status.replaceAll("_", " ")}
          </p>
        </div>
      </section>

      <StatusHistoryList history={statusHistory} />
    </div>
  );
}

export default OrderStatusHistoryPage;