import { useState } from "react";
import goldenLoomLogo from "./assets/golden-loom-logo.png";
import LoginPage from "./components/LoginPage.jsx";
import Footer from "./components/Footer.jsx";
import DashboardOverview from "./components/DashboardOverview.jsx";
import RecentOrders from "./components/RecentOrders.jsx";
import LowStockVariants from "./components/LowstockVariants.jsx";
import OrdersPage from "./components/OrdersPage.jsx";

const menuItems = [
  "Dashboard",
  "Orders",
  "Products",
  "Categories",
  "Customers",
  "Feedback",
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

function App() {
  const [session, setSession] = useState(loadSavedSession);
  const [activePage, setActivePage] = useState("Dashboard");

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
    <div className="min-h-screen bg-stone-100 text-slate-900 md:flex">
      <aside className="hidden min-h-screen w-64 flex-col bg-emerald-950 p-6 text-white md:flex">
        <div>
          <div className="rounded-xl bg-stone-50 p-2">
            <img
              src={goldenLoomLogo}
              alt="Golden Loom Myanmar"
              className="h-24 w-full object-contain"
            />
          </div>

          <p className="mt-3 text-center text-lg font-semibold text-emerald-100">
            Admin Dashboard
          </p>
        </div>

        <nav className="mt-12 space-y-2">
          {menuItems.map((item) => (
            <button
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                item === activePage
                  ? "bg-amber-300 text-emerald-950"
                  : "text-emerald-100 hover:bg-emerald-900"
              }`}
              key={item}
              onClick={() => setActivePage(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-emerald-800 pt-5 text-xs text-emerald-200">
          <p>Myanmar-made sweaters</p>
          <p className="mt-1">Dubai delivery</p>
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-5 md:px-10">
          <div>
            <p className="text-sm text-slate-500">
              Welcome back, {session.user.full_name}
            </p>
            <h2 className="text-xl font-bold">
              {activePage === "Dashboard" ? "Admin Dashboard" : activePage}
            </h2>
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

        <section className="flex-1 p-6 md:p-10">
          {activePage === "Dashboard" && (
            <>
              <div className="mb-8">
                <p className="text-sm font-semibold text-amber-700">
                  BUSINESS OVERVIEW
                </p>
                <h3 className="mt-1 text-3xl font-bold tracking-tight">
                  Today’s overview
                </h3>
                <p className="mt-2 text-slate-600">
                  Monitor orders, deposits, stock, and customer feedback in one
                  place.
                </p>
              </div>

              <DashboardOverview token={session.token} />
              <RecentOrders token={session.token} />
              <LowStockVariants token={session.token} />
            </>
          )}

          {activePage === "Orders" && <OrdersPage token={session.token} />}

          {!["Dashboard", "Orders"].includes(activePage) && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold">{activePage}</h3>
              <p className="mt-2 text-slate-600">
                This section will be built next.
              </p>
            </div>
          )}
        </section>
        <Footer />
      </main>
    </div>
  );
}

export default App;
