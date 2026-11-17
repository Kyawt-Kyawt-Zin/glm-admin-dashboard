import { useEffect, useState } from "react";
import { ArrowLeft, Check, ClipboardList, LoaderCircle, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getOrderChangeRequestById,
  reviewOrderChangeRequest,
} from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

const readableLabel = (value) => {
  if (!value) {
    return "—";
  }

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

const variantLabel = (color, size, sku) => {
  const details = [color, size].filter(Boolean).join(" · ");

  if (!details && !sku) {
    return "—";
  }

  return (
    <div>
      <p className="font-semibold text-emerald-950">{details || "Variant"}</p>

      {sku && <p className="mt-1 text-xs text-slate-500">SKU: {sku}</p>}
    </div>
  );
};

export default function OrderChangeRequestDetailPage({
  token,
  onRequestTasksChanged,
}) {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [decision, setDecision] = useState("approved");
  const [staffComment, setStaffComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadRequest = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await getOrderChangeRequestById(token, requestId);

      setRequest(data);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to load the order change request.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId, token]);

  const handleReview = async (event) => {
    event.preventDefault();

    const normalizedComment = staffComment.trim();

    if (decision === "rejected" && !normalizedComment) {
      setSuccessMessage("");
      setErrorMessage("Please write a staff note when rejecting a request.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      await reviewOrderChangeRequest(token, request.id, {
        status: decision,
        staffComment: normalizedComment,
      });

      await loadRequest();
      onRequestTasksChanged?.();

      setSuccessMessage(
        `Request ${decision === "approved" ? "approved" : "rejected"} successfully.`,
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to review this request.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Loading order change request...
      </div>
    );
  }

  if (errorMessage && !request) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
        <p className="font-semibold text-rose-800">{errorMessage}</p>

        <button
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
          onClick={() => navigate("/order-change-requests")}
          type="button"
        >
          <ArrowLeft size={17} />
          Back to requests
        </button>
      </div>
    );
  }

  const isPending = request.status === "pending";
  const isCancellation = request.request_type === "cancel_order";
  const depositWasForfeited =
    request.deposit_forfeit_acknowledged === true ||
    Number(request.deposit_forfeit_acknowledged) === 1;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <button
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
        onClick={() => navigate("/order-change-requests")}
        type="button"
      >
        <ArrowLeft size={18} strokeWidth={2.25} />
        Back to requests
      </button>

      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
              Order change request
            </p>

            <h1 className="mt-2 text-3xl font-bold text-emerald-950">
              {isCancellation
                ? "Cancellation request"
                : "Variant change request"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Request #{request.id} · Received{" "}
              {formatDateTime(request.created_at)}
            </p>
          </div>

          <span
            className={`inline-flex self-start rounded-full px-4 py-2 text-sm font-bold ${
              request.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : request.status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
            }`}
          >
            {readableLabel(request.status)}
          </span>
        </div>

        {successMessage && (
          <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl bg-stone-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Customer
            </p>

            <h2 className="mt-3 text-xl font-bold text-emerald-950">
              {request.customer_name}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {request.customer_email}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {request.customer_phone || "No phone number"}
            </p>
          </article>

          <article className="rounded-2xl bg-stone-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Related order
            </p>

            <h2 className="mt-3 text-xl font-bold text-emerald-950">
              {request.order_number}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {readableLabel(request.fulfillment_type)} · Order{" "}
              {readableLabel(request.order_status)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Payment: {readableLabel(request.payment_status)}
            </p>
          </article>
        </div>

        <article className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
            Customer message
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {request.customer_note || "The customer did not add a note."}
          </p>
        </article>

        {isCancellation ? (
          <article className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
              Requested action
            </p>

            <h2 className="mt-2 text-lg font-bold text-rose-950">
              Cancel the entire order
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {depositWasForfeited
                ? "The customer acknowledged that the preorder deposit is non-refundable because the cancellation deadline has passed."
                : "The cancellation request was made without a deposit-forfeit acknowledgement. If a confirmed preorder deposit exists, approval may create a refund-pending payment task."}
            </p>
          </article>
        ) : (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-stone-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Current ordered variant
              </p>

              <div className="mt-3">
                {variantLabel(
                  request.current_color,
                  request.current_size,
                  request.current_sku,
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                Requested variant
              </p>

              <div className="mt-3">
                {variantLabel(
                  request.requested_color,
                  request.requested_size,
                  request.requested_sku,
                )}
              </div>
            </article>
          </div>
        )}

        {!isPending && (
          <article className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Review record
            </p>

            <h2 className="mt-2 text-lg font-bold text-emerald-950">
              Request {readableLabel(request.status)}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Reviewed by {request.reviewed_by_name || "Staff"} ·{" "}
              {formatDateTime(request.reviewed_at)}
            </p>

            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">
              {request.staff_note || "No staff note was recorded."}
            </p>
          </article>
        )}

        {isPending && (
          <form
            className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"
            onSubmit={handleReview}
          >
            <div className="flex items-center gap-3">
              <ClipboardList className="text-amber-800" size={22} />

              <div>
                <h2 className="font-bold text-emerald-950">Review decision</h2>

                <p className="mt-1 text-sm text-slate-600">
                  Approve only after checking the order, stock, and payment
                  information above.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="reviewDecision"
              >
                Decision
              </label>

              <div className="relative mt-2">
                <select
                  className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  id="reviewDecision"
                  onChange={(event) => {
                    setDecision(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  value={decision}
                >
                  <option value="approved">Approve request</option>
                  <option value="rejected">Reject request</option>
                </select>

                <SelectChevron />
              </div>
            </div>

            <div className="mt-5">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="staffComment"
              >
                Staff note{" "}
                {decision === "rejected" ? (
                  <span className="text-rose-600">*</span>
                ) : (
                  <span className="font-normal text-slate-500">(optional)</span>
                )}
              </label>

              <textarea
                className="mt-2 min-h-30 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                id="staffComment"
                onChange={(event) => {
                  setStaffComment(event.target.value);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                placeholder={
                  decision === "rejected"
                    ? "Explain clearly why this request cannot be approved."
                    : "Optional internal note for the customer record."
                }
                value={staffComment}
              />
            </div>

            <button
              className={`mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                decision === "approved"
                  ? "bg-emerald-800 hover:bg-emerald-900"
                  : "bg-rose-700 hover:bg-rose-800"
              }`}
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Saving decision...
                </>
              ) : decision === "approved" ? (
                <>
                  <Check size={18} strokeWidth={2.5} />
                  Approve request
                </>
              ) : (
                <>
                  <X size={18} strokeWidth={2.5} />
                  Reject request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
