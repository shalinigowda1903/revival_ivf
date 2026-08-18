"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  FileText,
  HeartPulse,
  LogOut,
  Menu,
  Pill,
  ShieldCheck,
  UserRound,
  X,
  Stethoscope,
  ClipboardList,
} from "lucide-react";

const API_URL = "/api";

type Patient = {
  user_id?: number;
  patient_id?: number;

  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  role?: string;

  medical_history?: string;
  current_problems?: string;
  previous_surgeries?: string;
  chronic_conditions?: string;
  allergies?: string;
  current_medications?: string;
  family_medical_history?: string;
  ongoing_treatments?: string;

  previous_ivf_history?: string;
  previous_pregnancy_history?: string;
  infertility_duration?: string;
  infertility_cause?: string;
  menstrual_history?: string;
  fertility_treatment_history?: string;

  doctor_notes?: string;

  emergency_contact_name?: string;
  emergency_contact_phone?: string;
};

type Embryo = {
  embryo_id: number;
  patient_id?: number;
  doctor_id?: number;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
};

export default function PatientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [patient, setPatient] = useState<Patient | null>(null);

  const [embryos, setEmbryos] = useState<Embryo[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    loadPatientDashboard();
  }, []);

  async function loadPatientDashboard() {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("patient_token") ||
        sessionStorage.getItem("patient_token");

      if (!token) {
        setError(
          "Patient authentication token was not found. Please sign in again."
        );

        setLoading(false);
        return;
      }

      /* =====================================================
         LOAD LOGGED-IN PATIENT
      ===================================================== */

      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Your patient session has expired.");
      }

      const patientData: Patient = await response.json();

      if (patientData.role !== "patient") {
        throw new Error("Only patients can access this dashboard.");
      }

      setPatient(patientData);

      /* =====================================================
         LOAD PATIENT MEDICAL SUMMARY
      ===================================================== */

      try {
        const medicalResponse = await fetch(
          `${API_URL}/patients/me/medical-summary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (medicalResponse.ok) {
          const medicalData: Pick<
            Patient,
            | "medical_history"
            | "ongoing_treatments"
            | "current_medications"
          > = await medicalResponse.json();

          setPatient({
            ...patientData,
            ...medicalData,
          });
        }
      } catch {
        // The dashboard remains available if the summary cannot be loaded.
      }

      /* =====================================================
         LOAD PATIENT EMBRYOS
      ===================================================== */

      const patientId =
        patientData.patient_id ?? patientData.user_id;

      if (patientId) {
        try {
          const embryoResponse = await fetch(
            `${API_URL}/patients/${patientId}/embryos`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (embryoResponse.ok) {
            const embryoData = await embryoResponse.json();

            if (Array.isArray(embryoData)) {
              setEmbryos(embryoData);
            }
          }
        } catch {
          /*
           * Embryo endpoint may not exist yet.
           * Patient dashboard should still work.
           */
          setEmbryos([]);
        }
      }
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

  /* =====================================================
     LOGOUT
  ===================================================== */

  function logout() {
    localStorage.removeItem("patient_token");
    localStorage.removeItem("patient_id");
    localStorage.removeItem("patient_first_name");
    localStorage.removeItem("patient_last_name");
    localStorage.removeItem("patient_email");
    localStorage.removeItem("patient_role");

    sessionStorage.removeItem("patient_token");
    sessionStorage.removeItem("patient_id");
    sessionStorage.removeItem("patient_first_name");
    sessionStorage.removeItem("patient_last_name");
    sessionStorage.removeItem("patient_email");
    sessionStorage.removeItem("patient_role");

    window.location.href = "/patient/login";
  }

  /* =====================================================
     PATIENT NAME
  ===================================================== */

  const patientName =
    patient?.first_name || patient?.last_name
      ? `${patient?.first_name ?? ""} ${
          patient?.last_name ?? ""
        }`.trim()
      : "Patient";

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

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
                  Patient Portal
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
              My Care
            </p>

            <nav className="mt-4 space-y-2">

              <a
                href="/patient/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-[#302a52] px-4 py-3.5 text-[15px] font-medium text-white shadow-sm"
              >
                <Activity size={20} />
                Dashboard
              </a>

              <a
                href="/patient/reports"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#656168] transition hover:bg-[#f5f4f3] hover:text-[#302a52]"
              >
                <FileText size={20} />
                My Reports
              </a>

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
                  Secure Patient Portal
                </span>

              </div>

              <p className="mt-2 text-xs leading-5 text-[#858188]">
                Your personal IVF information is protected and
                available only to authorized users.
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

      {/* =================================================
          MAIN AREA
      ================================================= */}

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
              Patient Portal
            </p>

            <h1 className="mt-1 text-xl font-bold text-[#302a52]">
              My IVF Dashboard
            </h1>

          </div>

          <div className="ml-auto flex items-center gap-4">

            <div className="hidden h-9 w-px bg-[#e8e5e3] sm:block" />

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e6ef] text-[#50476d]">
                <UserRound size={20} />
              </div>

              <div className="hidden sm:block">

                <p className="text-sm font-semibold text-[#3d3940]">
                  {patientName}
                </p>

                <p className="text-xs text-[#969197]">
                  Patient
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">

          {/* WELCOME */}

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#8b858c]">
                REVIVAL IVF
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#302a52] sm:text-4xl">
                Welcome, {patientName}
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[#77737a]">
                View your IVF care information, treatment details,
                embryo analysis status, and clinical reports in one
                secure place.
              </p>

            </div>

            <button
              onClick={loadPatientDashboard}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#ddd9d6] bg-white px-5 py-3 text-sm font-semibold text-[#4d4851] shadow-sm transition hover:bg-[#fafafa] disabled:opacity-60"
            >
              <Activity
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

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              icon={<UserRound size={22} />}
              label="Patient ID"
              value={
                patient?.patient_id
                  ? `#${patient.patient_id}`
                  : patient?.user_id
                    ? `#${patient.user_id}`
                    : "—"
              }
              description="Your registered ID"
            />

            <SummaryCard
              icon={<CalendarDays size={22} />}
              label="Age"
              value={
                patient?.age !== undefined
                  ? `${patient.age}`
                  : "—"
              }
              description="Years"
            />

            <SummaryCard
              icon={<Activity size={22} />}
              label="Embryos"
              value={loading ? "..." : `${embryos.length}`}
              description="Available records"
            />

            <SummaryCard
              icon={<FileText size={22} />}
              label="Reports"
              value="0"
              description="Available reports"
            />

          </div>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="border-b border-[#eeecea] px-6 py-6 sm:px-7">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                Personal Information
              </p>

              <h3 className="mt-2 text-xl font-bold text-[#302a52]">
                Patient Details
              </h3>

            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

              <InfoBox
                label="Full Name"
                value={patientName}
              />

              <InfoBox
                label="Patient ID"
                value={
                  patient?.patient_id
                    ? `#${patient.patient_id}`
                    : patient?.user_id
                      ? `#${patient.user_id}`
                      : "—"
                }
              />

              <InfoBox
                label="Email"
                value={patient?.email ?? "—"}
              />

              <InfoBox
                label="Phone"
                value={patient?.phone ?? "—"}
              />

              <InfoBox
                label="Age"
                value={
                  patient?.age !== undefined
                    ? `${patient.age} years`
                    : "—"
                }
              />

              <InfoBox
                label="Gender"
                value={patient?.gender ?? "—"}
              />

            </div>

          </section>

          {/* =================================================
              MEDICAL INFORMATION
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="border-b border-[#eeecea] px-6 py-6 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9e6ef] text-[#51486f]">
                  <HeartPulse size={23} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                    Clinical Information
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-[#302a52]">
                    Medical History
                  </h3>

                </div>

              </div>

            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

              <InfoBox
                label="Medical History"
                value={patient?.medical_history ?? "—"}
              />

              <InfoBox
                label="Current Problems"
                value={patient?.current_problems ?? "—"}
              />

              <InfoBox
                label="Previous Surgeries"
                value={patient?.previous_surgeries ?? "—"}
              />

              <InfoBox
                label="Chronic Conditions"
                value={patient?.chronic_conditions ?? "—"}
              />

              <InfoBox
                label="Allergies"
                value={patient?.allergies ?? "—"}
              />

              <InfoBox
                label="Family Medical History"
                value={patient?.family_medical_history ?? "—"}
              />

            </div>

          </section>

          {/* =================================================
              TREATMENT INFORMATION
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="border-b border-[#eeecea] px-6 py-6 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0eef3] text-[#655c80]">
                  <Pill size={23} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                    IVF Treatment
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-[#302a52]">
                    Current Treatment
                  </h3>

                </div>

              </div>

            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

              <InfoBox
                label="Current Medications"
                value={patient?.current_medications ?? "—"}
              />

              <InfoBox
                label="Ongoing Treatments"
                value={patient?.ongoing_treatments ?? "—"}
              />

              <InfoBox
                label="Fertility Treatment History"
                value={patient?.fertility_treatment_history ?? "—"}
              />

            </div>

          </section>

          {/* =================================================
              IVF HISTORY
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="border-b border-[#eeecea] px-6 py-6 sm:px-7">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9e6ef] text-[#51486f]">
                  <ClipboardList size={23} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                    Fertility Information
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-[#302a52]">
                    IVF & Pregnancy History
                  </h3>

                </div>

              </div>

            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

              <InfoBox
                label="Previous IVF History"
                value={patient?.previous_ivf_history ?? "—"}
              />

              <InfoBox
                label="Previous Pregnancy History"
                value={patient?.previous_pregnancy_history ?? "—"}
              />

              <InfoBox
                label="Infertility Duration"
                value={patient?.infertility_duration ?? "—"}
              />

              <InfoBox
                label="Infertility Cause"
                value={patient?.infertility_cause ?? "—"}
              />

              <InfoBox
                label="Menstrual History"
                value={patient?.menstrual_history ?? "—"}
              />

            </div>

          </section>

          {/* =================================================
              CARE INFORMATION
          ================================================= */}

          <div className="mt-7 grid gap-7 xl:grid-cols-2">

            <section className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9e6ef] text-[#51486f]">
                  <HeartPulse size={23} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                    IVF Care
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                    Treatment Overview
                  </h3>

                </div>

              </div>

              <div className="mt-6 space-y-3">

                <CareItem
                  icon={<CheckCircle2 size={19} />}
                  title="Registration"
                  description="Your patient account is active."
                />

                <CareItem
                  icon={<Activity size={19} />}
                  title="Embryo Analysis"
                  description={
                    embryos.length > 0
                      ? "Embryo analysis information is available."
                      : "No embryo analysis is currently available."
                  }
                />

                <CareItem
                  icon={<FileText size={19} />}
                  title="Clinical Reports"
                  description="Reports will appear here when available."
                />

              </div>

            </section>

            {/* DOCTOR NOTES */}

            <section className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0eef3] text-[#655c80]">
                  <Stethoscope size={23} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                    Clinical Notes
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                    Doctor Notes
                  </h3>

                </div>

              </div>

              <div className="mt-6 rounded-2xl bg-[#faf9f8] p-5">

                <p className="text-sm leading-6 text-[#77737a]">
                  {patient?.doctor_notes ||
                    "No doctor notes have been added yet."}
                </p>

              </div>

            </section>

          </div>

          {/* =================================================
              EMBRYO ANALYSIS
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="border-b border-[#eeecea] px-6 py-6 sm:px-7">

              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                Clinical Information
              </p>

              <h3 className="mt-2 text-xl font-bold text-[#302a52]">
                Embryo Analysis
              </h3>

              <p className="mt-1 text-sm text-[#8b878c]">
                Your embryo analysis results will be displayed here
                when available.
              </p>

            </div>

            <div className="p-6 sm:p-7">

              {loading ? (

                <div className="flex min-h-[180px] items-center justify-center">

                  <Activity
                    size={28}
                    className="animate-spin text-[#70658f]"
                  />

                </div>

              ) : embryos.length > 0 ? (

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                  {embryos.map((embryo) => (

                    <div
                      key={embryo.embryo_id}
                      className="rounded-2xl border border-[#e5e2df] bg-[#fafaf9] p-5"
                    >

                      <div className="flex items-center justify-between">

                        <p className="text-sm font-bold text-[#403b44]">
                          Embryo #{embryo.embryo_id}
                        </p>

                        <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#3d7657]">
                          {embryo.status}
                        </span>

                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <SmallResult
                          label="Grade"
                          value={embryo.embryo_grade ?? "—"}
                        />

                        <SmallResult
                          label="Confidence"
                          value={embryo.confidence ?? "—"}
                        />

                      </div>

                      <div className="mt-3">

                        <SmallResult
                          label="Implantation Chance"
                          value={
                            embryo.implantation_chance ?? "—"
                          }
                        />

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="flex min-h-[180px] items-center justify-center text-center">

                  <div>

                    <Activity
                      size={35}
                      className="mx-auto text-[#aaa6ab]"
                    />

                    <p className="mt-4 text-base font-semibold text-[#555159]">
                      No embryo analysis available
                    </p>

                    <p className="mt-1 text-sm text-[#99949a]">
                      Your doctor will update this section when
                      analysis is completed.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </section>

          {/* =================================================
              EMERGENCY CONTACT
          ================================================= */}

          <section className="mt-7 rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9e6ef] text-[#51486f]">
                <UserRound size={23} />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a959b]">
                  Emergency Information
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                  Emergency Contact
                </h3>

              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <InfoBox
                label="Contact Name"
                value={patient?.emergency_contact_name ?? "—"}
              />

              <InfoBox
                label="Contact Phone"
                value={patient?.emergency_contact_phone ?? "—"}
              />

            </div>

          </section>

          {/* =================================================
              PRIVACY NOTICE
          ================================================= */}

          <section className="mt-7 rounded-3xl bg-[#302a52] p-6 text-white shadow-[0_15px_40px_rgba(48,42,82,0.18)]">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck size={21} />
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Your information is secure
                </p>

                <p className="mt-1 text-xs leading-5 text-white/65">
                  Revival IVF protects your personal and clinical
                  information. Embryo uploading and AI analysis
                  controls are restricted to authorized doctors.
                </p>

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="mt-10 border-t border-[#e5e2df] pt-6">

            <div className="flex flex-col justify-between gap-3 text-xs text-[#9a959b] sm:flex-row">

              <p>
                REVIVAL IVF • AI-Powered Fertility Care
              </p>

              <p>
                Secure Patient Portal
              </p>

            </div>

          </footer>

        </main>

      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
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

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0eef3] text-[#655c80]">
        {icon}
      </div>

      <p className="mt-5 text-sm font-medium text-[#858188]">
        {label}
      </p>

      <p className="mt-1 truncate text-2xl font-bold text-[#302a52]">
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

      <p className="mt-1.5 break-words text-base font-bold text-[#403b44]">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   CARE ITEM
========================================================= */

function CareItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e9e6e4] p-3.5">

      <div className="mt-0.5 text-[#655c80]">
        {icon}
      </div>

      <div>

        <p className="text-sm font-semibold text-[#48434b]">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-[#99949a]">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   SMALL RESULT
========================================================= */

function SmallResult({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#e6e3e1] bg-white p-3">

      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#99949a]">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-bold text-[#302a52]">
        {value}
      </p>

    </div>
  );
}
