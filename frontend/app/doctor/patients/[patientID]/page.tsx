"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  blood_group: string | null;
  phone: string;
  email: string;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const patientID = params?.patientID;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientID) {
      return;
    }

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          router.push("/doctor/login");
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8001/doctors/patients/${patientID}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load patient information"
          );
        }

        setPatient(data);
      } catch (err) {
        console.error("Patient fetch error:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load patient information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientID, router]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />

          <p className="text-slate-600">
            Loading patient information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>

          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Patient Not Found
          </h1>

          <p className="text-slate-500 mb-6">
            {error || "Unable to find this patient."}
          </p>

          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PATIENT DETAILS
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition mb-5"
          >
            <ArrowLeft className="w-5 h-5" />

            <span className="font-medium">
              Back to Patients
            </span>
          </button>

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
              <UserRound className="w-8 h-8 text-purple-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {patient.first_name} {patient.last_name}
              </h1>

              <p className="text-slate-500 mt-1">
                Patient ID: #{patient.patient_id}
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Patient Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Basic patient details
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* PATIENT ID */}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <UserRound className="w-5 h-5 text-purple-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Patient ID
                </p>

                <p className="font-semibold text-slate-800">
                  #{patient.patient_id}
                </p>
              </div>
            </div>

            {/* DATE OF BIRTH */}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Date of Birth
                </p>

                <p className="font-semibold text-slate-800">
                  {patient.dob
                    ? new Date(patient.dob).toLocaleDateString()
                    : "Not provided"}
                </p>
              </div>
            </div>

            {/* GENDER */}

            <div>
              <p className="text-sm text-slate-500">
                Gender
              </p>

              <p className="font-semibold text-slate-800 mt-1">
                {patient.gender || "Not provided"}
              </p>
            </div>

            {/* BLOOD GROUP */}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Blood Group
                </p>

                <p className="font-semibold text-slate-800">
                  {patient.blood_group || "Not provided"}
                </p>
              </div>
            </div>

            {/* PHONE */}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Phone
                </p>

                <p className="font-semibold text-slate-800">
                  {patient.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* EMAIL */}

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-500">
                  Email
                </p>

                <p className="font-semibold text-slate-800 break-all">
                  {patient.email || "Not provided"}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================
            ADDRESS
        ================================================= */}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">

          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Address
            </h2>
          </div>

          <div className="p-6 flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Address
              </p>

              <p className="font-medium text-slate-800 mt-1">
                {patient.address || "Not provided"}
              </p>

              <p className="text-slate-600 mt-1">
                {patient.city || ""}
                {patient.state ? `, ${patient.state}` : ""}
                {patient.country ? `, ${patient.country}` : ""}
              </p>
            </div>

          </div>
        </section>

        {/* =================================================
            EMBRYO SECTION
        ================================================= */}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 mt-6">

          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Embryo Analysis
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View embryo images and AI analysis for this patient.
            </p>
          </div>

          <div className="p-6">

            <button
              onClick={() =>
                router.push(
                  `/doctor/patients/${patient.patient_id}/embryos`
                )
              }
              className="px-5 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
            >
              View Embryos
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}