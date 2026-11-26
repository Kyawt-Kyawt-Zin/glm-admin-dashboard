import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

const fallbackStatusDefinitions = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "ready_for_delivery", label: "Ready for delivery" },
  { status: "out_for_delivery", label: "Out for delivery" },
  { status: "ready_for_pickup", label: "Ready for pickup" },
  { status: "delivered", label: "Delivered" },
  { status: "picked_up", label: "Picked up" },
  { status: "cancelled", label: "Cancelled" },
];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentWeekStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - 6);

  return formatDateKey(today);
};

const getDateFromKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const moveDateByDays = (dateKey, dayCount) => {
  const date = getDateFromKey(dateKey);
  date.setDate(date.getDate() + dayCount);

  return formatDateKey(date);
};

const formatActivityDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-AE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(getDateFromKey(dateValue));
};

const ActivityDateTick = ({ x, y, payload }) => {
  if (!payload?.value) return null;

  const date = getDateFromKey(payload.value);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);

  const weekdayLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
  }).format(date);

  return (
    <text x={x} y={y} fill="#64748b" fontSize={11} textAnchor="middle">
      <tspan x={x} dy="1em">
        {dateLabel}
      </tspan>
      <tspan x={x} dy="1.3em">
        {weekdayLabel}
      </tspan>
    </text>
  );
};

const ActivityTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const nonZeroItems = payload.filter((item) => Number(item.value) > 0);

  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm shadow-sm">
      <p className="mb-2 font-semibold text-slate-700">
        {formatActivityDate(label)}
      </p>

      {nonZeroItems.length > 0 ? (
        nonZeroItems.map((item) => (
          <p key={item.dataKey} style={{ color: item.color || item.fill }}>
            {item.name}: {item.value}
          </p>
        ))
      ) : (
        <p className="text-slate-500">No orders</p>
      )}
    </div>
  );
};

const formatWeekRange = (weekStart, weekEnd) => {
  if (!weekStart || !weekEnd) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(getDateFromKey(weekStart))} – ${formatter.format(
    getDateFromKey(weekEnd),
  )}`;
};

function DashboardAnalytics({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart);

  const currentWeekStart = useMemo(() => getCurrentWeekStart(), []);
  const isCurrentWeek = weekStart >= currentWeekStart;

  useEffect(() => {
    let isCurrentRequest = true;

    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const analyticsData = await getDashboardAnalytics(token, weekStart);

        if (isCurrentRequest) {
          setAnalytics(analyticsData);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setErrorMessage(error.message);
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isCurrentRequest = false;
    };
  }, [token, weekStart]);

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
  }));

  const statusDefinitions =
    analytics?.status_definitions || fallbackStatusDefinitions;

  const statusData = (analytics?.order_statuses || [])
    .map((item) => ({
      ...item,
      order_count: Number(item.order_count),
    }))
    .filter((item) => item.order_count > 0);

  const displayedWeekStart = analytics?.week_start || weekStart;
  const displayedWeekEnd =
    analytics?.week_end || moveDateByDays(displayedWeekStart, 6);

  const changeWeek = (dayOffset) => {
    const nextWeekStart = moveDateByDays(weekStart, dayOffset);

    setWeekStart(
      nextWeekStart > currentWeekStart ? currentWeekStart : nextWeekStart,
    );
  };

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-5">
      <article className="rounded-2xl bg-white p-6 shadow-sm xl:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              DAILY ORDER REPORT
            </p>
            <h3 className="mt-1 text-xl font-bold">Orders by status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Orders created each day, grouped by their current operational
              status.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 p-1">
            <button
              aria-label="Show previous seven days"
              className="rounded-lg p-2 text-emerald-800 transition hover:bg-white hover:shadow-sm"
              onClick={() => changeWeek(-7)}
              type="button"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-44 text-center text-xs font-semibold text-emerald-900">
              {formatWeekRange(displayedWeekStart, displayedWeekEnd)}
            </span>
            <button
              aria-label="Show next seven days"
              className="rounded-lg p-2 text-emerald-800 transition hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
              disabled={isCurrentWeek}
              onClick={() => changeWeek(7)}
              type="button"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 h-[340px]">
          {!isLoading ? (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={activityData} barCategoryGap="20%">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  interval={0}
                  minTickGap={0}
                  height={48}
                  tick={<ActivityDateTick />}
                />{" "}
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#ecfdf5" }}
                  content={<ActivityTooltip />}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
                {statusDefinitions.map(({ status, label }) => (
                  <Bar
                    dataKey={status}
                    fill={statusColors[status] || "#64748b"}
                    key={status}
                    name={label}
                    stackId="order-statuses"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading daily order report…
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
          {isLoading ? (
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
