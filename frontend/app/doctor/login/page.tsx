"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

const DEFAULT_DOCTOR_EMAIL = "doctor@revivalivf.com";
const DEFAULT_DOCTOR_PASSWORD = "RevivalIVF@123";

export default function DoctorLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState(DEFAULT_DOCTOR_EMAIL);
  const [password, setPassword] = useState(DEFAULT_DOCTOR_PASSWORD);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/doctors/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.detail || "Invalid email or password"
        );
      }

      if (!data) {
        throw new Error("The server returned an invalid login response.");
      }

      /*
       * Save doctor authentication information.
       *
       * Remember Me:
       * checked    -> localStorage
       * unchecked  -> sessionStorage
       */

      const storage = rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "doctor_token",
        data.access_token
      );

      storage.setItem(
        "doctor_id",
        String(data.doctor_id)
      );

      storage.setItem(
        "doctor_first_name",
        data.first_name || ""
      );

      storage.setItem(
        "doctor_last_name",
        data.last_name || ""
      );

      storage.setItem(
        "doctor_email",
        data.email || ""
      );

      storage.setItem(
        "doctor_role",
        data.role || "doctor"
      );

      /*
       * Remove old login information
       * from the opposite storage.
       */

      const otherStorage = rememberMe
        ? sessionStorage
        : localStorage;

      otherStorage.removeItem("doctor_token");
      otherStorage.removeItem("doctor_id");
      otherStorage.removeItem("doctor_first_name");
      otherStorage.removeItem("doctor_last_name");
      otherStorage.removeItem("doctor_email");
      otherStorage.removeItem("doctor_role");

      /*
       * Go to the Doctor Dashboard
       */

      window.location.href = "/doctor/dashboard";
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Cannot connect to the Revival IVF server. Please make sure the FastAPI backend is running."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#2f2e33]">
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[980px]">
          <div className="grid overflow-hidden rounded-[30px] border border-[#dfdcd9] bg-white shadow-[0_25px_80px_rgba(45,42,50,0.10)] md:grid-cols-[0.85fr_1.15fr]">
            {/* LEFT SIDE - BRAND PANEL */}
            <div className="relative flex min-h-[620px] flex-col items-center justify-center bg-[#302a52] px-8 py-12 text-center">
              <div className="absolute left-[-70px] top-[-70px] h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute bottom-[-80px] right-[-60px] h-48 w-48 rounded-full border border-white/10" />

              <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-white p-4 shadow-xl">
                <img
                  src="/images/revival-ivf-logo.jpeg"
                  alt="Revival IVF Logo"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                REVIVAL IVF
              </p>

              <h2 className="relative mt-3 text-3xl font-semibold text-white">
                Doctor Care
              </h2>

              <p className="relative mt-4 max-w-xs text-sm leading-6 text-white/70">
                Secure access to IVF clinical workflows, patient insights,
                and doctor-only operational controls.
              </p>

              <div className="relative mt-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <ShieldCheck size={16} className="text-white/80" />
                <span className="text-xs text-white/70">
                  Secure doctor portal
                </span>
              </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
            <div className="px-7 py-10 sm:px-10 md:px-12">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88858a]">
                  REVIVAL IVF
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#302a52]">
                  Doctor Login
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#747176]">
                  Sign in to securely manage patient care,
                  embryo workflows, and treatment operations.
                </p>
              </div>

              <div className="mb-5 rounded-xl border border-[#e8e4e0] bg-[#f6f4f2] px-4 py-3 text-xs leading-5 text-[#5f5b66]">
                <p className="font-semibold uppercase tracking-[0.12em] text-[#3b3652]">
                  Demo credentials
                </p>
                <p className="mt-1">
                  Email: <span className="font-semibold text-[#29253d]">{DEFAULT_DOCTOR_EMAIL}</span>
                </p>
                <p>
                  Password: <span className="font-semibold text-[#29253d]">{DEFAULT_DOCTOR_PASSWORD}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#444148]"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="doctor@example.com"
                      autoComplete="email"
                      required
                      className="h-13 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-[#444148]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="h-13 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-12 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#858188] hover:bg-[#efeeec] hover:text-[#40385f]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-[#c9c6c3] accent-[#302a52]"
                    />

                    <span className="text-sm text-[#656269]">Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-[#665d80] hover:text-[#302a52]"
                    onClick={() => {
                      setError("Password recovery will be connected next.");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-5 text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#302a52] text-sm font-semibold text-white shadow-md transition hover:bg-[#403866] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Sign In Securely
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#e8e5e2] bg-[#fafaf9] p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#70658f]" />
                <p className="text-xs leading-5 text-[#77747a]">
                  This is a secure doctor-only area. Patient information and embryo records are protected by role-based access.
                </p>
              </div>

              <div className="mt-7 text-center">
                <Link
                  href="/"
                  className="text-sm font-medium text-[#77747a] hover:text-[#302a52]"
                >
                  ← Back to REVIVAL IVF
                </Link>
              </div>

              <p className="mt-8 text-center text-xs text-[#aaa7ab]">
                REVIVAL IVF • AI-Powered Fertility Care
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
