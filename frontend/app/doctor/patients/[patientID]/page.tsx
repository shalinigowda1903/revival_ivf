"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Loader2,
  Play,
  Upload,
  UserRound,
} from "lucide-react";

interface Embryo {
  embryo_id: number;
  image_path: string;
  status: string;
  embryo_grade: string | null;
  confidence: string | null;
  implantation_chance: string | null;
}

interface PatientData {
  patient: {
    patient_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    blood_group: string | null;
    medical_history: string | null;
    ongoing_treatments: string | null;
    current_medications: string | null;
  };
  embryo_count: number;
  embryos: Embryo[];
}

export default function PatientEmbryosPage() {
  const params = useParams();
  const router = useRouter();

  const patientID = params?.patientID;

  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [savingMedical, setSavingMedical] = useState(false);
  const [medicalMessage, setMedicalMessage] = useState("");
  const [medicalError, setMedicalError] = useState("");

  useEffect(() => {
    if (!patientID) return;

    const fetchEmbryos = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("doctor_token") ||
          sessionStorage.getItem("doctor_token");

        if (!token) {
          router.push("/doctor/login");
          return;
        }

        const response = await fetch(
          `/api/doctors/patients/${patientID}/embryos`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail || "Unable to load embryos"
          );
        }

        setData(result);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load embryos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmbryos();
  }, [patientID, router]);

  const analyzeEmbryo = async (embryoID: number) => {
    try {
      const token =
        localStorage.getItem("doctor_token") ||
        sessionStorage.getItem("doctor_token");

      if (!token) {
        router.push("/doctor/login");
        return;
      }

      setAnalyzing(embryoID);

      const response = await fetch(
        `/api/embryos/${embryoID}/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Analysis failed"
        );
      }

      setData((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          embryos: previous.embryos.map((embryo) =>
            embryo.embryo_id === embryoID
              ? {
                  ...embryo,
                  status: result.status,
                  embryo_grade: result.embryo_grade,
                  confidence: result.confidence,
                  implantation_chance:
                    result.implantation_chance,
                }
              : embryo
          ),
        };
      });
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Analysis failed");
      }
    } finally {
      setAnalyzing(null);
    }
  };

  const goToUpload = () => {
    if (!data) return;

    router.push(
      `/doctor/upload?patient_id=${data.patient.patient_id}`
    );
  };

  const saveMedicalInformation = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token =
      localStorage.getItem("doctor_token") ||
      sessionStorage.getItem("doctor_token");

    if (!token || !data) {
      router.push("/doctor/login");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const medicalHistory = String(formData.get("medical_history") || "");
    const ongoingTreatments = String(
      formData.get("ongoing_treatments") || ""
    );
    const currentMedications = String(
      formData.get("current_medications") || ""
    );

    setSavingMedical(true);
    setMedicalError("");
    setMedicalMessage("");

    try {
      const response = await fetch(
        `/api/doctors/patients/${data.patient.patient_id}/medical`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medical_history: medicalHistory || null,
            ongoing_treatments: ongoingTreatments || null,
            current_medications: currentMedications || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to save medical information."
        );
      }

      setData((previous) =>
        previous
          ? {
              ...previous,
              patient: {
                ...previous.patient,
                medical_history: result.patient.medical_history,
                ongoing_treatments: result.patient.ongoing_treatments,
                current_medications: result.patient.current_medications,
              },
            }
          : previous
      );
      setMedicalMessage("Medical information saved successfully.");
    } catch (err) {
      setMedicalError(
        err instanceof Error
          ? err.message
          : "Unable to save medical information."
      );
    } finally {
      setSavingMedical(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#70658f] animate-spin" />

          <p className="text-slate-600">
            Loading embryo information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-3">
            Unable to Load Embryos
          </h1>

          <p className="text-slate-500 mb-6">
            {error || "No patient information found."}
          </p>

          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl bg-[#302a52] text-white hover:bg-[#403866]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">

      {/* HEADER */}

      <header className="border-b border-[#e6e3e1] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => router.back()}
            className="mb-5 flex items-center gap-2 text-[#77737a] hover:text-[#302a52]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Patient
          </button>

          <div className="flex items-center justify-between gap-6">

            {/* PATIENT */}

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9e6ef]">
                <UserRound className="h-7 w-7 text-[#51486f]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#302a52]">
                  {data.patient.first_name}{" "}
                  {data.patient.last_name}
                </h1>

                <p className="text-[#969197]">
                  Patient ID: #{data.patient.patient_id}
                </p>
              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="flex items-center gap-5">

              <div className="text-right">
                <p className="text-sm text-[#969197]">
                  Embryos
                </p>

                <p className="text-2xl font-bold text-[#302a52]">
                  {data.embryo_count}
                </p>
              </div>

              {/* UPLOAD BUTTON */}

              <button
                onClick={goToUpload}
                className="flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 font-medium text-white transition hover:bg-[#403866]"
              >
                <Upload className="w-5 h-5" />
                Upload Embryo
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PATIENT SUMMARY */}

        <section className="mb-6 rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">

          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Patient Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {data.patient.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Phone
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {data.patient.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Gender
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {data.patient.gender}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Blood Group
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {data.patient.blood_group || "Not provided"}
              </p>
            </div>

          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_12px_40px_rgba(45,42,50,0.05)]">
          <div className="mb-6 border-b border-[#eeecea] pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
              Patient Care
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#302a52]">
              Medical Information
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#77737a]">
              Update the information your patient can view in their portal.
            </p>
          </div>

          <form onSubmit={saveMedicalInformation} className="space-y-5">
            <MedicalField
              label="Medical History"
              name="medical_history"
              defaultValue={data.patient.medical_history || ""}
            />
            <MedicalField
              label="Ongoing Treatment"
              name="ongoing_treatments"
              defaultValue={data.patient.ongoing_treatments || ""}
            />
            <MedicalField
              label="Current Medications"
              name="current_medications"
              defaultValue={data.patient.current_medications || ""}
            />

            {medicalError && (
              <p className="text-sm font-medium text-[#a45d64]">
                {medicalError}
              </p>
            )}
            {medicalMessage && (
              <p className="text-sm font-medium text-[#3d7657]">
                {medicalMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={savingMedical}
              className="rounded-xl bg-[#302a52] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#403866] disabled:opacity-60"
            >
              {savingMedical ? "Saving..." : "Save Medical Information"}
            </button>
          </form>
        </section>

        {/* EMBRYO SECTION */}

        <section>

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Embryo Analysis
              </h2>

              <p className="text-slate-500 mt-1">
                Upload and analyze embryos for this patient.
              </p>
            </div>

            {/* SECOND UPLOAD BUTTON */}

            <button
              onClick={goToUpload}
              className="flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 font-medium text-white transition hover:bg-[#403866]"
            >
              <Upload className="w-5 h-5" />
              Upload New Embryo
            </button>

          </div>

          {/* NO EMBRYOS */}

          {data.embryos.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-[#d8d4d1] bg-white p-12 text-center">

              <FileImage className="w-14 h-14 text-slate-400 mx-auto mb-4" />

              <h3 className="text-lg font-semibold text-slate-700">
                No embryos uploaded
              </h3>

              <p className="text-slate-500 mt-2">
                Upload an embryo image for this patient.
              </p>

              <button
                onClick={goToUpload}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 text-white hover:bg-[#403866]"
              >
                <Upload className="w-5 h-5" />
                Upload Embryo
              </button>

            </div>

          ) : (

            /* EMBRYO CARDS */

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {data.embryos.map((embryo) => (

                <div
                  key={embryo.embryo_id}
                  className="overflow-hidden rounded-3xl border border-[#e4e1df] bg-white shadow-[0_10px_30px_rgba(45,42,50,0.04)]"
                >

                  {/* IMAGE AREA */}

                  <div className="flex h-56 items-center justify-center bg-[#fafaf9]">

                    <div className="text-center">

                      <FileImage className="w-14 h-14 text-slate-400 mx-auto mb-2" />

                      <p className="text-sm text-slate-500">
                        Embryo #{embryo.embryo_id}
                      </p>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="p-5">

                    <div className="flex items-center justify-between mb-4">

                      <h3 className="font-semibold text-slate-800">
                        Embryo #{embryo.embryo_id}
                      </h3>

                      {embryo.status === "analyzed" ? (

                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">

                          <CheckCircle2 className="w-3.5 h-3.5" />

                          Analyzed

                        </span>

                      ) : (

                        <span className="text-xs font-medium text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                          Uploaded
                        </span>

                      )}

                    </div>

                    {/* RESULTS */}

                    {embryo.status === "analyzed" ? (

                      <div className="space-y-3">

                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Embryo Grade
                          </span>

                          <span className="font-bold text-[#302a52]">
                            {embryo.embryo_grade || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Confidence
                          </span>

                          <span className="font-semibold text-slate-800">
                            {embryo.confidence || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-slate-500">
                            Implantation Chance
                          </span>

                          <span className="font-semibold text-green-600">
                            {embryo.implantation_chance || "N/A"}
                          </span>
                        </div>

                      </div>

                    ) : (

                      <button
                        onClick={() =>
                          analyzeEmbryo(embryo.embryo_id)
                        }
                        disabled={
                          analyzing === embryo.embryo_id
                        }
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#302a52] px-4 py-3 font-medium text-white hover:bg-[#403866] disabled:opacity-60"
                      >

                        {analyzing === embryo.embryo_id ? (

                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                          </>

                        ) : (

                          <>
                            <Play className="w-5 h-5" />
                            Start AI Analysis
                          </>

                        )}

                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

function MedicalField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#555159]">
        {label}
      </label>
      <textarea
        key={`${name}-${defaultValue}`}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="mt-2 w-full rounded-xl border border-[#ddd9d6] bg-[#fafaf9] px-4 py-3 text-sm leading-6 text-[#403b44] outline-none transition focus:border-[#70658f] focus:bg-white focus:ring-2 focus:ring-[#70658f]/10"
      />
    </div>
  );
}
