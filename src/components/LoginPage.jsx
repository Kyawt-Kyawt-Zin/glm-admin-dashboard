import { useState } from "react";
import goldenLoomLogo from "../assets/golden-loom-logo.png";
import { login } from "../services/api.js";
import Footer from "./Footer.jsx";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const loginData = await login({ email, password });

      if (!["admin", "staff"].includes(loginData.user.role)) {
        throw new Error(
          "This dashboard is available only for admin and staff accounts.",
        );
      }

      onLogin(loginData);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-stone-100">
      <div className="flex flex-1 items-center justify-center p-6">
        <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="mx-auto mb-5 max-w-40 rounded-xl bg-stone-50 p-2">
            <img
              src={goldenLoomLogo}
              alt="Golden Loom Myanmar"
              className="h-20 w-full object-contain"
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold tracking-wider text-amber-700">
              STAFF PORTAL
            </p>
            <h1 className="mt-2 text-2xl font-bold text-emerald-950">
              Sign in to the dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your Golden Loom Myanmar admin or staff account.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Email
              </span>
              <input
                className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-2.5 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>

            {errorMessage && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              className="w-full rounded-lg bg-emerald-950 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </main>
  );
}

export default LoginPage;
