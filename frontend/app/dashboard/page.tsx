"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  ImagePlus,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  X,
} from "lucide-react";

interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const localToken = localStorage.getItem("doctor_token");
    const sessionToken = sessionStorage.getItem("doctor_token");

    const storage = localToken
      ? localStorage
      : sessionToken
        ? sessionStorage
        : null;

    if (!storage) {
      window.location.href = "/doctor/login";
      return;
    }

    const role = storage.getItem("doctor_role");

    if (role !== "doctor") {
      window.location.href = "/doctor/login";
      return;
    }

    setDoctor({
      id: storage.getItem("doctor_id") || "",
      firstName: storage.getItem("doctor_first_name") || "Doctor",
      lastName: storage.getItem("doctor_last_name") || "",
      email: storage.getItem("doctor_email") || "",
      role: role,
    });
  }, []);

  const handleLogout = () => {
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
  };

  const doctorName = doctor
    ? `${doctor.firstName} ${doctor.lastName}`.trim()
    : "Doctor";

  const initials =
    doctorName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DR";

  if (!doctor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ddd9e5] border-t-[#302a52]" />

          <p className="mt-4 text-sm font-medium text-[#68656b]">
            Loading Doctor Portal...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#302e34]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-[#e4e1df] bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-[88px] items-center border-b border-[#eeeae8] px-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/revival-ivf-logo.jpeg"
              alt="REVIVAL IVF"
              className="h-11 w-11 rounded-full border border-[#e1ddda] object-cover"
            />

            <div>
              <p className="text-[15px] font-bold tracking-wide text-[#302a52]">
                REVIVAL IVF
              </p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a969b]">
                Doctor Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-2 text-[#77737a] hover:bg-[#f3f1ef] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa6aa]">
            Main Menu
          </p>

          <SidebarItem
            icon={<Home size={19} />}
            label="Dashboard"
            active
          />

          <SidebarItem
            icon={<Users size={19} />}
            label="Patients"
          />

          <SidebarItem
            icon={<ImagePlus size={19} />}
            label="Embryo Upload"
          />

          <SidebarItem
            icon={<Brain size={19} />}
            label="AI Analysis"
          />

          <SidebarItem
            icon={<ClipboardList size={19} />}
            label="Reports"
          />

          <SidebarItem
            icon={<BarChart3 size={19} />}
            label="Analytics"
          />

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa6aa]">
            Account
          </p>

          <SidebarItem
            icon={<Settings size={19} />}
            label="Settings"
          />
        </nav>

        {/* SECURITY CARD */}
        <div className="mx-4 mb-4 rounded-2xl border border-[#e7e3e1] bg-[#faf9f8] p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eeeaf5] text-[#5e557c]">
              <ShieldCheck size={18} />
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4c484f]">
                Secure Workspace
              </p>

              <p className="mt-1 text-[11px] leading-4 text-[#8a868b]">
                Doctor-only access is enabled.
              </p>
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="border-t border-[#eeeae8] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#6d686e] transition hover:bg-[#f5f3f2] hover:text-[#302a52]"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-[270px]">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 border-b border-[#e5e2df] bg-[#f7f7f5]/95 backdrop-blur">
          <div className="flex h-[88px] items-center justify-between px-5 sm:px-7 lg:px-10">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-[#e1dedb] bg-white p-2.5 text-[#5e5a60] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#969196]">
                  Doctor Portal
                </p>

                <h1 className="mt-1 text-xl font-semibold text-[#302a52] sm:text-2xl">
                  Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              {/* SEARCH */}
              <button
                type="button"
                className="hidden rounded-xl border border-[#e0ddda] bg-white p-2.5 text-[#77737a] transition hover:text-[#302a52] sm:block"
              >
                <Search size={19} />
              </button>

              {/* NOTIFICATION */}
              <button
                type="button"
                className="relative rounded-xl border border-[#e0ddda] bg-white p-2.5 text-[#77737a] transition hover:text-[#302a52]"
              >
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#756a91]" />
              </button>

              {/* DOCTOR PROFILE */}
              <div className="hidden h-9 w-px bg-[#dfdcd9] sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#302a52] text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="hidden min-w-0 md:block">
                  <p className="max-w-[160px] truncate text-sm font-semibold text-[#403c43]">
                    Dr. {doctorName}
                  </p>

                  <p className="text-[11px] text-[#959096]">
                    {doctor.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          {/* WELCOME */}
          <section className="rounded-3xl bg-[#302a52] p-6 text-white shadow-[0_18px_50px_rgba(48,42,82,0.14)] sm:p-8">
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Stethoscope size={18} />

                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                    Clinical Workspace
                  </span>
                </div>

                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Welcome, Dr. {doctor.firstName}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                  Manage your IVF patients, embryo images, AI-assisted
                  analysis and clinical reports from one secure workspace.
                </p>
              </div>

              <button
                type="button"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#302a52] shadow-sm transition hover:bg-[#f4f2f7]"
              >
                <ImagePlus size={18} />
                Upload Embryo
              </button>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Users size={21} />}
              label="Total Patients"
              value="0"
              description="Registered patients"
            />

            <StatCard
              icon={<ImagePlus size={21} />}
              label="Embryos Uploaded"
              value="0"
              description="Images in your workspace"
            />

            <StatCard
              icon={<Brain size={21} />}
              label="AI Analyses"
              value="0"
              description="Completed analyses"
            />

            <StatCard
              icon={<Activity size={21} />}
              label="Pending"
              value="0"
              description="Awaiting analysis"
            />
          </section>

          {/* TWO COLUMN AREA */}
          <section className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            {/* RECENT ACTIVITY */}
            <div className="rounded-3xl border border-[#e2dfdc] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#38343a]">
                    Recent Activity
                  </h3>

                  <p className="mt-1 text-xs text-[#99959a]">
                    Your latest patient and embryo activity
                  </p>
                </div>

                <button
                  type="button"
                  className="text-xs font-semibold text-[#665d80] hover:text-[#302a52]"
                >
                  View all
                </button>
              </div>

              <div className="mt-7 flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-[#dedbd8] bg-[#fbfaf9]">
                <div className="max-w-xs text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaf5] text-[#675d84]">
                    <Activity size={21} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-[#4b474d]">
                    No activity yet
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-[#949095]">
                    Once you upload embryo images or manage patients,
                    recent activity will appear here.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-3xl border border-[#e2dfdc] bg-white p-6 shadow-sm sm:p-7">
              <div>
                <h3 className="text-lg font-semibold text-[#38343a]">
                  Quick Actions
                </h3>

                <p className="mt-1 text-xs text-[#99959a]">
                  Frequently used doctor tools
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <QuickAction
                  icon={<Users size={20} />}
                  title="View Patients"
                  description="Manage your IVF patients"
                />

                <QuickAction
                  icon={<ImagePlus size={20} />}
                  title="Upload Embryo"
                  description="Add a new embryo image"
                />

                <QuickAction
                  icon={<Brain size={20} />}
                  title="AI Analysis"
                  description="Analyze an uploaded embryo"
                />

                <QuickAction
                  icon={<FileText size={20} />}
                  title="View Reports"
                  description="Review completed reports"
                />
              </div>
            </div>
          </section>

          {/* AI SECTION */}
          <section className="mt-7 rounded-3xl border border-[#e2dfdc] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eeeaf5] text-[#5f557d]">
                  <Brain size={23} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#38343a]">
                    AI Embryo Analysis
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#89858a]">
                    Upload an embryo image and use the Revival IVF AI
                    analysis pipeline to generate embryo grading,
                    confidence and implantation-related predictions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d9d4e3] bg-[#f7f5fa] px-5 py-3 text-sm font-semibold text-[#4e456d] transition hover:bg-[#eeeaf5]"
              >
                Start Analysis
                <ChevronRight size={17} />
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="pb-5 pt-9 text-center">
            <p className="text-xs text-[#aaa6aa]">
              REVIVAL IVF • AI-Powered Fertility Care
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#eeeaf5] text-[#302a52]"
          : "text-[#77737a] hover:bg-[#f6f4f2] hover:text-[#302a52]"
      }`}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6d6387]" />
      )}
    </button>
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
    <div className="rounded-2xl border border-[#e2dfdc] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#918d92]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#353138]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edf5] text-[#625879]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#a09ca1]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-4 rounded-2xl border border-[#ebe8e5] bg-[#fcfbfa] p-4 text-left transition hover:border-[#dcd6e6] hover:bg-[#f8f6fa]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeeaf5] text-[#625879]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#48444a]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-[#99959a]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={17}
        className="text-[#aaa6aa] transition group-hover:translate-x-0.5 group-hover:text-[#625879]"
      />
    </button>
  );
}