import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById } from "../services/api.js";
import OrderDetailsPanel from "./OrderDetailsPanel.jsx";

function OrderDetailsPage({ token, currentUser, onPendingOrdersChanged }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderDetails = async () => {
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

    loadOrderDetails();
  }, [orderId, token]);

  const handleStatusUpdated = async (updatedOrderId) => {
    const updatedDetails = await getOrderById(token, updatedOrderId);
    setDetails(updatedDetails);
    onPendingOrdersChanged?.();
  };

  if (isLoading) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading order details...
      </p>
    );
  }

  if (errorMessage || !details) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate("/orders")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to orders
        </button>

        <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to load this order: {errorMessage || "Order not found"}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          onClick={() => navigate(`/orders/${orderId}/history`)}
          type="button"
        >
          <BookOpen aria-hidden="true" className="h-4 w-4" />
          View status history
        </button>
      </div>

      <OrderDetailsPanel
        currentUser={currentUser}
        details={details}
        onClose={() => navigate("/orders")}
        onStatusUpdated={handleStatusUpdated}
        token={token}
      />
    </div>
  );
}

export default OrderDetailsPage;
