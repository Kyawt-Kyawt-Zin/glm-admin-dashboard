import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardAnalytics } from "../services/api.js";

const statusColors = {
  pending: "#f59e0b",
  confirmed: "#2563eb",
  processing: "#7c3aed",
  ready_for_delivery: "#0f766e",
  out_for_delivery: "#0891b2",
  ready_for_pickup: "#4f46e5",
  delivered: "#16a34a",
  picked_up: "#059669",
  cancelled: "#dc2626",
};

const formatActivityDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
};

function DashboardAnalytics({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    const loadAnalytics = async () => {
      try {
        setErrorMessage("");

        const analyticsData = await getDashboardAnalytics(token);

        if (isCurrentRequest) {
          setAnalytics(analyticsData);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error.message);
        }
      }
    };

    loadAnalytics();

    return () => {
      isCurrentRequest = false;
    };
  }, [token]);

  if (errorMessage) {
    return (
      <p className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700">
        Unable to load dashboard analytics: {errorMessage}
      </p>
    );
  }

  const activityData = (analytics?.order_activity || []).map((item) => ({
    ...item,
    label: formatActivityDate(item.date),
    order_count: Number(item.order_count),
  }));

  const statusData = (analytics?.order_statuses || [])
    .map((item) => ({
      ...item,
      order_count: Number(item.order_count),
    }))
    .filter((item) => item.order_count > 0);

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-5">
      <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-3">
        <div>
          <p className="text-sm font-semibold text-amber-700">ORDER ACTIVITY</p>
          <h3 className="mt-1 text-xl font-bold">Orders created this week</h3>
          <p className="mt-1 text-sm text-slate-500">
            New orders created during the most recent seven days.
          </p>
        </div>

        <div className="mt-6 h-[280px]">
          {analytics ? (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={activityData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#ecfdf5" }}
                  formatter={(value) => [value, "Orders created"]}
                  contentStyle={{
                    border: "1px solid #d1fae5",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="order_count"
                  fill="#047857"
                  name="Orders created"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading order activity…
            </div>
          )}
        </div>
      </article>

      <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-2">
        <div>
          <p className="text-sm font-semibold text-amber-700">ORDER WORKFLOW</p>
          <h3 className="mt-1 text-xl font-bold">Order status breakdown</h3>
          <p className="mt-1 text-sm text-slate-500">
            Current orders grouped by their operational status.
          </p>
        </div>

        <div className="mt-6 h-[280px]">
          {!analytics ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading order statuses…
            </div>
          ) : statusData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No orders are available yet.
            </div>
          ) : (
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="order_count"
                  nameKey="label"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {statusData.map((item) => (
                    <Cell
                      fill={statusColors[item.status] || "#64748b"}
                      key={item.status}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [value, "Orders"]}
                  contentStyle={{
                    border: "1px solid #d1fae5",
                    borderRadius: "12px",
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </section>
  );
}

export default DashboardAnalytics;
