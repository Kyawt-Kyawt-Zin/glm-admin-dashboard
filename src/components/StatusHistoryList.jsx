const formatDate = (dateValue) => {
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
};

const formatText = (value) => {
  return value ? value.replaceAll("_", " ") : "—";
};

const getActionStyle = (actionType) => {
  if (actionType === "correction") {
    return "bg-amber-100 text-amber-800";
  }

  if (actionType === "created") {
    return "bg-blue-100 text-blue-800";
  }

  return "bg-emerald-100 text-emerald-800";
};

const getActionLabel = (actionType) => {
  if (actionType === "correction") {
    return "Admin correction";
  }

  if (actionType === "created") {
    return "Order created";
  }

  return "Status update";
};

function StatusHistoryList({ history = [] }) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
      <div className="flex flex-col gap-2 border-b border-emerald-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-700">
            ORDER AUDIT TRAIL
          </p>
          <h3 className="mt-1 text-2xl font-bold text-emerald-950">
            Status history
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            A permanent record of order updates and admin corrections.
          </p>
        </div>

        <span className="text-sm text-slate-500">
          {history.length} record{history.length === 1 ? "" : "s"}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="mt-5 rounded-xl bg-white p-4 text-sm text-slate-600">
          No status updates have been recorded yet.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {history.map((entry) => (
            <li
              className="rounded-xl border border-stone-200 bg-white p-4"
              key={entry.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(
                        entry.action_type,
                      )}`}
                    >
                      {getActionLabel(entry.action_type)}
                    </span>

                    <p className="font-semibold capitalize text-emerald-950">
                      {entry.previous_status
                        ? `${formatText(entry.previous_status)} → ${formatText(
                            entry.new_status,
                          )}`
                        : `Set to ${formatText(entry.new_status)}`}
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    By {entry.changed_by_name || "Former team member"}
                    {entry.changed_by_role ? ` (${entry.changed_by_role})` : ""}
                  </p>

                  {entry.reason && (
                    <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                      <span className="font-semibold">Reason: </span>
                      {entry.reason}
                    </p>
                  )}
                </div>

                <p className="shrink-0 text-sm text-slate-500">
                  {formatDate(entry.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default StatusHistoryList;
