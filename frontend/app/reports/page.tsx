"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Download,
  FileText,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

interface DoctorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DoctorReports() {
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      firstName:
        storage.getItem("doctor_first_name") || "Doctor",
      lastName:
        storage.getItem("doctor_last_name") || "",
      email:
        storage.getItem("doctor_email") || "",
      role,
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

  if (!doctor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ddd9e5] border-t-[#302a52]" />

          <p className="mt-4 text-sm font-medium text-[#68656b]">
            Loading Reports...
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

          <NavItem
            icon={<Stethoscope size={19} />}
            label="Dashboard"
            href="/dashboard"
          />

          <NavItem
            icon={<UserRound size={19} />}
            label="Patients"
            href="/doctor/patients"
          />

          <NavItem
            icon={<FileText size={19} />}
            label="Reports"
            href="/doctor/reports"
            active
          />

          <NavItem
            icon={<ShieldCheck size={19} />}
            label="AI Analysis"
            href="/doctor/analysis"
          />

          <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa6aa]">
            Account
          </p>

          <NavItem
            icon={<UserRound size={19} />}
            label="Profile"
            href="/doctor/profile"
          />
        </nav>

        {/* SECURITY */}
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

      {/* MAIN */}
      <div className="lg:pl-[270px]">
        {/* HEADER */}
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
                  Reports
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                className="relative rounded-xl border border-[#e0ddda] bg-white p-2.5 text-[#77737a]"
              >
                <Bell size={19} />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#756a91]" />
              </button>

              <div className="hidden h-9 w-px bg-[#dfdcd9] sm:block" />

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-[#403c43]">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>

                <p className="text-[11px] text-[#959096]">
                  {doctor.email}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#302a52] text-xs font-bold text-white">
                {doctor.firstName.charAt(0)}
                {doctor.lastName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
          {/* BACK */}
          <button
            type="button"
            onClick={() =>
              (window.location.href = "/dashboard")
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-[#77737a] transition hover:text-[#302a52]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          {/* PAGE INTRO */}
          <section className="rounded-3xl border border-[#e2dfdc] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeaf5] text-[#5f557d]">
                    <FileText size={23} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[#353138]">
                      Embryo Reports
                    </h2>

                    <p className="mt-1 text-sm text-[#949095]">
                      Review AI-assisted embryo analysis reports.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#faf9f8] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#aaa6aa]">
                  Doctor
                </p>

                <p className="mt-1 text-sm font-semibold text-[#48444a]">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
              </div>
            </div>
          </section>

          {/* SEARCH */}
          <section className="mt-6 rounded-2xl border border-[#e2dfdc] bg-white p-4 shadow-sm sm:p-5">
            <div className="relative max-w-xl">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99959a]"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by patient name or embryo ID..."
                className="h-12 w-full rounded-xl border border-[#dedbd8] bg-[#fafaf9] pl-11 pr-4 text-sm text-[#403c43] outline-none transition placeholder:text-[#aaa6aa] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
              />
            </div>
          </section>

          {/* REPORT TABLE */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-[#e2dfdc] bg-white shadow-sm">
            <div className="border-b border-[#eeeae8] px-6 py-5 sm:px-7">
              <h3 className="text-lg font-semibold text-[#38343a]">
                Analysis Reports
              </h3>

              <p className="mt-1 text-xs text-[#99959a]">
                Completed embryo analysis results will appear here.
              </p>
            </div>

            {/* EMPTY STATE */}
            <div className="px-6 py-16 sm:px-7">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeeaf5] text-[#625879]">
                  <FileText size={27} />
                </div>

                <h4 className="mt-5 text-lg font-semibold text-[#48444a]">
                  No reports available
                </h4>

                <p className="mt-2 text-sm leading-6 text-[#969197]">
                  Your completed embryo analysis reports will appear
                  here once an embryo has been uploaded and analyzed.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/dashboard")
                  }
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#403866]"
                >
                  Go to Dashboard
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>

          {/* INFORMATION */}
          <section className="mt-6 rounded-2xl border border-[#e2dfdc] bg-[#faf9f8] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[#70658f]"
              />

              <div>
                <h4 className="text-sm font-semibold text-[#4b474d]">
                  Clinical report security
                </h4>

                <p className="mt-1 text-xs leading-5 text-[#89858a]">
                  Embryo analysis reports are available only to
                  authorized doctors. Patient and embryo information
                  is protected through role-based authentication.
                </p>
              </div>
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
   NAVIGATION ITEM
========================================================= */

function NavItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
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
    </a>
  );
}