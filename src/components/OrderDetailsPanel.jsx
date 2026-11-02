import { useState } from "react";
import { updateOrderStatus } from "../services/api.js";

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

const getNextStatus = (order) => {
  const nextStatusByCurrentStatus = {
    pending: "confirmed",
    confirmed: "processing",
    ready_for_delivery: "out_for_delivery",
    out_for_delivery: "delivered",
    ready_for_pickup: "picked_up",
  };

  if (order.status === "processing") {
    return order.delivery_method === "pickup"
      ? "ready_for_pickup"
      : "ready_for_delivery";
  }

  return nextStatusByCurrentStatus[order.status] || null;
};

function OrderDetailsPanel({ details, onClose, token, onStatusUpdated }) {
  const { order, items, payments } = details;

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConfirmingStatus, setIsConfirmingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const nextStatus = getNextStatus(order);
  const isPreorderWaitingForDeposit =
    order.fulfillment_type === "preorder" &&
    order.status === "pending" &&
    order.payment_status !== "deposit_confirmed";

  const handleAdvanceStatus = () => {
    if (nextStatus) {
      setStatusError("");
      setIsConfirmingStatus(true);
    }
  };

  const handleConfirmStatus = async () => {
    try {
      setStatusError("");
      setIsUpdatingStatus(true);

      await updateOrderStatus(token, order.id, nextStatus);
      await onStatusUpdated(order.id);
      setIsConfirmingStatus(false);
    } catch (error) {
      setStatusError(error.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-emerald-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">ORDER DETAILS</p>
          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            {order.order_number}
          </h3>
          <p className="mt-1 text-sm capitalize text-slate-600">
            {formatText(order.fulfillment_type)} · {formatText(order.status)}
          </p>
        </div>

        <button
          className="rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          onClick={onClose}
          type="button"
        >
          Close details
        </button>
      </div>

      {statusError && (
        <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Unable to update order status: {statusError}
        </p>
      )}

      {isPreorderWaitingForDeposit && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This preorder cannot be confirmed yet. Staff must confirm the 20%
          deposit payment first.
        </div>
      )}

      {nextStatus && !isPreorderWaitingForDeposit && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Next operational action
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Move this order to:{" "}
              <span className="font-semibold capitalize">
                {formatText(nextStatus)}
              </span>
            </p>
          </div>

          <button
            className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            onClick={handleAdvanceStatus}
            type="button"
          >
            Review update
          </button>
        </div>
      )}

      {isConfirmingStatus && nextStatus && (
        <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-800">
            Confirm order status update
          </p>

          <p className="mt-2 text-sm text-slate-700">
            You are about to change this order from{" "}
            <span className="font-semibold capitalize">
              {formatText(order.status)}
            </span>{" "}
            to{" "}
            <span className="font-semibold capitalize">
              {formatText(nextStatus)}
            </span>
            .
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Please check the order details before confirming. A future status
            correction will require an admin reason.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdatingStatus}
              onClick={() => setIsConfirmingStatus(false)}
              type="button"
            >
              Cancel
            </button>

            <button
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUpdatingStatus}
              onClick={handleConfirmStatus}
              type="button"
            >
              {isUpdatingStatus
                ? "Updating..."
                : `Yes, mark as ${formatText(nextStatus)}`}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl bg-white p-4">
          <h4 className="font-semibold text-emerald-950">Customer</h4>
          <p className="mt-3 font-medium">{order.customer_name}</p>
          <p className="mt-1 text-sm text-slate-600">{order.customer_email}</p>
          <p className="mt-1 text-sm text-slate-600">{order.customer_phone}</p>
        </article>

        <article className="rounded-xl bg-white p-4">
          <h4 className="font-semibold text-emerald-950">Delivery or pickup</h4>
          <p className="mt-3 text-sm capitalize">
            {formatText(order.delivery_method)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {order.delivery_address ||
              order.pickup_time_slot ||
              "No address recorded"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Zone: {order.delivery_zone_name || "Pickup"}
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total
          </p>
          <p className="mt-2 text-xl font-bold">
            {formatCurrency(order.total_amount)}
          </p>
        </article>

        <article className="rounded-xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payment status
          </p>
          <p className="mt-2 text-lg font-bold capitalize">
            {formatText(order.payment_status)}
          </p>
        </article>

        <article className="rounded-xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Created
          </p>
          <p className="mt-2 text-sm font-medium">
            {formatDate(order.created_at)}
          </p>
        </article>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-emerald-950">Items</h4>

        <div className="mt-3 overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Line total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  className="border-b border-stone-100 last:border-b-0"
                  key={item.id}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.sku}</p>
                  </td>
                  <td className="px-4 py-3">
                    {item.color} · {item.size}
                  </td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-emerald-950">Payment records</h4>

        <div className="mt-3 overflow-x-auto rounded-xl bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  className="border-b border-stone-100 last:border-b-0"
                  key={payment.id}
                >
                  <td className="px-4 py-3 capitalize">
                    {formatText(payment.payment_type)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {formatText(payment.payment_method)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {formatText(payment.status)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default OrderDetailsPanel;
