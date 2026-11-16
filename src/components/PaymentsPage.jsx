import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Landmark,
  RotateCcw,
  WalletCards,
  X,
} from "lucide-react";
import {
  confirmDeposit,
  getPendingDeposits,
  getRefundPendingPayments,
  refundDeposit,
} from "../services/api.js";

const formatMoney = (amount) => {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
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

export default function PaymentsPage({ token, onPaymentTasksChanged }) {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingRefunds, setPendingRefunds] = useState([]);
  const [activeQueue, setActiveQueue] = useState("deposits");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundReference, setRefundReference] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const [notes, setNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadPaymentQueues = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const [deposits, refunds] = await Promise.all([
        getPendingDeposits(token),
        getRefundPendingPayments(token),
      ]);

      setPendingDeposits(deposits);
      setPendingRefunds(refunds);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load payment tasks.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPaymentQueues();
  }, [loadPaymentQueues]);

  const displayedPayments =
    activeQueue === "deposits" ? pendingDeposits : pendingRefunds;

  const selectDepositForConfirmation = (payment) => {
    setSelectedDeposit(payment);
    setTransactionReference("");
    setNotes("");
    setFormErrorMessage("");
    setSuccessMessage("");
  };

  const handleConfirmDeposit = async (event) => {
    event.preventDefault();

    if (!selectedDeposit) {
      return;
    }

    if (!transactionReference.trim()) {
      setSuccessMessage("");
      setFormErrorMessage(
        "Please enter the bank transaction reference before confirming.",
      );
      return;
    }

    try {
      setFormErrorMessage("");
      setSuccessMessage("");
      setIsConfirming(true);

      await confirmDeposit(token, selectedDeposit.id, {
        transactionReference: transactionReference.trim(),
        notes: notes.trim(),
      });

      setSelectedDeposit(null);
      setTransactionReference("");
      setNotes("");

      await loadPaymentQueues();
      onPaymentTasksChanged?.();

      setSuccessMessage(
        `Deposit for order ${selectedDeposit.order_number} was confirmed successfully.`,
      );
    } catch (error) {
      setFormErrorMessage(error.message || "Unable to confirm the deposit.");
    } finally {
      setIsConfirming(false);
    }
  };

  const selectRefundForRecording = (payment) => {
    setSelectedRefund(payment);
    setRefundReference("");
    setRefundNotes("");
    setFormErrorMessage("");
    setSuccessMessage("");
  };

  const handleRecordRefund = async (event) => {
    event.preventDefault();

    if (!selectedRefund) {
      return;
    }

    if (!refundReference.trim()) {
      setSuccessMessage("");
      setFormErrorMessage(
        "Please enter the refund transfer reference before recording it.",
      );
      return;
    }

    try {
      setFormErrorMessage("");
      setSuccessMessage("");
      setIsRefunding(true);

      await refundDeposit(token, selectedRefund.id, {
        refundReference: refundReference.trim(),
        refundNotes: refundNotes.trim(),
      });

      setSelectedRefund(null);
      setRefundReference("");
      setRefundNotes("");

      await loadPaymentQueues();
      onPaymentTasksChanged?.();

      setSuccessMessage(
        `Refund for order ${selectedRefund.order_number} was recorded successfully.`,
      );
    } catch (error) {
      setFormErrorMessage(
        error.message || "Unable to record the deposit refund.",
      );
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            PAYMENT MANAGEMENT
          </p>

          <h3 className="mt-1 text-2xl font-bold text-emerald-950">Payments</h3>

          <p className="mt-2 text-sm text-slate-600">
            Confirm preorder deposits and record approved customer refunds.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950 md:self-auto">
          <WalletCards size={18} strokeWidth={2.5} />

          <span>
            <span className="font-semibold">
              {pendingDeposits.length + pendingRefunds.length}
            </span>{" "}
            payment task
            {pendingDeposits.length + pendingRefunds.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          className={`rounded-xl border p-5 text-left transition ${
            activeQueue === "deposits"
              ? "border-emerald-700 bg-emerald-50"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
          onClick={() => setActiveQueue("deposits")}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-800 text-white">
              <Landmark size={20} />
            </span>

            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-800">
              {pendingDeposits.length}
            </span>
          </div>

          <p className="mt-4 font-bold text-emerald-950">Pending deposits</p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Preorder bank transfers waiting for staff confirmation.
          </p>
        </button>

        <button
          className={`rounded-xl border p-5 text-left transition ${
            activeQueue === "refunds"
              ? "border-emerald-700 bg-emerald-50"
              : "border-stone-200 bg-white hover:bg-stone-50"
          }`}
          onClick={() => setActiveQueue("refunds")}
          type="button"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sky-700 text-white">
              <RotateCcw size={20} />
            </span>

            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sm font-bold text-sky-800">
              {pendingRefunds.length}
            </span>
          </div>

          <p className="mt-4 font-bold text-emerald-950">Refund pending</p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Approved cancelled preorders waiting for a refund record.
          </p>
        </button>
      </div>

      {successMessage && (
        <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {successMessage}
        </p>
      )}

      {isLoading && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          Loading payment tasks...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load payment tasks: {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && displayedPayments.length === 0 && (
        <div className="mt-6 rounded-xl bg-stone-50 p-6 text-center">
          <p className="font-semibold text-emerald-950">
            {activeQueue === "deposits"
              ? "No pending preorder deposits"
              : "No refunds waiting to be recorded"}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {activeQueue === "deposits"
              ? "New preorder bank transfers will appear here for verification."
              : "Approved refundable cancellations will appear here."}
          </p>
        </div>
      )}

      {!isLoading && !errorMessage && displayedPayments.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">
                  {activeQueue === "deposits"
                    ? "Payment method"
                    : "Original reference"}
                </th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {displayedPayments.map((payment) => (
                <tr
                  className="border-b border-stone-100 text-sm last:border-b-0 hover:bg-emerald-50/50"
                  key={payment.id}
                >
                  <td className="px-4 py-4 font-semibold text-emerald-950">
                    {payment.order_number}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-800">
                      {payment.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {payment.customer_email}
                    </p>
                  </td>

                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {formatMoney(payment.amount)}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {activeQueue === "deposits"
                      ? "Bank transfer"
                      : payment.transaction_reference || "—"}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {formatDate(payment.created_at)}
                  </td>

                  <td className="px-4 py-4">
                    {activeQueue === "deposits" ? (
                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900"
                        onClick={() => selectDepositForConfirmation(payment)}
                        type="button"
                      >
                        <CheckCircle2 size={17} />
                        Confirm
                      </button>
                    ) : (
                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
                        onClick={() => selectRefundForRecording(payment)}
                        type="button"
                      >
                        <RotateCcw size={17} />
                        Record refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDeposit && activeQueue === "deposits" && (
        <form
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
          onSubmit={handleConfirmDeposit}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                CONFIRM PREORDER DEPOSIT
              </p>

              <h4 className="mt-1 text-lg font-bold text-emerald-950">
                {selectedDeposit.order_number} ·{" "}
                {formatMoney(selectedDeposit.amount)}
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Customer: {selectedDeposit.customer_name}
              </p>
            </div>

            <button
              aria-label="Cancel deposit confirmation"
              className="inline-flex h-9 w-9 items-center justify-center self-start rounded-lg text-slate-600 transition hover:bg-white"
              onClick={() => {
                setSelectedDeposit(null);
                setTransactionReference("");
                setNotes("");
                setErrorMessage("");
              }}
              title="Cancel"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {formErrorMessage && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {formErrorMessage}
            </p>
          )}

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="transactionReference"
            >
              Bank transaction reference <span className="text-red-600">*</span>
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="transactionReference"
              onChange={(event) => {
                setTransactionReference(event.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Example: MB-20261116-001"
              value={transactionReference}
            />
          </div>

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="depositNotes"
            >
              Internal note <span className="text-slate-400">(optional)</span>
            </label>

            <textarea
              className="min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="depositNotes"
              onChange={(event) => {
                setNotes(event.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Example: Verified in the business bank account."
              value={notes}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
              onClick={() => {
                setSelectedDeposit(null);
                setTransactionReference("");
                setNotes("");
                setErrorMessage("");
              }}
              type="button"
            >
              Cancel
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isConfirming}
              type="submit"
            >
              <CheckCircle2 size={18} />
              {isConfirming ? "Confirming..." : "Confirm deposit"}
            </button>
          </div>
        </form>
      )}

      {selectedRefund && activeQueue === "refunds" && (
        <form
          className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-5"
          onSubmit={handleRecordRefund}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-800">
                RECORD PREORDER DEPOSIT REFUND
              </p>

              <h4 className="mt-1 text-lg font-bold text-emerald-950">
                {selectedRefund.order_number} ·{" "}
                {formatMoney(selectedRefund.amount)}
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Customer: {selectedRefund.customer_name}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Original deposit reference:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedRefund.transaction_reference || "—"}
                </span>
              </p>
            </div>

            <button
              aria-label="Cancel refund recording"
              className="inline-flex h-9 w-9 items-center justify-center self-start rounded-lg text-slate-600 transition hover:bg-white"
              onClick={() => {
                setSelectedRefund(null);
                setRefundReference("");
                setRefundNotes("");
                setFormErrorMessage("");
              }}
              title="Cancel"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {formErrorMessage && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {formErrorMessage}
            </p>
          )}

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="refundReference"
            >
              Refund transfer reference <span className="text-red-600">*</span>
            </label>

            <input
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              id="refundReference"
              onChange={(event) => {
                setRefundReference(event.target.value);
                setFormErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Example: REF-20261116-001"
              value={refundReference}
            />
          </div>

          <div className="mt-5">
            <label
              className="mb-2 block text-sm font-medium text-slate-700"
              htmlFor="refundNotes"
            >
              Internal note <span className="text-slate-400">(optional)</span>
            </label>

            <textarea
              className="min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              id="refundNotes"
              onChange={(event) => {
                setRefundNotes(event.target.value);
                setFormErrorMessage("");
                setSuccessMessage("");
              }}
              placeholder="Example: Refund sent after approved preorder cancellation."
              value={refundNotes}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
              onClick={() => {
                setSelectedRefund(null);
                setRefundReference("");
                setRefundNotes("");
                setFormErrorMessage("");
              }}
              type="button"
            >
              Cancel
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isRefunding}
              type="submit"
            >
              <RotateCcw size={18} />
              {isRefunding ? "Recording..." : "Record refund"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
