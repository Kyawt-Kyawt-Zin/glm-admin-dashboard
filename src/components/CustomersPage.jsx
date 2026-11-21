import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
  Power,
  Users,
} from "lucide-react";
import { getCustomers, updateCustomerActiveStatus } from "../services/api.js";
import SelectChevron from "./SelectChevron.jsx";

const PAGE_LIMIT = 5;

const formatJoinedDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
};

export default function CustomersPage({ token }) {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalItems: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notification, setNotification] = useState(null);
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const notificationTimer = window.setTimeout(() => {
      setNotification(null);
    }, 4000);

    return () => {
      window.clearTimeout(notificationTimer);
    };
  }, [notification]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setErrorMessage("");
        setIsLoading(true);

        const data = await getCustomers(token, {
          page,
          limit: PAGE_LIMIT,
          search: searchTerm,
          status,
        });

        setCustomers(data.customers);
        setPagination(data.pagination);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load customers.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [page, searchTerm, status, token]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const goToPage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), pagination.totalPages);

    setPage(safePage);
  };

  const handleStatusChange = async (customer) => {
    const nextIsActive = !Boolean(customer.is_active);
    const actionLabel = nextIsActive ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Do you want to ${actionLabel} ${customer.full_name}'s account?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage("");
      setNotification(null);
      setUpdatingCustomerId(customer.id);

      const updatedCustomer = await updateCustomerActiveStatus(
        token,
        customer.id,
        nextIsActive,
      );

      setCustomers((currentCustomers) =>
        currentCustomers.map((currentCustomer) =>
          currentCustomer.id === updatedCustomer.id
            ? updatedCustomer
            : currentCustomer,
        ),
      );

      const isActive = Boolean(updatedCustomer.is_active);

      setNotification({
        message: `${updatedCustomer.full_name} is now ${
          isActive ? "active" : "inactive"
        }.`,
        tone: isActive ? "success" : "inactive",
      });
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to update the customer account status.",
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            CUSTOMER DIRECTORY
          </p>

          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            Customers
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Find customer contact details, account status, and registration
            history.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950 md:self-auto">
          <Users size={18} strokeWidth={2.5} />

          <span>
            <span className="font-semibold">{pagination.totalItems}</span>{" "}
            customer{pagination.totalItems === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <form className="flex flex-1 gap-2" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="customerSearch">
            Search customers
          </label>

          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="customerSearch"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, email, or phone..."
              value={searchInput}
            />
          </div>

          <button
            className="rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            type="submit"
          >
            Search
          </button>

          {searchTerm && (
            <button
              className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-100"
              onClick={clearSearch}
              type="button"
            >
              Clear
            </button>
          )}
        </form>

        <div className="relative md:w-48">
          <label className="sr-only" htmlFor="customerStatus">
            Filter customer status
          </label>

          <select
            className="w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3 pr-16 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            id="customerStatus"
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            value={status}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>

          <SelectChevron />
        </div>
      </div>

      {isLoading && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          Loading customers...
        </p>
      )}

      {!isLoading && errorMessage && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          Unable to load customers: {errorMessage}
        </p>
      )}

      {notification && (
        <div
          className={`fixed right-4 top-28 z-[60] max-w-sm rounded-xl p-4 text-sm shadow-lg ${
            notification.tone === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          {notification.message}
        </div>
      )}

      {!isLoading && !errorMessage && customers.length === 0 && (
        <p className="mt-6 rounded-xl bg-stone-50 p-4 text-sm text-slate-600">
          No customers match the current search and filter.
        </p>
      )}

      {!isLoading && !errorMessage && customers.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    History
                  </th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    className="border-b border-stone-100 text-sm last:border-b-0 hover:bg-emerald-50/50"
                    key={customer.id}
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-emerald-950">
                        {customer.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          customer.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {customer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {formatJoinedDate(customer.created_at)}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        aria-label={`View ${customer.full_name}'s order history`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800 text-emerald-900 transition hover:bg-emerald-50"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        title="View customer order history"
                        type="button"
                      >
                        <Eye aria-hidden="true" size={17} />
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          customer.is_active
                            ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        }`}
                        disabled={updatingCustomerId === customer.id}
                        onClick={() => handleStatusChange(customer)}
                        type="button"
                      >
                        <Power size={15} />

                        {updatingCustomerId === customer.id
                          ? "Saving..."
                          : customer.is_active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-stone-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Page{" "}
              <span className="font-semibold text-emerald-950">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-emerald-950">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                aria-label="First page"
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={pagination.page === 1 || isLoading}
                onClick={() => goToPage(1)}
                type="button"
              >
                <ChevronsLeft size={16} />
                First
              </button>

              <button
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={pagination.page === 1 || isLoading}
                onClick={() => goToPage(pagination.page - 1)}
                type="button"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={
                  pagination.page === pagination.totalPages || isLoading
                }
                onClick={() => goToPage(pagination.page + 1)}
                type="button"
              >
                Next
                <ChevronRight size={16} />
              </button>

              <button
                aria-label="Last page"
                className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={
                  pagination.page === pagination.totalPages || isLoading
                }
                onClick={() => goToPage(pagination.totalPages)}
                type="button"
              >
                Last
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
