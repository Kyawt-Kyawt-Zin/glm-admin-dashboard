import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getConfirmedPreorderItems, getReceivedPreorderItems } from "../services/api.js";

export default function PreorderReminders({ token }) {
  const [items, setItems] = useState([]);
  const [receivedItems, setReceivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getConfirmedPreorderItems(token), getReceivedPreorderItems(token)])
      .then(([confirmed, received]) => { if (active) { setItems(confirmed); setReceivedItems(received); setError(""); } })
      .catch((err) => { if (active) setError(err.message || "Unable to load preorder reminders."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const orders = useMemo(() => {
    const grouped = new Map();
    for (const item of items) {
      if (!grouped.has(item.order_id)) grouped.set(item.order_id, { id: item.order_id, number: item.order_number, items: [] });
      grouped.get(item.order_id).items.push(item);
    }
    return [...grouped.values()];
  }, [items]);
  const units = items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity || 0) - Number(item.preorder_received_quantity || 0)), 0);
  const receivedUnits = receivedItems.reduce((sum, item) => sum + Number(item.preorder_received_quantity || 0), 0);

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-700">PREORDER REMINDERS</p>
          <h3 className="mt-1 text-xl font-bold text-emerald-950">Confirmed preorders to order</h3>
          <p className="mt-1 text-sm text-slate-600">After placing the supplier order, open the customer order and move it to Processing.</p>
        </div>
        {!loading && !error && <p className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">{orders.length} {orders.length === 1 ? "order" : "orders"} · {units} {units === 1 ? "item" : "items"}</p>}
      </div>
      {loading && <p className="mt-5 text-sm text-slate-500">Loading preorder reminders…</p>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!loading && !error && orders.length === 0 && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No confirmed preorders are waiting to be ordered.</p>}
      {!loading && !error && orders.length > 0 && (
        <div className="mt-5 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-emerald-950">{order.number}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {order.items.map((item) => <li key={item.order_item_id}>{item.product_name} · {item.color} · {item.size} · To order: {Math.max(0, Number(item.quantity) - Number(item.preorder_received_quantity || 0))}</li>)}
                </ul>
              </div>
              <Link className="inline-flex min-h-10 items-center justify-center rounded-lg border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50" to={`/orders/${order.id}`}>View order</Link>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && (
        <div className="mt-7 border-t border-stone-200 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h4 className="font-bold text-emerald-950">Received and reserved</h4><p className="mt-1 text-sm text-slate-600">Items received for active customer preorders, not available shop stock.</p></div>
            <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">{receivedUnits} {receivedUnits === 1 ? "item" : "items"}</p>
          </div>
          {receivedItems.length === 0 ? <p className="mt-3 text-sm text-slate-500">No preorder items have been recorded as received.</p> : (
            <ul className="mt-3 space-y-2">
              {receivedItems.map((item) => <li key={item.order_item_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 p-3 text-sm"><span>{item.product_name} · {item.color} · {item.size} · Received {item.preorder_received_quantity} of {item.quantity}</span><Link className="font-semibold text-emerald-800 underline" to={`/orders/${item.order_id}`}>{item.order_number}</Link></li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
