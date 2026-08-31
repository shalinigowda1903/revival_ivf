"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = "/api";

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
        setError("Only JPG, JPEG, and PNG images are allowed.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!file) {
        setError("Please select an image file.");
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
        setError("Authentication token not found. Please log in again.");
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
          data?.detail || "Failed to upload embryo image."
        );
      }

      setSuccess(
        `Embryo image uploaded successfully! Embryo ID: ${data.embryo_id}`
      );
      setFile(null);
      setPatientId("");
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/doctor/dashboard";
      }, 2000);
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
    <main className="min-h-screen bg-[#f7f7f5] p-6 text-[#2f2e33]">
      <div className="mx-auto max-w-2xl">
        <a
          href="/doctor/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#665d80] hover:text-[#302a52]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </a>

        <div className="rounded-3xl border border-[#dfdcd9] bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f8a90]">
            REVIVAL IVF
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#302a52]">Upload Embryo</h1>
          <p className="mt-2 text-sm text-[#5a555d]">
            Upload a high-quality image of the embryo for AI-powered analysis.
          </p>

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
                Embryo Image (JPG, JPEG, or PNG)
              </label>
              <div className="mt-2 rounded-xl border-2 border-dashed border-[#dcd9d6] bg-[#fafaf9] p-8 text-center transition hover:border-[#70658f] hover:bg-[#f0eff4]">
                <Upload size={32} className="mx-auto text-[#969198]" />
                <p className="mt-3 text-sm font-medium text-[#444148]">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-[#aaa7ab]">
                  PNG, JPG, or JPEG (max 10MB)
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
                  className="mt-4 rounded-xl bg-[#302a52] px-4 py-2 text-sm font-semibold text-white hover:bg-[#403866]"
                >
                  Select File
                </button>
              </div>
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ File selected: {file.name}
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
              className="w-full rounded-xl bg-[#302a52] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#403866] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Embryo Image"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-[#e8e5e2] bg-[#fafaf9] p-4">
            <p className="text-xs leading-5 text-[#77747a]">
              <strong>Note:</strong> Only high-quality, clear images of embryos
              are recommended for accurate AI analysis. The uploaded image will be
              processed and stored securely.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
