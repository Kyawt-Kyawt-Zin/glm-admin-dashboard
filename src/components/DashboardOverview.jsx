import { useEffect, useState } from "react";
import { getDashboardOverview } from "../services/api.js";

const overviewCards = [
  {
    label: "Active products",
    getValue: (overview) => overview.catalog.active_products,
  },
  {
    label: "Active orders",
    getValue: (overview) => overview.orders.active,
  },
  {
    label: "Pending deposits",
    getValue: (overview) => overview.payments.pending_deposits,
  },
  {
    label: "New feedback",
    getValue: (overview) => overview.feedback.new,
  },
];

function DashboardOverview({ token }) {
  const [overview, setOverview] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setErrorMessage("");

        const overviewData = await getDashboardOverview(token);
        setOverview(overviewData);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadOverview();
  }, [token]);

  if (errorMessage) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Unable to load dashboard data: {errorMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {overviewCards.map((card) => (
        <article
          className="rounded-2xl bg-white p-5 shadow-sm"
          key={card.label}
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-3 text-3xl font-bold">
            {overview ? card.getValue(overview) : "…"}
          </p>
        </article>
      ))}
    </div>
  );
}

export default DashboardOverview;
