"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

const DEFAULT_PATIENT_EMAIL = "patient@revivalivf.com";
const DEFAULT_PATIENT_PASSWORD = "PatientIVF@123";

export default function PatientLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(DEFAULT_PATIENT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PATIENT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/patients/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Invalid email or password");
      }

      localStorage.setItem("patient_token", data.access_token);
      localStorage.setItem("patient_id", String(data.patient_id));
      localStorage.setItem("patient_first_name", data.first_name || "");
      localStorage.setItem("patient_last_name", data.last_name || "");
      localStorage.setItem("patient_email", data.email || "");
      localStorage.setItem("patient_role", data.role || "patient");

      window.location.href = "/";
    } catch (err) {
      if (err instanceof TypeError) {
        setError("Cannot connect to the Revival IVF server. Please make sure the FastAPI backend is running.");
      } else {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#2f2e33]">
      <section className="flex min-h-screen items-center justify-center px-6 py-20">
        <div className="w-full max-w-[470px]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#302a52] text-white shadow-lg">
            <UserRound size={29} strokeWidth={1.8} />
          </div>

          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#88858a]">REVIVAL IVF</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#302a52]">Patient Login</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#747176]">
              Access your account to review treatment details and secure patient information.
            </p>
          </div>

          <div className="mt-9 rounded-3xl border border-[#dfdcd9] bg-white p-7 shadow-[0_20px_60px_rgba(45,42,50,0.08)] sm:p-9">
            <div className="mb-5 rounded-xl border border-[#e8e4e0] bg-[#f6f4f2] px-4 py-3 text-xs leading-5 text-[#5f5b66]">
              <p className="font-semibold uppercase tracking-[0.12em] text-[#3b3652]">Demo credentials</p>
              <p className="mt-1">Email: <span className="font-semibold text-[#29253d]">{DEFAULT_PATIENT_EMAIL}</span></p>
              <p>Password: <span className="font-semibold text-[#29253d]">{DEFAULT_PATIENT_PASSWORD}</span></p>
            </div>

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#444148]">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="patient@example.com"
                    autoComplete="email"
                    required
                    className="h-13 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#444148]">Password</label>
                <div className="relative">
                  <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]" />
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
                This is a secure patient area. Your health information is protected and available only to your authorised account.
              </p>
            </div>
          </div>

          <div className="mt-7 text-center">
            <a href="/" className="text-sm font-medium text-[#77747a] hover:text-[#302a52]">← Back to REVIVAL IVF</a>
          </div>

          <p className="mt-8 text-center text-xs text-[#aaa7ab]">REVIVAL IVF • AI-Powered Fertility Care</p>
        </div>
      </section>
    </main>
  );
}
