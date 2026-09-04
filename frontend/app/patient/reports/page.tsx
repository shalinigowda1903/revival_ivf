"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HeartPulse,
  LogOut,
  Menu,
  Printer,
  ShieldCheck,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

const API_URL = "/api";

type Patient = {
  patient_id?: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  medical_history?: string;
  ongoing_treatments?: string;
  current_medications?: string;
  doctor_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
};

type Embryo = {
  embryo_id: number;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
};

export default function PatientReportsPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [embryos, setEmbryos] = useState<Embryo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadPatientReportData();
  }, []);

  async function loadPatientReportData() {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("patient_token") || sessionStorage.getItem("patient_token")
          : null;

      if (!token) {
        window.location.href = "/patient/login";
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Session expired. Please sign in again.");

      const patientData: Patient = await response.json();
      setPatient(patientData);

      // Load medical summary
      try {
        const medicalRes = await fetch(`${API_URL}/patients/me/medical-summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (medicalRes.ok) {
          const medData = await medicalRes.json();
          setPatient((prev) => ({ ...prev, ...medData }));
        }
      } catch {
        // Continue if summary endpoint fails
      }

      // Load patient embryos
      const pId = patientData.patient_id || patientData.user_id;
      if (pId) {
        try {
          const embryoRes = await fetch(`${API_URL}/patients/${pId}/embryos`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (embryoRes.ok) {
            const embryoData = await embryoRes.json();
            if (Array.isArray(embryoData)) {
              setEmbryos(embryoData);
            } else if (embryoData?.embryos) {
              setEmbryos(embryoData.embryos);
            }
          }
        } catch {
          setEmbryos([]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/patient/login";
  }

  const patientName = patient?.first_name ? `${patient.first_name} ${patient.last_name || ""}` : "Patient";
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[280px] border-r border-[#e6e3e1] bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[88px] items-center justify-between border-b border-[#eeecea] px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#302a52] text-white">
                <HeartPulse size={23} />
              </div>
              <div>
                <p className="text-[15px] font-bold tracking-[0.08em] text-[#302a52]">
                  REVIVAL IVF
                </p>
                <p className="mt-0.5 text-xs text-[#99959a]">Patient Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-[#77737a] hover:bg-[#f5f4f3] lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-7">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#aaa6ab]">
              My Care
            </p>
            <nav className="mt-4 space-y-2">
              <a
                href="/patient/dashboard"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#656168] hover:bg-[#f5f4f3] hover:text-[#302a52]"
              >
                <Activity size={20} />
                Dashboard
              </a>
              <a
                href="/patient/reports"
                className="flex items-center gap-3 rounded-xl bg-[#302a52] px-4 py-3.5 text-[15px] font-medium text-white shadow-sm"
              >
                <FileText size={20} />
                My Reports
              </a>
            </nav>
          </div>

          <div className="mt-auto p-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-[#77737a] hover:bg-[#f5f4f3] hover:text-[#302a52]"
            >
              <LogOut size={19} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-[280px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#e6e3e1] bg-white/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2.5 text-[#555159] hover:bg-[#f4f3f2] lg:hidden"
          >
            <Menu size={23} />
          </button>

          <div>
            <p className="text-sm text-[#969197]">Patient Portal</p>
            <h1 className="mt-1 text-xl font-bold text-[#302a52]">Clinical IVF Reports</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => typeof window !== "undefined" && window.print()}
              className="flex items-center gap-2 rounded-xl bg-[#302a52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#403866]"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
          {loading ? (
            <div className="py-20 text-center">
              <Activity size={32} className="mx-auto animate-spin text-[#70658f]" />
              <p className="mt-3 text-sm text-[#77737a]">Loading official clinical report...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* OFFICIAL MEDICAL REPORT CARD */}
              <div className="overflow-hidden rounded-3xl border border-[#e4e1df] bg-white shadow-[0_15px_45px_rgba(45,42,50,0.06)] print:shadow-none print:border-none">
                {/* REPORT HEADER */}
                <div className="border-b border-[#eeecea] bg-[#302a52] px-8 py-8 text-white">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8cdfc]">
                        REVIVAL IVF CLINICAL LABORATORY
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                        Official Embryology Report
                      </h2>
                      <p className="mt-1 text-xs text-white/70">
                        Document ID: REV-RPT-{patient?.patient_id || "101"}-{Date.now().toString().slice(-4)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 px-5 py-3 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Date Issued</p>
                      <p className="text-sm font-semibold text-white">{reportDate}</p>
                    </div>
                  </div>
                </div>

                {/* PATIENT IDENTIFICATION SECTION */}
                <div className="grid gap-6 border-b border-[#eeecea] bg-[#fafaf9] p-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Patient Name</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">{patientName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Patient ID</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">#{patient?.patient_id || patient?.user_id || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Age & Gender</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">
                      {patient?.age ? `${patient.age} Yrs` : "—"} ({patient?.gender || "Female"})
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Attending Specialist</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">Dr. Revival (IVF Specialist)</p>
                  </div>
                </div>

                {/* CLINICAL DIAGNOSIS & PROTOCOL */}
                <div className="p-8 space-y-8">
                  <div className="rounded-2xl border border-[#e5e2df] bg-white p-6">
                    <h3 className="text-lg font-bold text-[#302a52] flex items-center gap-2">
                      <Stethoscope size={20} className="text-[#70658f]" />
                      Ongoing Treatment Protocol
                    </h3>
                    <p className="mt-3 text-sm leading-6 font-semibold text-[#403b44]">
                      {patient?.ongoing_treatments || "Standard IVF Cycle Protocol"}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#77737a]">
                      Active Medication Schedule: {patient?.current_medications || "Prescribed hormonal support"}
                    </p>
                  </div>

                  {/* CONFIDENTIAL EMBRYO PRIVACY NOTICE */}
                  <div className="rounded-2xl border border-[#e5e2df] bg-[#fafaf9] p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#99949a] flex items-center gap-2">
                      <ShieldCheck size={18} className="text-[#70658f]" />
                      Confidential Laboratory Embryology Records
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#666269] font-medium">
                      Laboratory embryo evaluation records and AI blastocyst grades are kept strictly confidential for medical security and privacy. Detailed embryology findings are reviewed directly with your attending fertility specialist during clinical consultation.
                    </p>
                  </div>


                  {/* DOCTOR CLINICAL NOTES */}
                  <div className="rounded-2xl border border-[#e5e2df] bg-[#fafaf9] p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#99949a]">
                      Doctor Clinical Recommendations
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#403b44] font-medium">
                      {patient?.doctor_notes || "Patient is advised to maintain prescribed hormonal support regimen and follow cycle guidelines."}
                    </p>
                  </div>
                </div>

                {/* REPORT FOOTER */}
                <div className="border-t border-[#eeecea] bg-[#fafaf9] px-8 py-5 text-xs text-[#99949a] flex flex-col sm:flex-row justify-between gap-2">
                  <p>REVIVAL IVF • Verified Medical Documentation</p>
                  <p>Protected Patient Health Information (PHI)</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
