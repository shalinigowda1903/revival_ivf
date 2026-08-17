"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  ImageIcon,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

type Embryo = {
  embryo_id: number;
  patient_id: number;
  doctor_id: number;
  image_path: string;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
};

type Doctor = {
  user_id: number;
  role: string;
};

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [embryo, setEmbryo] = useState<Embryo | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const embryoId = 6;

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("doctor_token") ||
        sessionStorage.getItem("doctor_token");

      if (!token) {
        setError(
          "Doctor authentication token was not found. Please sign in again."
        );
        setLoading(false);
        return;
      }

      const authResponse = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!authResponse.ok) {
        throw new Error("Your doctor session has expired.");
      }

      const doctorData = await authResponse.json();
      setDoctor(doctorData);

      if (doctorData.role !== "doctor") {
        throw new Error("Only doctors can access this dashboard.");
      }

      const embryoResponse = await fetch(
        `${API_URL}/embryos/${embryoId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!embryoResponse.ok) {
        const result = await embryoResponse.json().catch(() => null);

        throw new Error(
          result?.detail || "Unable to load embryo information."
        );
      }

      const embryoData: Embryo = await embryoResponse.json();

      setEmbryo(embryoData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Revival IVF backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem("doctor_token");
    localStorage.removeItem("doctor_id");
    localStorage.removeItem("doctor_first_name");
    localStorage.removeItem("doctor_last_name");
    localStorage.removeItem("doctor_email");
    localStorage.removeItem("doctor_role");
    sessionStorage.removeItem("doctor_token");
    sessionStorage.removeItem("doctor_id");
    sessionStorage.removeItem("doctor_first_name");
    sessionStorage.removeItem("doctor_last_name");
    sessionStorage.removeItem("doctor_email");
    sessionStorage.removeItem("doctor_role");

    window.location.href = "/doctor/login";
  }

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: BarChart3,
      active: true,
      href: "/doctor/dashboard",
    },
    {
      label: "Patients",
      icon: Users,
      active: false,
      href: "/doctor/patients",
    },
    {
      label: "Embryos",
      icon: ImageIcon,
      active: false,
      href: "/doctor/embryos",
    },
    {
      label: "Reports",
      icon: FileText,
      active: false,
      href: "/doctor/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[280px] border-r border-[#e6e3e1] bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">

          {/* LOGO */}
          <div className="flex h-[92px] items-center justify-between border-b border-[#eeecea] px-7">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#302a52] text-white">
                <HeartPulse size={23} />
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-[0.08em] text-[#302a52]">
                  REVIVAL IVF
                </p>

                <p className="mt-0.5 text-xs text-[#99959a]">
                  Doctor Portal
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-[#77737a] hover:bg-[#f5f4f3] lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* NAVIGATION */}
          <div className="px-4 py-7">

            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#aaa6ab]">
              Workspace
            </p>

            <nav className="mt-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition ${
                      item.active
                        ? "bg-[#302a52] text-white shadow-sm"
                        : "text-[#656168] hover:bg-[#f5f4f3] hover:text-[#302a52]"
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* SECURITY */}
          <div className="mt-auto p-5">

            <div className="rounded-2xl border border-[#e7e4e2] bg-[#fafaf9] p-4">

              <div className="flex items-center gap-2.5">
                <ShieldCheck
                  size={19}
                  className="text-[#6d6486]"
                />

                <span className="text-sm font-semibold text-[#49464c]">
                  Secure Workspace
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#858188]">
                Doctor-only access to protected patient and embryo records.
              </p>

            </div>

            <button
              onClick={logout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-[#77737a] hover:bg-[#f5f4f3] hover:text-[#302a52]"
            >
              <LogOut size={19} />
              Sign Out
            </button>

          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-[280px]">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#e6e3e1] bg-white/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">

          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2.5 text-[#555159] hover:bg-[#f4f3f2] lg:hidden"
          >
            <Menu size={23} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-[#969197]">
              Doctor Portal
            </p>

            <h1 className="mt-1 text-xl font-bold text-[#302a52]">
              Clinical Dashboard
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-4">

            <button className="relative rounded-xl p-2.5 text-[#77737a] hover:bg-[#f5f4f3]">
              <Bell size={21} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b86b72]" />
            </button>

            <div className="hidden h-9 w-px bg-[#e8e5e3] sm:block" />

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e6ef] text-[#50476d]">
                <Stethoscope size={20} />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#3d3940]">
                  Doctor
                </p>

                <p className="text-xs text-[#969197]">
                  ID #{doctor?.user_id ?? "—"}
                </p>
              </div>

            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          {/* WELCOME */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8b858c]">
                REVIVAL IVF
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#302a52] sm:text-4xl">
                Welcome to your dashboard
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#77737a]">
                Monitor patients, review embryo analysis, and manage
                clinical reports from one secure workspace.
              </p>
            </div>

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#ddd9d6] bg-white px-5 py-3 text-sm font-semibold text-[#4d4851] shadow-sm transition hover:border-[#c9c4c1] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh Data
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-7 rounded-2xl border border-[#ead5d5] bg-[#fff8f8] p-5">

              <div className="flex items-start gap-3">
                <Activity
                  size={21}
                  className="mt-0.5 text-[#a45d64]"
                />

                <div>
                  <p className="text-base font-semibold text-[#633f43]">
                    Unable to load dashboard
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#795c60]">
                    {error}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* STAT CARDS */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={<Users size={22} />}
              label="Patients"
              value="1"
              description="Connected patient"
            />

            <StatCard
              icon={<ImageIcon size={22} />}
              label="Embryos"
              value={embryo ? "1" : "0"}
              description="Current record"
            />

            <StatCard
              icon={<ClipboardList size={22} />}
              label="Analyses"
              value={
                embryo?.status === "analyzed"
                  ? "1"
                  : "0"
              }
              description="Completed analysis"
            />

            <StatCard
              icon={<FileText size={22} />}
              label="Reports"
              value="0"
              description="Ready to generate"
            />

          </div>

          {/* MAIN GRID */}
          <div className="mt-7 grid gap-7 xl:grid-cols-[1.6fr_1fr]">

            {/* EMBRYO ANALYSIS */}
            <section className="rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

              <div className="flex flex-col justify-between gap-4 border-b border-[#eeecea] px-6 py-6 sm:flex-row sm:items-center sm:px-7">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                    Latest Analysis
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-[#302a52]">
                    Embryo Analysis
                  </h3>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${
                    embryo?.status === "analyzed"
                      ? "bg-[#edf7f1] text-[#3d7657]"
                      : "bg-[#f7f3e9] text-[#806c3c]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      embryo?.status === "analyzed"
                        ? "bg-[#4f9b6e]"
                        : "bg-[#b2944d]"
                    }`}
                  />

                  {embryo?.status
                    ? embryo.status.charAt(0).toUpperCase() +
                      embryo.status.slice(1)
                    : "Loading"}
                </span>

              </div>

              <div className="p-6 sm:p-7">

                {loading ? (
                  <div className="flex min-h-[280px] items-center justify-center">
                    <div className="text-center">

                      <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-[#70658f]"
                      />

                      <p className="mt-4 text-sm text-[#858188]">
                        Loading embryo analysis...
                      </p>

                    </div>
                  </div>
                ) : embryo ? (
                  <>

                    {/* IMAGE PLACEHOLDER */}
                    <div className="overflow-hidden rounded-2xl border border-[#e5e2df] bg-[#f7f6f5]">

                      <div className="flex min-h-[230px] items-center justify-center">

                        <div className="text-center">

                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <ImageIcon
                              size={30}
                              className="text-[#756b91]"
                            />
                          </div>

                          <p className="mt-4 text-base font-semibold text-[#504b53]">
                            Embryo #{embryo.embryo_id}
                          </p>

                          <p className="mt-1 text-sm text-[#8b878c]">
                            {embryo.image_path}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* DETAILS */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">

                      <InfoBox
                        label="Patient ID"
                        value={`#${embryo.patient_id}`}
                      />

                      <InfoBox
                        label="Doctor ID"
                        value={`#${embryo.doctor_id}`}
                      />

                    </div>

                    {/* AI RESULTS */}
                    <div className="mt-6">

                      <div className="mb-4 flex items-center justify-between">

                        <div>
                          <p className="text-sm font-bold text-[#454149]">
                            AI Analysis Results
                          </p>

                          <p className="mt-1 text-xs text-[#969197]">
                            Current analysis stored by the backend
                          </p>
                        </div>

                        <CheckCircle2
                          size={21}
                          className="text-[#4f9b6e]"
                        />

                      </div>

                      <div className="grid gap-4 md:grid-cols-3">

                        <ResultCard
                          label="Embryo Grade"
                          value={embryo.embryo_grade ?? "—"}
                        />

                        <ResultCard
                          label="Confidence"
                          value={embryo.confidence ?? "—"}
                        />

                        <ResultCard
                          label="Implantation Chance"
                          value={
                            embryo.implantation_chance ?? "—"
                          }
                        />

                      </div>

                    </div>

                  </>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center text-center">
                    <div>
                      <ImageIcon
                        size={35}
                        className="mx-auto text-[#aaa6ab]"
                      />

                      <p className="mt-4 text-base font-semibold text-[#555159]">
                        No embryo data found
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* RIGHT COLUMN */}
            <div className="space-y-7">

              {/* DOCTOR PROFILE */}
              <section className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9e6ef] text-[#51486f]">
                    <UserRound size={25} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                      Doctor Account
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                      Doctor #{doctor?.user_id ?? "—"}
                    </h3>
                  </div>

                </div>

                <div className="mt-6 rounded-2xl bg-[#faf9f8] p-4">

                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={19}
                      className="text-[#70658f]"
                    />

                    <div>
                      <p className="text-sm font-semibold text-[#4c4850]">
                        Authentication Active
                      </p>

                      <p className="mt-0.5 text-xs text-[#908b91]">
                        Role: {doctor?.role ?? "doctor"}
                      </p>
                    </div>
                  </div>

                </div>

              </section>

              {/* QUICK ACTIONS */}
              <section className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#99949a]">
                      Workspace
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                      Quick Actions
                    </h3>
                  </div>

                  <Activity
                    size={21}
                    className="text-[#70658f]"
                  />

                </div>

                <div className="mt-5 space-y-3">

                  <QuickAction
                    href="/doctor/patients"
                    icon={<Users size={19} />}
                    title="View Patients"
                    description="Manage patient records"
                  />

                  <QuickAction
                    href="/doctor/embryos"
                    icon={<ImageIcon size={19} />}
                    title="Embryo Records"
                    description="Review uploaded embryos"
                  />

                  <QuickAction
                    href="/doctor/reports"
                    icon={<FileText size={19} />}
                    title="Clinical Reports"
                    description="View and generate reports"
                  />

                </div>

              </section>

              {/* SYSTEM STATUS */}
              <section className="rounded-3xl bg-[#302a52] p-6 text-white shadow-[0_15px_40px_rgba(48,42,82,0.18)]">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Activity size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Revival IVF AI System
                    </p>

                    <p className="mt-0.5 text-xs text-white/60">
                      Backend connection
                    </p>
                  </div>

                </div>

                <div className="mt-5 flex items-center gap-2">

                  <span className="h-2.5 w-2.5 rounded-full bg-[#72c58e]" />

                  <span className="text-sm font-medium text-white/85">
                    API Connected
                  </span>

                </div>

                <p className="mt-4 text-xs leading-5 text-white/60">
                  Patient and embryo data is being retrieved from the
                  Revival IVF FastAPI backend.
                </p>

              </section>

            </div>

          </div>

          {/* FOOTER */}
          <footer className="mt-10 border-t border-[#e5e2df] pt-6">

            <div className="flex flex-col justify-between gap-3 text-xs text-[#9a959b] sm:flex-row">

              <p>
                REVIVAL IVF • AI-Powered Fertility Care
              </p>

              <p>
                Secure Doctor Portal
              </p>

            </div>

          </footer>

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e1df] bg-white p-5 shadow-[0_8px_30px_rgba(45,42,50,0.04)]">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0eef3] text-[#655c80]">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-sm font-medium text-[#858188]">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-[#302a52]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#aaa6ab]">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e8e5e2] bg-[#fafaf9] p-4">

      <p className="text-xs font-medium text-[#99949a]">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-bold text-[#403b44]">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e1df] bg-[#fafaf9] p-5">

      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#969197]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold text-[#302a52]">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[#e9e6e4] p-3.5 transition hover:border-[#d7d2dd] hover:bg-[#faf9fb]"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0eef3] text-[#655c80] transition group-hover:bg-[#e6e2eb]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-[#48434b]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#99949a]">
          {description}
        </p>

      </div>

      <ChevronRight
        size={18}
        className="text-[#aaa6ab] transition group-hover:translate-x-0.5 group-hover:text-[#625a7b]"
      />

    </a>
  );
}