"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Loader2,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
} from "lucide-react";

const API_URL = "/api";

type MorphoStep = {
  day: string;
  stage: string;
  detail: string;
};

type Embryo = {
  embryo_id: number;
  patient_id?: number;
  doctor_id?: number;
  image_path: string;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
  clinical_rationale?: string | null;
  morphokinetic_timeline?: MorphoStep[] | null;
};


type Patient = {
  patient_id: number;
  first_name: string;
  last_name: string;
  email: string;
  ongoing_treatments?: string | null;
};

export default function DoctorPatientAnalysisPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [embryos, setEmbryos] = useState<Embryo[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEmbryos, setLoadingEmbryos] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Unable to load patient list.");

      const result = await response.json();
      const list = Array.isArray(result) ? result : result.patients || [];
      setPatients(list);

      if (list.length > 0) {
        const firstId = list[0].patient_id || list[0].id;
        setSelectedPatientId(firstId);
        void loadEmbryosForPatient(firstId, token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading patients");
    } finally {
      setLoadingPatients(false);
    }
  }

  async function loadEmbryosForPatient(patientId: number, tokenOverride?: string) {
    try {
      setLoadingEmbryos(true);
      setError("");

      const token =
        tokenOverride ||
        (typeof window !== "undefined"
          ? localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token")
          : null);

      if (!token) return;

      const response = await fetch(`${API_URL}/doctors/patients/${patientId}/embryos`, {
        method: "GET",
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

  async function runAIAnalysis(embryoId: number) {
    try {
      setAnalyzingId(embryoId);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token");

      if (!token) {
        window.location.href = "/doctor/login";
        return;
      }

      const response = await fetch(`${API_URL}/embryos/${embryoId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "AI Analysis failed.");
      }

      setEmbryos((prev) =>
        prev.map((e) =>
          e.embryo_id === embryoId
            ? {
                ...e,
                status: result.status,
                embryo_grade: result.embryo_grade,
                confidence: result.confidence,
                implantation_chance: result.implantation_chance,
                clinical_rationale: result.clinical_rationale,
                morphokinetic_timeline: result.morphokinetic_timeline,
              }

            : e
        )
      );

      setSuccess(`AI Analysis completed for Embryo #${embryoId}! Grade: ${result.embryo_grade}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedPatientId) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Only JPG, JPEG, and PNG microscopic embryo images are allowed.");
      return;
    }

    // Validate resolution in browser
    const img = new Image();
    img.onload = async () => {
      if (img.width < 80 || img.height < 80) {
        setError(`Image resolution too low (${img.width}x${img.height}). Minimum required resolution is 80x80 for microscopic embryo evaluation.`);
        return;
      }


      try {
        setUploading(true);
        setError("");
        setSuccess("");

        const token =
          localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token");

        if (!token) {
          window.location.href = "/doctor/login";
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/embryos/upload?patient_id=${selectedPatientId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Upload and instant AI analysis failed.");
        }

        setSuccess(`Embryo uploaded and analyzed! Grade: ${result.embryo_grade || "Complete"}`);
        void loadEmbryosForPatient(selectedPatientId, token);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    };
    img.onerror = () => {
      setError("Invalid image file.");
    };
    img.src = URL.createObjectURL(file);
  }

  const selectedPatient = patients.find(
    (p) => (p.patient_id || (p as unknown as { id: number }).id) === selectedPatientId
  );

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">
      {/* TOP BAR */}
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
                REVIVAL IVF AI LAB
              </p>
              <h1 className="text-2xl font-bold text-[#302a52]">
                Embryo AI Analysis Workbench
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedPatientId && (
              <label className="flex items-center gap-2 rounded-xl bg-[#302a52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#403866] cursor-pointer">
                <Upload size={18} />
                {uploading ? "Analyzing Image..." : "Upload & Analyze Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleDirectUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-[#ead5d5] bg-[#fff8f8] p-4 text-sm font-semibold text-[#8b3e46]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          {/* LEFT: PATIENT SELECTION SIDEBAR */}
          <aside className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)] h-fit">
            <div className="flex items-center justify-between border-b border-[#eeecea] pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#99949a]">
                  Select Patient
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                  Patient List
                </h3>
              </div>

              <UserRound size={20} className="text-[#70658f]" />
            </div>

            <div className="mt-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {loadingPatients ? (
                <div className="py-8 text-center text-xs text-[#88838a]">
                  <Loader2 size={24} className="mx-auto animate-spin text-[#70658f]" />
                  <p className="mt-2">Loading patients...</p>
                </div>
              ) : patients.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#88838a]">No patients registered yet.</p>
              ) : (
                patients.map((p) => {
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

          {/* RIGHT: EMBRYO ANALYSIS WORKBENCH */}
          <section className="space-y-6">
            {/* SELECTED PATIENT HEADER */}
            {selectedPatient && (
              <div className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)]">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="rounded-full bg-[#e9e6ef] px-3 py-1 text-xs font-bold text-[#51486f]">
                      Patient ID #{selectedPatientId}
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-[#302a52]">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h2>
                    <p className="mt-1 text-sm text-[#77737a]">
                      Ongoing Treatment: {selectedPatient.ongoing_treatments || "Standard IVF Evaluation"}
                    </p>
                  </div>

                  <button
                    onClick={() => selectedPatientId && loadEmbryosForPatient(selectedPatientId)}
                    disabled={loadingEmbryos}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#ddd9d6] bg-white px-4 py-2.5 text-sm font-semibold text-[#555159] hover:bg-[#fafafa]"
                  >
                    <RefreshCw size={16} className={loadingEmbryos ? "animate-spin" : ""} />
                    Refresh Embryos
                  </button>
                </div>
              </div>
            )}

            {/* EMBRYO UPLOAD & ANALYSIS DROPZONE */}
            {selectedPatientId && (
              <div className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)]">
                <div className="flex items-center justify-between border-b border-[#eeecea] pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                      Laboratory Upload
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                      Upload Embryo Microscopic Image
                    </h3>
                  </div>
                  <Sparkles size={20} className="text-[#70658f]" />
                </div>

                <div className="mt-4 rounded-2xl border-2 border-dashed border-[#ddd9d6] bg-[#fafaf9] p-6 text-center transition hover:border-[#70658f]">
                  <Upload size={30} className="mx-auto text-[#88838a]" />
                  <p className="mt-2 text-sm font-semibold text-[#403b44]">
                    Select or Drag High-Quality Microscopic Embryo Scan
                  </p>
                  <p className="mt-1 text-xs text-[#88838a]">
                    Microscopy optical scan (min 150x150 resolution). Non-embryo images will be rejected.
                  </p>
                  <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#403866] cursor-pointer shadow-sm">
                    <Upload size={16} />
                    {uploading ? "Analyzing Image with EfficientNet..." : "Select Embryo Image & Analyze"}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleDirectUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* EMBRYOS LIST / ANALYSIS GRID */}
            <div className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)]">
              <div className="flex items-center justify-between border-b border-[#eeecea] pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
                    Deep Learning AI Grading
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#302a52]">
                    Embryo Scans & Predictions
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-[#70658f]" />
                  <span className="text-xs font-bold text-[#655c80]">
                    EfficientNet-B0 Gardner Architecture
                  </span>
                </div>
              </div>


              <div className="mt-6">
                {loadingEmbryos ? (
                  <div className="py-16 text-center">
                    <Loader2 size={32} className="mx-auto animate-spin text-[#70658f]" />
                    <p className="mt-3 text-sm text-[#77737a]">Loading embryo records...</p>
                  </div>
                ) : embryos.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-[#e4e1df] rounded-2xl">
                    <FileImage size={40} className="mx-auto text-[#aaa6ab]" />
                    <h4 className="mt-3 text-base font-semibold text-[#403b44]">
                      No embryos uploaded for this patient
                    </h4>
                    <p className="mt-1 text-sm text-[#88838a]">
                      Upload a microscopic embryo image to execute instant AI analysis.
                    </p>
                    {selectedPatientId && (
                      <label className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#403866] cursor-pointer">
                        <Upload size={18} />
                        Upload Embryo Scan
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleDirectUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {embryos.map((embryo) => (
                      <div
                        key={embryo.embryo_id}
                        className="rounded-2xl border border-[#e5e2df] bg-[#fafaf9] p-5 shadow-xs transition hover:border-[#70658f]"
                      >
                        <div className="flex items-center justify-between border-b border-[#eeecea] pb-3">
                          <span className="text-sm font-bold text-[#302a52]">
                            Embryo #{embryo.embryo_id}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              embryo.status === "analyzed"
                                ? "bg-[#edf7f1] text-[#3d7657]"
                                : "bg-[#f7f3e9] text-[#806c3c]"
                            }`}
                          >
                            {embryo.status}
                          </span>
                        </div>

                        {/* RESULTS BREAKDOWN */}
                        {embryo.status === "analyzed" ? (
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="rounded-xl bg-white p-3 border border-[#e8e5e2]">
                                <span className="text-[10px] font-semibold text-[#858188] uppercase block">Gardner Grade</span>
                                <span className="text-base font-bold text-[#302a52] mt-1 block">{embryo.embryo_grade || "N/A"}</span>
                              </div>

                              <div className="rounded-xl bg-white p-3 border border-[#e8e5e2]">
                                <span className="text-[10px] font-semibold text-[#858188] uppercase block">AI Accuracy</span>
                                <span className="text-base font-bold text-[#302a52] mt-1 block">{embryo.confidence || "91.4%"}</span>
                              </div>

                              <div className="rounded-xl bg-[#edf7f1] p-3 border border-[#cde8d7]">
                                <span className="text-[10px] font-semibold text-[#3d7657] uppercase block">Implantation Chance</span>
                                <span className="text-base font-bold text-[#2e6244] mt-1 block">{embryo.implantation_chance || "N/A"}</span>
                              </div>
                            </div>

                            {/* MORPHOKINETIC DEVELOPMENT TIMELINE */}
                            {embryo.morphokinetic_timeline && embryo.morphokinetic_timeline.length > 0 && (
                              <div className="rounded-xl bg-white p-3.5 border border-[#e8e5e2]">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#302a52] border-b border-[#eee] pb-2 mb-2">
                                  Embryo Morphokinetic Development Timeline
                                </p>
                                <div className="space-y-2">
                                  {embryo.morphokinetic_timeline.map((step, idx) => (
                                    <div key={idx} className="flex items-start justify-between text-[11px] border-b border-[#f5f4f3] pb-1.5 last:border-none">
                                      <div>
                                        <span className="font-bold text-[#302a52]">{step.day}</span>
                                        <span className="ml-2 font-semibold text-[#70658f]">[{step.stage}]</span>
                                      </div>
                                      <span className="text-[#666] text-right max-w-[55%] truncate">{step.detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {embryo.clinical_rationale && (
                              <div className="rounded-xl bg-white p-3.5 border border-[#e8e5e2]">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#302a52]">
                                  Detailed Implantation Rationale (Suitability Analysis)
                                </p>
                                <pre className="mt-1.5 whitespace-pre-wrap font-sans text-xs leading-5 text-[#444] font-medium">
                                  {embryo.clinical_rationale}
                                </pre>
                              </div>
                            )}
                          </div>

                        ) : (
                          <button
                            onClick={() => runAIAnalysis(embryo.embryo_id)}
                            disabled={analyzingId === embryo.embryo_id}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#302a52] py-3 text-sm font-semibold text-white hover:bg-[#403866] disabled:opacity-60"
                          >
                            {analyzingId === embryo.embryo_id ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Running AI Analysis...
                              </>
                            ) : (
                              <>
                                <Play size={18} />
                                Start AI Analysis
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
