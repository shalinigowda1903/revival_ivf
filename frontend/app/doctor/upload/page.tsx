"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2, Sparkles, Activity } from "lucide-react";

const API_URL = "/api";

type AnalysisResult = {
  embryo_id: number;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
  clinical_rationale: string | null;
};

export default function DoctorUploadPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f7f5] p-6 text-[#2f2e33]">
          <div className="mx-auto max-w-2xl rounded-3xl border border-[#dfdcd9] bg-white p-8 shadow-sm">
            <p className="text-sm text-[#5a555d]">Loading upload form...</p>
          </div>
        </main>
      }
    >
      <DoctorUploadPageContent />
    </Suspense>
  );
}

function DoctorUploadPageContent() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState<number | string>(
    () => searchParams.get("patient_id") || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("doctor_token") ||
      sessionStorage.getItem("doctor_token");

    if (!token) {
      setTimeout(() => (window.location.href = "/doctor/login"), 2000);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!["image/jpeg", "image/jpg", "image/png"].includes(selectedFile.type)) {
        setError("Only JPG, JPEG, and PNG microscopic embryo images are allowed.");
        setFile(null);
        return;
      }

      // Check image dimensions in browser
      const img = new Image();
      img.onload = () => {
        if (img.width < 80 || img.height < 80) {
          setError(`Image resolution too low (${img.width}x${img.height}). Minimum required resolution is 80x80 for microscopic embryo evaluation.`);
          setFile(null);
        } else {
          setFile(selectedFile);
          setError("");
          setAiAnalysis(null);
        }
      };

      img.onerror = () => {
        setError("Invalid image file.");
        setFile(null);
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAiAnalysis(null);
    setLoading(true);

    try {
      if (!file) {
        setError("Please select a high-quality microscopic embryo image file.");
        setLoading(false);
        return;
      }

      if (!patientId) {
        setError("Please enter a patient ID.");
        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem("doctor_token") ||
        sessionStorage.getItem("doctor_token");

      if (!token) {
        setError("Authentication session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/embryos/upload?patient_id=${patientId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to process embryo image. Please ensure you uploaded a clear high-quality embryo microscopy image."
        );
      }

      setSuccess(
        `Embryo image uploaded and analyzed! Embryo ID #${data.embryo_id}`
      );

      setAiAnalysis({
        embryo_id: data.embryo_id,
        embryo_grade: data.embryo_grade,
        confidence: data.confidence,
        implantation_chance: data.implantation_chance,
        clinical_rationale: data.clinical_rationale,
      });

      setFile(null);
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while uploading the embryo image."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] p-6 text-[#2f2e33]">
      <div className="mx-auto max-w-3xl">
        <a
          href="/doctor/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#665d80] hover:text-[#302a52]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </a>

        <div className="rounded-3xl border border-[#dfdcd9] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#eeecea] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f8a90]">
                REVIVAL IVF CLINICAL LAB
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#302a52]">Embryo Upload & AI Analysis</h1>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-[#eeeaf5] px-3.5 py-2 text-xs font-bold text-[#554b73]">
              <Sparkles size={16} />
              Instant AI Evaluation
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Patient ID Field */}
            <div>
              <label
                htmlFor="patientId"
                className="block text-sm font-semibold text-[#444148]"
              >
                Patient ID
              </label>
              <input
                id="patientId"
                type="number"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                required
                className="mt-2 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 py-3 text-sm text-[#333137] outline-none transition placeholder:text-[#aaa7ab] focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
              />
            </div>

            {/* File Upload Field */}
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-semibold text-[#444148]"
              >
                Microscopic Embryo Scan (High Resolution JPG/PNG)
              </label>
              <div className="mt-2 rounded-2xl border-2 border-dashed border-[#dcd9d6] bg-[#fafaf9] p-8 text-center transition hover:border-[#70658f] hover:bg-[#f0eff4]">
                <Upload size={32} className="mx-auto text-[#969198]" />
                <p className="mt-3 text-sm font-semibold text-[#444148]">
                  Upload Microscopic Embryo Image Only
                </p>
                <p className="mt-1 text-xs text-[#88838a]">
                  High quality microscopy scan (min 150x150 resolution). Non-embryo images will be rejected.
                </p>
                <input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("file")?.click()
                  }
                  className="mt-4 rounded-xl bg-[#302a52] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#403866]"
                >
                  Select Embryo Image
                </button>
              </div>
              {file && (
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  ✓ Validated Microscopic Image: {file.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={20}
                  className="shrink-0 text-red-600"
                />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-green-600"
                />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file || !patientId}
              className="w-full rounded-xl bg-[#302a52] px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#403866] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Processing AI Analysis..." : "Upload & Analyze Embryo"}
            </button>
          </form>

          {/* INSTANT AI ANALYSIS RESULT DISPLAY */}
          {aiAnalysis && (
            <div className="mt-8 rounded-2xl border border-[#cde8d7] bg-[#edf7f1] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#c2e2cc] pb-3">
                <h3 className="text-lg font-bold text-[#2e6244] flex items-center gap-2">
                  <Activity size={20} />
                  Instant AI Embryo Analysis Results
                </h3>
                <span className="rounded-full bg-[#2e6244] px-3 py-1 text-xs font-bold text-white">
                  Embryo #{aiAnalysis.embryo_id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="rounded-xl bg-white p-4 border border-[#c2e2cc]">
                  <p className="text-[#3d7657] font-semibold uppercase">Gardner Blastocyst Grade</p>
                  <p className="mt-1 text-xl font-bold text-[#2e6244]">{aiAnalysis.embryo_grade || "N/A"}</p>
                </div>

                <div className="rounded-xl bg-white p-4 border border-[#c2e2cc]">
                  <p className="text-[#3d7657] font-semibold uppercase">AI Model Confidence</p>
                  <p className="mt-1 text-xl font-bold text-[#2e6244]">{aiAnalysis.confidence || "N/A"}</p>
                </div>

                <div className="rounded-xl bg-white p-4 border border-[#c2e2cc]">
                  <p className="text-[#3d7657] font-semibold uppercase">Implantation Chance</p>
                  <p className="mt-1 text-xl font-bold text-[#2e6244]">{aiAnalysis.implantation_chance || "N/A"}</p>
                </div>
              </div>

              {aiAnalysis.clinical_rationale && (
                <div className="rounded-xl bg-white p-5 border border-[#c2e2cc]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2e6244]">
                    Detailed Clinical Rationale & Implantation Rationale
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs leading-6 text-[#333]">
                    {aiAnalysis.clinical_rationale}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
