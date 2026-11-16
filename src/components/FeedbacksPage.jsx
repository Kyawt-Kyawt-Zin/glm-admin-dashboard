import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, MessageSquare } from "lucide-react";
import { getFeedbackForManagement } from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

const feedbackTypeLabels = {
  product_request: "Product request",
  product_feedback: "Product feedback",
  general_feedback: "General feedback",
};

const statusLabels = {
  new: "New",
  in_review: "In review",
  resolved: "Resolved",
  closed: "Closed",
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

const getStatusStyle = (status) => {
  const styles = {
    new: "bg-amber-100 text-amber-800",
    in_review: "bg-sky-100 text-sky-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-stone-200 text-stone-700",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

export default function FeedbackPage({ token }) {
  const navigate = useNavigate();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const feedback = await getFeedbackForManagement(token);

        setFeedbackItems(feedback);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load feedback.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, [token]);

  const filteredFeedback = useMemo(() => {
    return feedbackItems.filter((feedback) => {
      const matchesStatus =
        statusFilter === "all" || feedback.status === statusFilter;

      const matchesType =
        typeFilter === "all" || feedback.feedback_type === typeFilter;

      return matchesStatus && matchesType;
    });
  }, [feedbackItems, statusFilter, typeFilter]);

  const newFeedbackCount = feedbackItems.filter(
    (feedback) => feedback.status === "new",
  ).length;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">CUSTOMER VOICE</p>

          <h3 className="mt-1 text-2xl font-bold text-emerald-950">Feedback</h3>

          <p className="mt-2 text-sm text-slate-600">
            Review product requests, suggestions, and customer feedback.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950 md:self-auto">
          <MessageSquare size={18} strokeWidth={2.5} />

          <span>
            <span className="font-semibold">{newFeedbackCount}</span> new
            feedback item{newFeedbackCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="in_review">In review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <SelectChevron />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Feedback type
          </label>

          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => setTypeFilter(event.target.value)}
              value={typeFilter}
            >
              <option value="all">All feedback types</option>
              <option value="product_request">Product request</option>
              <option value="product_feedback">Product feedback</option>
              <option value="general_feedback">General feedback</option>
            </select>

            <SelectChevron />
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          Loading customer feedback...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load feedback: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && filteredFeedback.length === 0 && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          No feedback matches the selected filters.
        </p>
      )}

      {!isLoading && !errorMessage && filteredFeedback.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Received</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredFeedback.map((feedback) => (
                <tr
                  className="border-b border-stone-100 text-sm last:border-b-0 hover:bg-emerald-50/50"
                  key={feedback.id}
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-emerald-950">
                      {feedback.customer_name || "Unknown customer"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {feedback.customer_email || "—"}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {feedbackTypeLabels[feedback.feedback_type] ||
                      feedback.feedback_type}
                  </td>

                  <td className="max-w-xs px-4 py-4">
                    <p className="font-medium text-slate-800">
                      {feedback.subject}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {feedback.message}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        feedback.status,
                      )}`}
                    >
                      {statusLabels[feedback.status] || feedback.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {formatDate(feedback.created_at)}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      aria-label={`Open feedback: ${feedback.subject}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                      onClick={() => navigate(`/feedback/${feedback.id}`)}
                      title="Open feedback"
                      type="button"
                    >
                      <Eye size={17} strokeWidth={2.5} />
                      Open
                    </button>
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
