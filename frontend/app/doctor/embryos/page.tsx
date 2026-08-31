"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FileImage, ImageUp, LogOut, ShieldCheck, UploadCloud } from "lucide-react";

const API_URL = "/api";

type EmbryoRecord = {
  embryo_id: number;
  image_path: string;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
};

export default function DoctorEmbryosPage() {
  const [patientId, setPatientId] = useState("1");
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [embryos, setEmbryos] = useState<EmbryoRecord[]>([]);

  useEffect(() => {
    const localToken = localStorage.getItem("doctor_token");
    const sessionToken = sessionStorage.getItem("doctor_token");
    const selectedToken = localToken || sessionToken;

    if (!selectedToken) {
      window.location.href = "/doctor/login";
      return;
    }

    const role = localStorage.getItem("doctor_role") || sessionStorage.getItem("doctor_role");

    if (role !== "doctor") {
      window.location.href = "/doctor/login";
      return;
    }

    const timer = window.setTimeout(() => {
      setToken(selectedToken);
      void loadEmbryos(selectedToken, patientId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function loadEmbryos(currentToken: string, patientValue: string) {
    if (!patientValue.trim()) {
      setEmbryos([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/doctors/patients/${patientValue}/embryos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        setEmbryos([]);
        return;
      }

      const result = await response.json();
      setEmbryos(result.embryos || []);
    } catch {
      setEmbryos([]);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      window.location.href = "/doctor/login";
      return;
    }

    if (!patientId.trim()) {
      setError("Please enter a patient ID.");
      return;
    }

    if (!file) {
      setError("Please choose an embryo image file.");
      return;
    }

    setWorking(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/embryos/upload?patient_id=${encodeURIComponent(patientId)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.detail || "Embryo upload failed.");
      }

      setMessage(result?.message || "Embryo uploaded successfully.");
      setFile(null);
      await loadEmbryos(token, patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setWorking(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  }

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

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#2f2e33]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-[#e5e1df] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f8a90]">
              REVIVAL IVF
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#302a52]">
              Embryo Upload
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => (window.location.href = "/doctor/dashboard")}
              className="rounded-xl border border-[#ddd8d6] bg-[#faf9f8] px-4 py-2 text-sm font-semibold text-[#4a4650] hover:bg-white"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl bg-[#302a52] px-4 py-2 text-sm font-semibold text-white hover:bg-[#403866]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_16px_50px_rgba(48,42,82,0.04)] sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9e6ef] text-[#50476d]">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8f8a90]">
                  Doctor workflow
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#302a52]">
                  Upload embryo image
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="patientId" className="mb-2 block text-sm font-semibold text-[#4d4851]">
                  Patient ID
                </label>
                <input
                  id="patientId"
                  type="number"
                  min="1"
                  value={patientId}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setPatientId(nextValue);
                    if (token) {
                      loadEmbryos(token, nextValue);
                    }
                  }}
                  className="h-12 w-full rounded-xl border border-[#ddd8d6] bg-[#fafaf9] px-4 text-sm text-[#2f2d32] outline-none transition focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="embryoFile" className="mb-2 block text-sm font-semibold text-[#4d4851]">
                  Embryo image
                </label>
                <div className="rounded-2xl border-2 border-dashed border-[#d9d5d2] bg-[#fafaf9] p-5">
                  <input
                    id="embryoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-[#5a565d] file:mr-4 file:rounded-lg file:border-0 file:bg-[#302a52] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#403866]"
                  />
                  {file && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e5e0de] bg-white px-3 py-2 text-sm text-[#4f4a52]">
                      <FileImage size={18} className="text-[#70658f]" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={working}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#403866] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {working ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImageUp size={18} />
                    Upload Embryo
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_16px_50px_rgba(48,42,82,0.04)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf6f2] text-[#3d7657]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8f8a90]">
                  Secure upload
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#302a52]">
                  Uploaded embryos
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {embryos.length === 0 ? (
                <div className="rounded-2xl border border-[#ebe7e5] bg-[#faf9f8] p-4 text-sm text-[#66626b]">
                  No embryo records yet for patient #{patientId || "—"}.
                </div>
              ) : (
                embryos.map((embryo) => (
                  <div key={embryo.embryo_id} className="rounded-2xl border border-[#e8e4e2] bg-[#faf9f8] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#302a52]">
                        Embryo #{embryo.embryo_id}
                      </p>
                      <span className="rounded-full bg-[#edf7f1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3d7657]">
                        {embryo.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-[#656169]">
                      <p>Grade: {embryo.embryo_grade || "—"}</p>
                      <p>Confidence: {embryo.confidence || "—"}</p>
                      <p>Implantation: {embryo.implantation_chance || "—"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
