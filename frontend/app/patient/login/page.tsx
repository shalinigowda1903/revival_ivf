"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export default function PatientLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "/api";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/patients/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error(
          data?.detail || "Invalid email or password."
        );
      }

      if (!data) {
        throw new Error("The server returned an invalid login response.");
      }

      localStorage.setItem(
        "patient_token",
        data.access_token
      );

      localStorage.setItem(
        "patient_id",
        String(data.patient_id)
      );

      localStorage.setItem(
        "patient_first_name",
        data.first_name || ""
      );

      localStorage.setItem(
        "patient_last_name",
        data.last_name || ""
      );

      localStorage.setItem(
        "patient_email",
        data.email || ""
      );

      localStorage.setItem(
        "patient_role",
        data.role || "patient"
      );

      window.location.href = "/patient/dashboard";

    } catch (err) {
      console.error("Patient login error:", err);

      if (
        err instanceof TypeError ||
        (err instanceof Error &&
          err.message.toLowerCase().includes("fetch"))
      ) {
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

            {/* LEFT SIDE */}
            <div className="relative flex min-h-[620px] flex-col items-center justify-center bg-[#302a52] px-8 py-12 text-center">

              <div className="absolute left-[-70px] top-[-70px] h-40 w-40 rounded-full border border-white/10" />

              <div className="absolute bottom-[-80px] right-[-60px] h-48 w-48 rounded-full border border-white/10" />

              {/* IVF LOGO */}
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
                Patient Care
              </h2>

              <p className="relative mt-4 max-w-xs text-sm leading-6 text-white/70">
                Secure access to your IVF treatment information,
                appointments and authorised patient records.
              </p>

              <div className="relative mt-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">

                <ShieldCheck
                  size={16}
                  className="text-white/80"
                />

                <span className="text-xs text-white/70">
                  Secure patient portal
                </span>

              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="px-7 py-10 sm:px-10 md:px-12">

              <div className="mb-8">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88858a]">
                  REVIVAL IVF
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#302a52]">
                  Patient Login
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#747176]">
                  Access your account to review your treatment
                  details and secure patient information.
                </p>

              </div>

              <form onSubmit={handleSubmit}>

                {/* EMAIL */}
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
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="patient@example.com"
                      autoComplete="email"
                      required
                      className="h-13 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
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
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="h-13 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-12 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#858188] hover:bg-[#efeeec] hover:text-[#40385f]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                    <p className="text-sm leading-5 text-red-700">
                      {error}
                    </p>

                  </div>
                )}

                {/* LOGIN */}
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

              {/* CREATE ACCOUNT */}
              <div className="mt-6 rounded-xl border border-[#e5e1de] bg-[#fafaf9] px-4 py-4 text-center">

                <p className="text-sm text-[#77747a]">
                  Don't have a patient account?
                </p>

                <a
                  href="/patient/register"
                  className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#302a52] hover:text-[#504575]"
                >
                  <UserPlus size={17} />
                  Create a new account
                </a>

              </div>

              {/* SECURITY */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#e8e5e2] bg-[#fafaf9] p-4">

                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#70658f]"
                />

                <p className="text-xs leading-5 text-[#77747a]">
                  This is a secure patient area. Your health
                  information is protected and available only to
                  your authorised account.
                </p>

              </div>

              {/* BACK */}
              <div className="mt-7 text-center">

                <a
                  href="/"
                  className="text-sm font-medium text-[#77747a] hover:text-[#302a52]"
                >
                  ← Back to REVIVAL IVF
                </a>

              </div>

            </div>

          </div>

          <p className="mt-7 text-center text-xs text-[#aaa7ab]">
            REVIVAL IVF • AI-Powered Fertility Care
          </p>

        </div>

      </section>

    </main>
  );
}
