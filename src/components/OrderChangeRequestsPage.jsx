import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOrderChangeRequests } from "../services/api.js";

const requestTypeLabel = (requestType) => {
  if (requestType === "change_variant") {
    return "Change variant";
  }

  if (requestType === "cancel_order") {
    return "Cancel order";
  }

  return requestType || "Unknown";
};

const requestStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

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

export default function OrderChangeRequestsPage({
  token,
  onRequestTasksChanged,
}) {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getOrderChangeRequests(token);
        setRequests(data);
        onRequestTasksChanged?.();
      } catch (error) {
        setErrorMessage(
          error.message || "Unable to load order change requests.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [token, onRequestTasksChanged]);

  const pendingRequests = useMemo(() => {
    return requests.filter((request) => request.status === "pending");
  }, [requests]);

  const completedRequests = useMemo(() => {
    return requests.filter((request) =>
      ["approved", "rejected"].includes(request.status),
    );
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (activeTab === "pending") {
      return pendingRequests;
    }

    if (activeTab === "completed") {
      return completedRequests;
    }

    return requests;
  }, [activeTab, completedRequests, pendingRequests, requests]);

  const tabs = [
    {
      id: "pending",
      label: "Pending",
      count: pendingRequests.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedRequests.length,
    },
    {
      id: "all",
      label: "All requests",
      count: requests.length,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
              Customer request management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-emerald-950">
              Order change requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review cancellation and variant-change requests. Pending items
              need action; completed items remain available as business history.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 self-start rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            <ClipboardList size={20} strokeWidth={2.25} />

            <span>
              {pendingRequests.length} pending{" "}
              {pendingRequests.length === 1 ? "request" : "requests"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {errorMessage && (
          <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        {isLoading && (
          <p className="mt-6 rounded-xl bg-stone-50 p-5 text-sm text-slate-500">
            Loading order change requests...
          </p>
        )}

        {!isLoading && !errorMessage && visibleRequests.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-12 text-center">
            <ClipboardList
              className="mx-auto text-emerald-700"
              size={32}
              strokeWidth={1.8}
            />

            <h2 className="mt-4 text-lg font-bold text-emerald-950">
              No {activeTab === "all" ? "" : activeTab} requests
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "pending"
                ? "There are no customer requests waiting for review."
                : "No request records match this view."}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && visibleRequests.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-4 font-semibold">Customer</th>
                  <th className="px-3 py-4 font-semibold">Order</th>
                  <th className="px-3 py-4 font-semibold">Request</th>
                  <th className="px-3 py-4 font-semibold">Status</th>
                  <th className="px-3 py-4 font-semibold">Received</th>
                  <th className="px-3 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {visibleRequests.map((request) => (
                  <tr
                    className="border-b border-stone-100 last:border-b-0"
                    key={request.id}
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-emerald-950">
                        {request.customer_name || "Customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {request.customer_email || "—"}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-semibold text-emerald-950">
                        {request.order_number || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {request.fulfillment_type === "preorder"
                          ? "Preorder"
                          : "In stock"}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-700">
                        {requestTypeLabel(request.request_type)}
                      </p>

                      <p className="mt-1 max-w-52 truncate text-xs text-slate-500">
                        {request.customer_note || "No customer note"}
                      </p>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${requestStatusStyle(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-500">
                      {formatDate(request.created_at)}
                    </td>

                    <td className="px-3 py-4 text-right">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                        onClick={() =>
                          navigate(`/order-change-requests/${request.id}`)
                        }
                        type="button"
                      >
                        <Eye size={17} strokeWidth={2.25} />
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
