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

function OrderDetailsPanel({ details, onClose }) {
  const { order, items, payments } = details;

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
