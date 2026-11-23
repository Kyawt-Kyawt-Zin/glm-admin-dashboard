import { useCallback, useEffect, useState } from "react";
import { Power, Pencil, Landmark, Plus, Settings2 } from "lucide-react";
import {
  createBankAccount,
  getBankAccountsForManagement,
  updateBankAccount,
  updateBankAccountStatus,
} from "../services/api.js";

const emptyBankAccountForm = {
  label: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  iban: "",
  branchName: "",
  currency: "AED",
  transferInstructions: "",
  displayOrder: "0",
};

export default function SettingsPage({ token }) {
  const [accounts, setAccounts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyBankAccountForm);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatusAccountId, setUpdatingStatusAccountId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadBankAccounts = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsLoading(true);

      const accountData = await getBankAccountsForManagement(token);
      setAccounts(accountData);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load bank accounts.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateBankAccount = async (event) => {
    event.preventDefault();

    try {
      setFormErrorMessage("");
      setSuccessMessage("");
      setIsCreating(true);

      await createBankAccount(token, {
        ...form,
        displayOrder: Number(form.displayOrder),
      });

      await loadBankAccounts();

      setForm(emptyBankAccountForm);
      setIsCreateOpen(false);
      setSuccessMessage("Bank account was added successfully.");
    } catch (error) {
      setFormErrorMessage(error.message || "Unable to add bank account.");
    } finally {
      setIsCreating(false);
    }
  };

  const openEditForm = (account) => {
    setForm({
      label: account.label || "",
      bankName: account.bank_name || "",
      accountHolder: account.account_holder || "",
      accountNumber: account.account_number || "",
      iban: account.iban || "",
      branchName: account.branch_name || "",
      currency: account.currency || "AED",
      transferInstructions: account.transfer_instructions || "",
      displayOrder: String(account.display_order ?? 0),
    });

    setFormErrorMessage("");
    setSuccessMessage("");
    setIsCreateOpen(false);
    setEditingAccount(account);
  };

  const handleUpdateBankAccount = async (event) => {
    event.preventDefault();

    if (!editingAccount) {
      return;
    }

    try {
      setFormErrorMessage("");
      setSuccessMessage("");
      setIsUpdating(true);

      await updateBankAccount(token, editingAccount.id, {
        ...form,
        displayOrder: Number(form.displayOrder),
      });

      await loadBankAccounts();

      setForm(emptyBankAccountForm);
      setEditingAccount(null);
      setSuccessMessage("Bank account was updated successfully.");
    } catch (error) {
      setFormErrorMessage(error.message || "Unable to update bank account.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (account) => {
    const nextIsActive = !Boolean(account.is_active);
    const actionLabel = nextIsActive ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Do you want to ${actionLabel} ${account.label}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      setUpdatingStatusAccountId(account.id);

      const updatedAccount = await updateBankAccountStatus(
        token,
        account.id,
        nextIsActive,
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((currentAccount) =>
          currentAccount.id === updatedAccount.id
            ? updatedAccount
            : currentAccount,
        ),
      );

      setSuccessMessage(
        `${updatedAccount.label} is now ${
          updatedAccount.is_active ? "active" : "inactive"
        }.`,
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to update bank account status.");
    } finally {
      setUpdatingStatusAccountId(null);
    }
  };

  const activeCount = accounts.filter((account) =>
    Boolean(account.is_active),
  ).length;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              BUSINESS SETTINGS
            </p>

            <h3 className="mt-1 text-2xl font-bold text-emerald-950">
              Settings
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              Manage customer-facing bank-transfer details and future brand
              configuration.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950 sm:self-auto">
            <Landmark size={18} strokeWidth={2.5} />

            <span>
              <span className="font-semibold">{activeCount}</span> active bank
              account{activeCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                <Landmark size={20} />
              </span>

              <div>
                <p className="text-sm font-semibold text-amber-700">
                  BANK ACCOUNTS
                </p>

                <h4 className="font-bold text-emerald-950">
                  Customer transfer accounts
                </h4>
              </div>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 sm:self-auto"
              onClick={() => {
                setForm(emptyBankAccountForm);
                setFormErrorMessage("");
                setEditingAccount(null);
                setIsCreateOpen(true);
              }}
              type="button"
            >
              <Plus size={18} />
              Add bank account
            </button>
          </div>

          {(isCreateOpen || editingAccount) && (
            <form
              className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
              onSubmit={
                editingAccount
                  ? handleUpdateBankAccount
                  : handleCreateBankAccount
              }
            >
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  {editingAccount ? "EDIT BANK ACCOUNT" : "NEW BANK ACCOUNT"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  These details will later appear for customers making preorder
                  bank transfers.
                </p>
              </div>

              {formErrorMessage && (
                <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                  {formErrorMessage}
                </p>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Account label <span className="text-rose-600">*</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={100}
                    onChange={(event) =>
                      updateFormField("label", event.target.value)
                    }
                    placeholder="Example: Golden Loom AED Account"
                    value={form.label}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Bank name <span className="text-rose-600">*</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={100}
                    onChange={(event) =>
                      updateFormField("bankName", event.target.value)
                    }
                    placeholder="Example: Emirates NBD"
                    value={form.bankName}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Account holder <span className="text-rose-600">*</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={150}
                    onChange={(event) =>
                      updateFormField("accountHolder", event.target.value)
                    }
                    value={form.accountHolder}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Account number <span className="text-rose-600">*</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={80}
                    onChange={(event) =>
                      updateFormField("accountNumber", event.target.value)
                    }
                    value={form.accountNumber}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  IBAN{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={50}
                    onChange={(event) =>
                      updateFormField("iban", event.target.value)
                    }
                    value={form.iban}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Branch{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    maxLength={100}
                    onChange={(event) =>
                      updateFormField("branchName", event.target.value)
                    }
                    value={form.branchName}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Currency
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal uppercase outline-none focus:border-emerald-600"
                    maxLength={3}
                    onChange={(event) =>
                      updateFormField(
                        "currency",
                        event.target.value.toUpperCase(),
                      )
                    }
                    value={form.currency}
                  />
                </label>

                <label className="text-sm font-semibold text-slate-700">
                  Display order
                  <input
                    className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                    min="0"
                    onChange={(event) =>
                      updateFormField("displayOrder", event.target.value)
                    }
                    type="number"
                    value={form.displayOrder}
                  />
                </label>
              </div>

              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Transfer instructions{" "}
                <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-600"
                  maxLength={1000}
                  onChange={(event) =>
                    updateFormField("transferInstructions", event.target.value)
                  }
                  placeholder="Example: Use your preorder order number as the transfer reference."
                  value={form.transferInstructions}
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-100"
                  onClick={() => {
                    setForm(emptyBankAccountForm);
                    setFormErrorMessage("");
                    setIsCreateOpen(false);
                    setEditingAccount(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating || isUpdating}
                  type="submit"
                >
                  {editingAccount
                    ? isUpdating
                      ? "Saving..."
                      : "Save changes"
                    : isCreating
                      ? "Adding..."
                      : "Add bank account"}
                </button>
              </div>
            </form>
          )}

          {successMessage && (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              {successMessage}
            </p>
          )}

          {isLoading && (
            <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
              Loading bank accounts...
            </p>
          )}

          {!isLoading && errorMessage && (
            <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              Unable to load bank accounts: {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && accounts.length === 0 && (
            <p className="mt-5 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
              No bank accounts have been added yet.
            </p>
          )}

          {!isLoading && !errorMessage && accounts.length > 0 && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Account</th>
                    <th className="px-4 py-3 font-semibold">Bank details</th>
                    <th className="px-4 py-3 font-semibold">Currency</th>
                    <th className="px-4 py-3 font-semibold">Display order</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {accounts.map((account) => (
                    <tr
                      className="border-b border-stone-100 text-sm last:border-b-0 hover:bg-emerald-50/50"
                      key={account.id}
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-emerald-950">
                          {account.label}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {account.account_holder}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {account.bank_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {account.account_number}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {account.currency}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {account.display_order}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            account.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {account.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              aria-label={`Edit ${account.label}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800 text-emerald-900 transition hover:bg-emerald-50"
                              onClick={() => openEditForm(account)}
                              title="Edit bank account"
                              type="button"
                            >
                              <Pencil
                                aria-hidden="true"
                                size={16}
                                strokeWidth={2.5}
                              />
                            </button>

                            <button
                              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                account.is_active
                                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              }`}
                              disabled={updatingStatusAccountId === account.id}
                              onClick={() => handleStatusChange(account)}
                              type="button"
                            >
                              <Power size={15} />

                              {updatingStatusAccountId === account.id
                                ? "Saving..."
                                : account.is_active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          </div>
                        </td>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
            <Settings2 size={20} />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-700">BRAND ASSETS</p>

            <h4 className="mt-1 font-bold text-slate-800">
              Special-event logos
            </h4>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Logo switching for special events will be added here later. It is
              intentionally separate from financial settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
