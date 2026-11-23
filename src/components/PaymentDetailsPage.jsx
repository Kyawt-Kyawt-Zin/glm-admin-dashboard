import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Landmark,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  confirmDeposit,
  getPaymentById,
  getPaymentProofBlob,
} from "../services/api.js";

const formatMoney = (amount) => {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
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

const formatText = (value) => {
  return value ? value.replaceAll("_", " ") : "—";
};

const paymentStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    submitted: "bg-sky-100 text-sky-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-100 text-rose-800",
    refunded: "bg-violet-100 text-violet-800",
  };

  return styles[status] || "bg-stone-100 text-stone-700";
};

function PaymentDetailsPage({ token, onPaymentTasksChanged }) {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofErrorMessage, setProofErrorMessage] = useState("");
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const paymentData = await getPaymentById(token, paymentId);
        setPayment(paymentData);
        setTransactionReference(paymentData.transaction_reference || "");
      } catch (error) {
        setErrorMessage(error.message || "Unable to load payment details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
  }, [paymentId, token]);

  useEffect(() => {
    if (!payment?.has_payment_proof) {
      return undefined;
    }

    let isCurrentRequest = true;
    let temporaryProofUrl = "";

    const loadPaymentProof = async () => {
      try {
        setProofErrorMessage("");
        setIsLoadingProof(true);

        const proofBlob = await getPaymentProofBlob(token, payment.id);
        temporaryProofUrl = URL.createObjectURL(proofBlob);

        if (isCurrentRequest) {
          setProofUrl(temporaryProofUrl);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setProofErrorMessage(
            error.message || "Unable to load customer payment proof.",
          );
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoadingProof(false);
        }
      }
    };

    loadPaymentProof();

    return () => {
      isCurrentRequest = false;

      if (temporaryProofUrl) {
        URL.revokeObjectURL(temporaryProofUrl);
      }
    };
  }, [payment?.has_payment_proof, payment?.id, token]);

  const handleConfirmDeposit = async (event) => {
    event.preventDefault();

    if (!transactionReference.trim()) {
      setFormErrorMessage(
        "Please enter the verified bank transaction reference before confirming.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Confirm this preorder deposit only after checking the business bank account.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setFormErrorMessage("");
      setSuccessMessage("");
      setIsConfirming(true);

      await confirmDeposit(token, payment.id, {
        transactionReference: transactionReference.trim(),
        notes: notes.trim(),
      });

      const refreshedPayment = await getPaymentById(token, payment.id);

      setPayment(refreshedPayment);
      setTransactionReference("");
      setNotes("");
      onPaymentTasksChanged?.();

      setSuccessMessage(
        `Deposit for order ${payment.order_number} was confirmed successfully.`,
      );
    } catch (error) {
      setFormErrorMessage(error.message || "Unable to confirm the deposit.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <p className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading payment details...
      </p>
    );
  }

  if (errorMessage || !payment) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate("/payments")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to payments
        </button>

        <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          Unable to load payment details: {errorMessage || "Payment not found"}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <button
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:text-emerald-700"
          onClick={() => navigate("/payments")}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to payments
        </button>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              PAYMENT REVIEW
            </p>

            <h3 className="mt-1 text-2xl font-bold text-emerald-950">
              {payment.order_number}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Payment #{payment.id} · {formatText(payment.payment_type)}
            </p>
          </div>

          <div className="text-left md:text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentStatusStyle(
                payment.payment_record_status,
              )}`}
            >
              {formatText(payment.payment_record_status)}
            </span>

            <p className="mt-3 text-sm text-slate-500">
              Created {formatDateTime(payment.created_at)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <UserRound size={20} />
            </span>

            <div>
              <p className="text-sm font-semibold text-amber-700">CUSTOMER</p>
              <h4 className="font-bold text-emerald-950">
                {payment.customer_name}
              </h4>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {payment.customer_email}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {payment.customer_phone || "Not provided"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <Landmark size={20} />
            </span>

            <div>
              <p className="text-sm font-semibold text-amber-700">PAYMENT</p>
              <h4 className="font-bold text-emerald-950">
                {formatMoney(payment.amount)}
              </h4>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Method</dt>
              <dd className="mt-1 font-medium capitalize text-slate-800">
                {formatText(payment.payment_method)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Order total</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatMoney(payment.total_amount)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Order status</dt>
              <dd className="mt-1 font-medium capitalize text-slate-800">
                {formatText(payment.order_status)}
              </dd>
            </div>

            <div>
              <dt className="text-slate-500">Order payment status</dt>
              <dd className="mt-1 font-medium capitalize text-slate-800">
                {formatText(payment.payment_status)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <FileImage size={20} />
          </span>

          <div>
            <p className="text-sm font-semibold text-amber-700">
              CUSTOMER PAYMENT PROOF
            </p>
            <h4 className="font-bold text-emerald-950">
              {payment.has_payment_proof
                ? "Proof uploaded"
                : "No proof uploaded yet"}
            </h4>
          </div>
        </div>

        {payment.has_payment_proof ? (
          <div className="mt-4">
            {isLoadingProof && (
              <p className="text-sm text-slate-600">
                Loading private payment proof...
              </p>
            )}

            {proofErrorMessage && (
              <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                {proofErrorMessage}
              </p>
            )}

            {proofUrl && !isLoadingProof && (
              <a
                href={proofUrl}
                rel="noreferrer"
                target="_blank"
                title="Open payment proof in a new tab"
              >
                <img
                  alt={`Customer payment proof for ${payment.order_number}`}
                  className="max-h-96 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain transition hover:opacity-90"
                  src={proofUrl}
                />
              </a>
            )}

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Check the screenshot, deposit amount, and transaction reference
              against the business bank account before confirming.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The customer has not submitted a payment screenshot yet. Staff
            cannot confirm this deposit until proof is available.
          </p>
        )}
      </section>

      {payment.payment_type === "deposit" &&
        payment.fulfillment_type === "preorder" &&
        payment.payment_record_status === "submitted" && (
          <form
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6"
            onSubmit={handleConfirmDeposit}
          >
            <p className="text-sm font-semibold text-emerald-800">
              CONFIRM PREORDER DEPOSIT
            </p>

            <h4 className="mt-1 text-xl font-bold text-emerald-950">
              {payment.order_number} · {formatMoney(payment.amount)}
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Check the customer evidence when available, then verify the amount
              and reference against the business bank account before confirming.
            </p>

            {formErrorMessage && (
              <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                {formErrorMessage}
              </p>
            )}

            {successMessage && (
              <p className="mt-5 rounded-xl bg-emerald-100 p-4 text-sm text-emerald-800">
                {successMessage}
              </p>
            )}

            <div className="mt-5">
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="transactionReference"
              >
                Verified bank transaction reference{" "}
                <span className="text-rose-600">*</span>
              </label>

              <input
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="transactionReference"
                onChange={(event) => {
                  setTransactionReference(event.target.value);
                  setFormErrorMessage("");
                }}
                placeholder="Example: MB-20261122-001"
                value={transactionReference}
              />
            </div>

            <div className="mt-5">
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="depositNotes"
              >
                Internal review note{" "}
                <span className="text-slate-400">(optional)</span>
              </label>

              <textarea
                className="min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="depositNotes"
                onChange={(event) => {
                  setNotes(event.target.value);
                  setFormErrorMessage("");
                }}
                placeholder="Example: Amount and bank reference matched the account record."
                value={notes}
              />
            </div>

            <button
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isConfirming}
              type="submit"
            >
              <CheckCircle2 size={18} />
              {isConfirming ? "Confirming..." : "Confirm deposit"}
            </button>
          </form>
        )}

      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-semibold text-amber-700">
          STAFF REVIEW RECORD
        </p>

        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-slate-500">Verified bank reference</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {payment.transaction_reference || "Not confirmed yet"}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Confirmed by</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {payment.confirmed_by_name || "Not confirmed yet"}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Confirmed at</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {formatDateTime(payment.confirmed_at)}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Internal note</dt>
            <dd className="mt-1 font-medium text-slate-800">
              {payment.notes || "No internal note"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default PaymentDetailsPage;
