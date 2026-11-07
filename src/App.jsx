import { useCallback, useEffect, useState } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import goldenLoomEmblem from "./assets/golden-loom-emblem.png";
import LoginPage from "./components/LoginPage.jsx";
import Footer from "./components/Footer.jsx";
import DashboardOverview from "./components/DashboardOverview.jsx";
import { getOrders } from "./services/api.js";
import RecentOrders from "./components/RecentOrders.jsx";
import LowStockVariants from "./components/LowstockVariants.jsx";
import OrdersPage from "./components/OrdersPage.jsx";
import OrderDetailsPage from "./components/OrderDetailsPage.jsx";
import OrderStatusHistoryPage from "./components/OrderStatusHistoryPage.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import InventoryPage from "./components/InventoryPage.jsx";

const menuItems = [
  { label: "Dashboard", to: "/" },
  { label: "Orders", to: "/orders" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/categories" },
  { label: "Customers", to: "/customers" },
  { label: "Feedback", to: "/feedback" },
  { label: "Inventory", to: "/inventory" },
];

const loadSavedSession = () => {
  const savedSession = localStorage.getItem("glmAdminSession");

  if (!savedSession) {
    return null;
  }

  try {
    return JSON.parse(savedSession);
  } catch {
    localStorage.removeItem("glmAdminSession");
    return null;
  }
};

const pageTitles = {
  "/": "Admin Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/categories": "Categories",
  "/customers": "Customers",
  "/feedback": "Feedback",
  "/inventory": "Inventory",
};

function DashboardPage({ token }) {
  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-semibold text-amber-700">
          BUSINESS OVERVIEW
        </p>
        <h3 className="mt-1 text-3xl font-bold tracking-tight">
          Today’s overview
        </h3>
        <p className="mt-2 text-slate-600">
          Monitor orders, deposits, stock, and customer feedback in one place.
        </p>
      </div>

      <DashboardOverview token={token} />
      <RecentOrders token={token} />
      <LowStockVariants token={token} />
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-600">This section will be built next.</p>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(loadSavedSession);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);

  const loadPendingOrderCount = useCallback(async () => {
    if (!session?.token) {
      setPendingOrderCount(0);
      return;
    }

    try {
      const orders = await getOrders(session.token);

      const pendingCount = orders.filter(
        (order) => order.status === "pending",
      ).length;

      setPendingOrderCount(pendingCount);
    } catch {
      setPendingOrderCount(0);
    }
  }, [session?.token]);

  useEffect(() => {
    loadPendingOrderCount();
  }, [loadPendingOrderCount]);
  const location = useLocation();
  const pageTitle = location.pathname.endsWith("/history")
    ? "Order status history"
    : location.pathname.startsWith("/orders/")
      ? "Order details"
      : (pageTitles[location.pathname] ?? "Admin Dashboard");

  const handleLogin = (loginData) => {
    const nextSession = {
      user: loginData.user,
      token: loginData.token,
    };

    localStorage.setItem("glmAdminSession", JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const handleLogout = () => {
    localStorage.removeItem("glmAdminSession");
    setSession(null);
  };

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-stone-100 text-slate-900 md:flex">
      <aside className="dashboard-scrollbar hidden h-full w-64 shrink-0 flex-col overflow-y-auto bg-emerald-950 p-5 text-white md:flex">
        <div className="-mx-5 -mt-5 mb-5 flex h-25 items-center justify-center border-b border-emerald-800">
          <div className="flex h-22 w-22 items-center justify-center rounded-full bg-emerald-100 p-1.5 shadow-sm">
            <img
              alt="Golden Loom Myanmar"
              className="h-full w-full object-contain"
              src={goldenLoomEmblem}
            />
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-amber-300 text-emerald-950"
                    : "text-emerald-100 hover:bg-emerald-900"
                }`
              }
              end={item.to === "/"}
              key={item.to}
              to={item.to}
            >
              <span>{item.label}</span>

              {item.to === "/orders" && pendingOrderCount > 0 && (
                <span
                  className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-emerald-950 shadow-sm"
                  title={`${pendingOrderCount} pending order${
                    pendingOrderCount === 1 ? "" : "s"
                  } need confirmation`}
                >
                  {pendingOrderCount > 9 ? "9+" : pendingOrderCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-emerald-800 pt-4 text-center text-xs text-emerald-200">
          <p>Myanmar-made sweaters · Dubai delivery</p>
        </div>
      </aside>

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-25 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 md:px-10">
          <div>
            <p className="text-sm text-slate-500">
              Welcome back, {session.user.full_name}
            </p>
            <h2 className="text-xl font-bold">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold capitalize text-white">
              {session.user.role}
            </span>

            <button
              className="text-sm font-semibold text-emerald-900 hover:text-emerald-700"
              onClick={handleLogout}
              type="button"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="p-6 pt-10 md:p-10">
            <Routes>
              <Route
                path="/"
                element={<DashboardPage token={session.token} />}
              />

              <Route
                path="/orders"
                element={
                  <OrdersPage
                    currentUser={session.user}
                    token={session.token}
                  />
                }
              />

              <Route
                path="/orders/:orderId/history"
                element={<OrderStatusHistoryPage token={session.token} />}
              />

              <Route
                path="/orders/:orderId"
                element={
                  <OrderDetailsPage
                    currentUser={session.user}
                    onPendingOrdersChanged={loadPendingOrderCount}
                    token={session.token}
                  />
                }
              />

              <Route path="/products" element={<ProductsPage />} />

              <Route
                path="/inventory"
                element={<InventoryPage token={session.token} />}
              />

              <Route
                path="/categories"
                element={<PlaceholderPage title="Categories" />}
              />

              <Route
                path="/customers"
                element={<PlaceholderPage title="Customers" />}
              />

              <Route
                path="/feedback"
                element={<PlaceholderPage title="Feedback" />}
              />

              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          </div>

          <Footer />
        </section>
      </main>
    </div>
  );
}

export default App;
