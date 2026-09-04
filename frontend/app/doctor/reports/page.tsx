"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

const API_URL = "/api";

type Patient = {
  patient_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  ongoing_treatments?: string | null;
  current_medications?: string | null;
  medical_history?: string | null;
  doctor_notes?: string | null;
};

type Embryo = {
  embryo_id: number;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
};

export default function DoctorReportsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [embryos, setEmbryos] = useState<Embryo[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEmbryos, setLoadingEmbryos] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoadingPatients(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token")
          : null;

      if (!token) {
        window.location.href = "/doctor/login";
        return;
      }

      const response = await fetch(`${API_URL}/doctors/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Unable to load patient records.");

      const result = await response.json();
      const list = Array.isArray(result) ? result : result.patients || [];
      setPatients(list);

      if (list.length > 0) {
        const firstId = list[0].patient_id || list[0].id;
        setSelectedPatientId(firstId);
        void loadEmbryosForPatient(firstId, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load reports.");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadEmbryosForPatient(patientId: number, tokenOverride?: string) {
    try {
      setLoadingEmbryos(true);

      const token =
        tokenOverride ||
        (typeof window !== "undefined"
          ? localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token")
          : null);

      if (!token) return;

      const response = await fetch(`${API_URL}/doctors/patients/${patientId}/embryos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setEmbryos([]);
        return;
      }

      const result = await response.json();
      setEmbryos(result.embryos || []);
    } catch {
      setEmbryos([]);
    } finally {
      setLoadingEmbryos(false);
    }
  }

  const filteredPatients = patients.filter((p) => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase();
    const s = search.toLowerCase();
    return name.includes(s) || (p.email && p.email.toLowerCase().includes(s));
  });

  const selectedPatient = patients.find(
    (p) => (p.patient_id || (p as unknown as { id: number }).id) === selectedPatientId
  );

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">
      {/* HEADER */}
      <header className="border-b border-[#e5e2df] bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-4">
            <a
              href="/doctor/dashboard"
              className="flex items-center gap-2 rounded-xl border border-[#e1dedb] bg-[#fafaf9] px-3.5 py-2 text-sm font-semibold text-[#555159] hover:bg-white"
            >
              <ArrowLeft size={18} />
              Dashboard
            </a>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                REVIVAL IVF CLINICAL PORTAL
              </p>
              <h1 className="text-2xl font-bold text-[#302a52]">
                Embryology & Clinical Reports
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => typeof window !== "undefined" && window.print()}
              className="flex items-center gap-2 rounded-xl bg-[#302a52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#403866]"
            >
              <Printer size={18} />
              Print / Save PDF Report
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* PATIENT SELECTOR SIDEBAR */}
          <aside className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)] h-fit">
            <div className="flex items-center justify-between border-b border-[#eeecea] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#99949a]">
                  Select Patient
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                  Clinical Reports
                </h3>
              </div>
              <FileText size={20} className="text-[#70658f]" />
            </div>

            {/* SEARCH */}
            <div className="mt-4 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99949a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient..."
                className="w-full rounded-xl border border-[#ddd9d6] bg-[#fafaf9] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#70658f] focus:bg-white"
              />
            </div>

            <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loadingPatients ? (
                <div className="py-8 text-center text-xs text-[#88838a]">Loading patient records...</div>
              ) : filteredPatients.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#88838a]">No matching patient reports.</p>
              ) : (
                filteredPatients.map((p) => {
                  const pId = p.patient_id || (p as unknown as { id: number }).id;
                  const isSelected = selectedPatientId === pId;

                  return (
                    <button
                      key={pId}
                      onClick={() => {
                        setSelectedPatientId(pId);
                        loadEmbryosForPatient(pId);
                      }}
                      className={`w-full rounded-2xl p-4 text-left transition border ${
                        isSelected
                          ? "bg-[#302a52] text-white border-[#302a52] shadow-md"
                          : "bg-[#fafaf9] text-[#3a363f] border-[#e8e5e2] hover:bg-white hover:border-[#70658f]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm">
                          {p.first_name} {p.last_name}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-white/20 text-white" : "bg-[#e9e6ef] text-[#51486f]"
                          }`}
                        >
                          #{pId}
                        </span>
                      </div>
                      <p className={`mt-1 text-xs truncate ${isSelected ? "text-white/70" : "text-[#88838a]"}`}>
                        {p.email}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* REPORT VIEW */}
          <section className="space-y-6">
            {selectedPatient ? (
              <div className="overflow-hidden rounded-3xl border border-[#e4e1df] bg-white shadow-[0_15px_45px_rgba(45,42,50,0.06)] print:shadow-none print:border-none">
                {/* REPORT HEADER */}
                <div className="border-b border-[#eeecea] bg-[#302a52] px-8 py-8 text-white">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8cdfc]">
                        REVIVAL IVF CLINICAL EMBRYOLOGY REPORT
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                        Embryo Analysis & Implantation Report
                      </h2>
                      <p className="mt-1 text-xs text-white/70">
                        Official Record ID: DOC-RPT-{selectedPatientId}-{Date.now().toString().slice(-4)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 px-5 py-3 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Report Date</p>
                      <p className="text-sm font-semibold text-white">{reportDate}</p>
                    </div>
                  </div>
                </div>

                {/* PATIENT INFO */}
                <div className="grid gap-6 border-b border-[#eeecea] bg-[#fafaf9] p-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Patient Name</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Patient ID</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">#{selectedPatientId}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Email & Contact</p>
                    <p className="mt-1 text-sm font-semibold text-[#302a52] truncate">{selectedPatient.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#99949a]">Total Embryos</p>
                    <p className="mt-1 text-base font-bold text-[#302a52]">{embryos.length} Evaluated</p>
                  </div>
                </div>

                {/* CLINICAL SUMMARY */}
                <div className="p-8 space-y-8">
                  <div className="rounded-2xl border border-[#e5e2df] bg-white p-6">
                    <h3 className="text-lg font-bold text-[#302a52] flex items-center gap-2">
                      <Stethoscope size={20} className="text-[#70658f]" />
                      Clinical Protocol & History
                    </h3>
                    <p className="mt-3 text-sm leading-6 font-semibold text-[#403b44]">
                      Ongoing Protocol: {selectedPatient.ongoing_treatments || "Standard IVF Cycle Protocol"}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#77737a]">
                      Current Medications: {selectedPatient.current_medications || "Hormonal stimulation as prescribed"}
                    </p>
                  </div>

                  {/* EMBRYOS EVALUATION REPORT */}
                  <div>
                    <h3 className="text-lg font-bold text-[#302a52] flex items-center gap-2 mb-4">
                      <Activity size={20} className="text-[#70658f]" />
                      AI Embryo Evaluation & Implantation Suitability
                    </h3>

                    {loadingEmbryos ? (
                      <div className="py-12 text-center text-sm text-[#77737a]">Loading embryo records...</div>
                    ) : embryos.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#dedbd8] bg-[#fafaf9] p-8 text-center text-sm text-[#77737a]">
                        No embryos analyzed for this patient yet.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {embryos.map((e) => (
                          <div
                            key={e.embryo_id}
                            className="rounded-2xl border border-[#e4e1df] bg-[#fafaf9] p-6 space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-[#eeecea] pb-3">
                              <span className="font-bold text-base text-[#302a52]">Embryo #{e.embryo_id}</span>
                              <span className="rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-bold text-[#3d7657]">
                                {e.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="rounded-xl bg-white p-4 border border-[#e8e5e2]">
                                <p className="text-[#99949a] font-semibold uppercase">Gardner Blastocyst Grade</p>
                                <p className="mt-1 text-xl font-bold text-[#302a52]">{e.embryo_grade || "Pending"}</p>
                              </div>

                              <div className="rounded-xl bg-white p-4 border border-[#e8e5e2]">
                                <p className="text-[#99949a] font-semibold uppercase">AI Overall Confidence</p>
                                <p className="mt-1 text-xl font-bold text-[#403b44]">{e.confidence || "Pending"}</p>
                              </div>

                              <div className="rounded-xl bg-[#edf7f1] p-4 border border-[#cde8d7]">
                                <p className="text-[#3d7657] font-semibold uppercase">Implantation Probability</p>
                                <p className="mt-1 text-xl font-bold text-[#2e6244]">{e.implantation_chance || "Under Evaluation"}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DOCTOR NOTES */}
                  <div className="rounded-2xl border border-[#e5e2df] bg-[#fafaf9] p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#99949a]">
                      Doctor Clinical Sign-Off Notes
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#403b44] font-medium">
                      {selectedPatient.doctor_notes || "No clinical sign-off notes recorded yet."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-[#e4e1df] bg-white p-12 text-center text-sm text-[#77737a]">
                Select a patient from the left menu to view their clinical embryology report.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
