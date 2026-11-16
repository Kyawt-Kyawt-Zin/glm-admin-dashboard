import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock3,
  MessageSquareText,
  Save,
  UserRound,
} from "lucide-react";
import { getFeedbackById, reviewFeedback } from "../services/api.js";
import LoadingDots from "./LoadingDots.jsx";
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

const getStatusStyle = (status) => {
  const styles = {
    new: "bg-amber-100 text-amber-800",
    in_review: "bg-sky-100 text-sky-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-stone-200 text-stone-700",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateValue));
};

export default function FeedbackDetailPage({ token }) {
  const { feedbackId } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState(null);
  const [status, setStatus] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadFeedback = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const feedbackData = await getFeedbackById(token, feedbackId);

      setFeedback(feedbackData);
      setStatus(feedbackData.status);
      setStaffNote(feedbackData.staff_note || "");
    } catch (error) {
      setErrorMessage(error.message || "Unable to load feedback.");
    } finally {
      setIsLoading(false);
    }
  }, [feedbackId, token]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleSave = async (event) => {
    event.preventDefault();

    const noteIsRequired = ["resolved", "closed"].includes(status);

    if (noteIsRequired && !staffNote.trim()) {
      setSuccessMessage("");
      setErrorMessage(
        "Please add a staff note before resolving or closing this feedback.",
      );
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      await reviewFeedback(token, feedbackId, {
        status,
        staffNote: staffNote.trim(),
      });

      await loadFeedback();

      setSuccessMessage("Feedback review saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to save feedback review.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <p className="rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
        Loading feedback details...
      </p>
    );
  }

  if (errorMessage && !feedback) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load feedback: {errorMessage}
        </p>

        <button
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
          onClick={() => navigate("/feedback")}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to feedback
        </button>
      </div>
    );
  }

  const isClosed = feedback.status === "closed";

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">CUSTOMER VOICE</p>

          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            Feedback details
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Read the customer message and record the team’s review.
          </p>
        </div>

        <span
          className={`self-start rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusStyle(
            feedback.status,
          )}`}
        >
          {statusLabels[feedback.status] || feedback.status}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <UserRound size={17} />
            Customer
          </div>

          <p className="mt-3 font-semibold text-emerald-950">
            {feedback.customer_name || "Unknown customer"}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {feedback.customer_email || "—"}
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <MessageSquareText size={17} />
            Feedback type
          </div>

          <p className="mt-3 font-semibold text-emerald-950">
            {feedbackTypeLabels[feedback.feedback_type] ||
              feedback.feedback_type}
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Clock3 size={17} />
            Received
          </div>

          <p className="mt-3 font-semibold text-emerald-950">
            {formatDateTime(feedback.created_at)}
          </p>
        </div>
      </div>

      <article className="mt-6 rounded-xl border border-stone-200 p-5">
        <p className="text-sm font-medium text-amber-700">SUBJECT</p>

        <h4 className="mt-1 text-xl font-bold text-emerald-950">
          {feedback.subject}
        </h4>

        <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">
          {feedback.message}
        </p>
      </article>

      {feedback.reviewed_at && (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">
            Previous review
          </p>

          <p className="mt-2 text-sm text-slate-700">
            Reviewed by{" "}
            <span className="font-semibold">
              {feedback.reviewed_by_name || "a team member"}
            </span>{" "}
            on {formatDateTime(feedback.reviewed_at)}
          </p>

          {feedback.staff_note && (
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-6 text-slate-700">
              {feedback.staff_note}
            </p>
          )}
        </div>
      )}

      {isClosed ? (
        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5">
          <p className="text-lg font-bold text-emerald-950">Feedback closed</p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            This feedback has been completed and is now a read-only record.
            Further changes are not allowed.
          </p>

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
            onClick={() => navigate("/feedback")}
            type="button"
          >
            <ArrowLeft size={18} />
            Back to feedback
          </button>
        </div>
      ) : (
        <form
          className="mt-6 border-t border-stone-200 pt-6"
          onSubmit={handleSave}
        >
          <p className="text-lg font-bold text-emerald-950">
            Review and response
          </p>

          <p className="mt-1 text-sm text-slate-600">
            A staff note is required when resolving or closing feedback.
          </p>

          {errorMessage && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              {successMessage}
            </p>
          )}

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="feedbackStatus"
            >
              Feedback status
            </label>

            <div className="relative max-w-sm">
              <select
                className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="feedbackStatus"
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSuccessMessage("");
                  setErrorMessage("");
                }}
                value={status}
              >
                <option value="new">New</option>
                <option value="in_review">In review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <SelectChevron />
            </div>
          </div>

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="staffNote"
            >
              Staff note{" "}
              {["resolved", "closed"].includes(status) && (
                <span className="text-red-600">*</span>
              )}
            </label>

            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="staffNote"
              onChange={(event) => {
                setStaffNote(event.target.value);
                setSuccessMessage("");
                setErrorMessage("");
              }}
              placeholder="Write the action taken, response given, or reason for closing this feedback..."
              value={staffNote}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
              onClick={() => navigate("/feedback")}
              type="button"
            >
              <ArrowLeft size={18} />
              Back to feedback
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              <Save size={18} />

              {isSaving ? (
                <>
                  Saving
                  <LoadingDots />
                </>
              ) : (
                "Save review"
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
