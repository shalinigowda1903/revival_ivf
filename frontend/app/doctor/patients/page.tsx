"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  UserRound,
  X,
  Phone,
  Mail,
  CalendarDays,
  Droplets,
} from "lucide-react";

const API_URL = "/api";

type Patient = {
  id: number;
  patient_id?: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  blood_group: string | null;
};

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  blood_group: string;
};

const emptyForm: FormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  blood_group: "",
};

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("doctor_token") ||
        sessionStorage.getItem("doctor_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        window.location.href = "/doctor/login";
        return;
      }

      /*
       * Try the doctor patient endpoint first.
       */
      const response = await fetch(`${API_URL}/doctors/patients`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        localStorage.removeItem("doctor_token");
        sessionStorage.removeItem("doctor_token");
        window.location.href = "/doctor/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.detail || "Unable to load patients."
        );
      }

      /*
       * Support either:
       * [patient1, patient2]
       *
       * or:
       * { patients: [...] }
       */
      const patientList = Array.isArray(result)
        ? result
        : result?.patients || [];

      setPatients(
        patientList.map(
          (patient: Omit<Patient, "id"> & { patient_id?: number }) => ({
            ...patient,
            id: patient.patient_id ?? 0,
          })
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof FormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function addPatient(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token =
        localStorage.getItem("doctor_token") ||
        sessionStorage.getItem("doctor_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        window.location.href = "/doctor/login";
        return;
      }

      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone: form.phone,
          dob: form.dob || null,
          gender: form.gender || null,
          blood_group: form.blood_group || null,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.detail || "Unable to create patient."
        );
      }

      setSuccess("Patient added successfully.");

      setForm(emptyForm);

      setShowAddPatient(false);

      await loadPatients();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add patient."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.first_name} ${patient.last_name}`.toLowerCase();

    const searchText = search.toLowerCase();

    return (
      fullName.includes(searchText) ||
      patient.email?.toLowerCase().includes(searchText) ||
      patient.phone?.toLowerCase().includes(searchText) ||
      String(patient.id).includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#27252b]">

      {/* HEADER */}

      <header className="border-b border-[#e5e2df] bg-white">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-6 lg:px-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#979298]">
              REVIVAL IVF
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#302a52]">
              Patients
            </h1>

            <p className="mt-2 text-sm text-[#77737a]">
              Manage patient records and clinical information.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setForm(emptyForm);
              setShowAddPatient(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#252040]"
          >
            <Plus size={19} />
            Add Patient
          </button>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-[1500px] px-6 py-8 lg:px-10">

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <section className="rounded-2xl border border-[#e4e1df] bg-white p-5 shadow-sm">

          <div className="relative max-w-xl">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99949a]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search patients by name, email, phone or ID..."
              className="w-full rounded-xl border border-[#e1dedb] bg-[#fafaf9] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#70658f] focus:ring-2 focus:ring-[#70658f]/10"
            />

          </div>

        </section>

        {/* PATIENT COUNT */}

        <div className="mt-7 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-[#302a52]">
              Patient Records
            </h2>

            <p className="mt-1 text-sm text-[#88838a]">
              {filteredPatients.length} patient
              {filteredPatients.length === 1 ? "" : "s"}
            </p>
          </div>

          <button
            onClick={loadPatients}
            className="rounded-xl border border-[#ddd9d6] bg-white px-4 py-2.5 text-sm font-semibold text-[#555159] hover:bg-[#fafafa]"
          >
            Refresh
          </button>

        </div>

        {/* PATIENTS */}

        {loading ? (

          <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-3xl border border-[#e4e1df] bg-white">

            <div className="text-center">

              <Loader2
                size={30}
                className="mx-auto animate-spin text-[#70658f]"
              />

              <p className="mt-4 text-sm text-[#77737a]">
                Loading patients...
              </p>

            </div>

          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="mt-6 rounded-3xl border border-dashed border-[#d8d4d1] bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0eef3] text-[#70658f]">
              <UserRound size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-[#403b44]">
              No patients found
            </h3>

            <p className="mt-2 text-sm text-[#858188]">
              Add your first patient to begin managing their IVF
              records.
            </p>

            <button
              onClick={() => {
                setError("");
                setSuccess("");
                setForm(emptyForm);
                setShowAddPatient(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#302a52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#252040]"
            >
              <Plus size={18} />
              Add Patient
            </button>

          </div>

        ) : (

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredPatients.map((patient) => (

              <div
                key={patient.id}
                className="rounded-3xl border border-[#e4e1df] bg-white p-6 shadow-[0_10px_30px_rgba(45,42,50,0.04)]"
              >

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9e6ef] text-[#51486f]">
                      <UserRound size={22} />
                    </div>

                    <div>

                      <h3 className="font-bold text-[#302a52]">
                        {patient.first_name}{" "}
                        {patient.last_name}
                      </h3>

                      <p className="mt-0.5 text-xs text-[#969197]">
                        Patient #{patient.id}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <PatientDetail
                    icon={<Mail size={16} />}
                    value={patient.email || "Not provided"}
                  />

                  <PatientDetail
                    icon={<Phone size={16} />}
                    value={patient.phone || "Not provided"}
                  />

                  <PatientDetail
                    icon={<CalendarDays size={16} />}
                    value={patient.dob || "Not provided"}
                  />

                  <PatientDetail
                    icon={<Droplets size={16} />}
                    value={patient.blood_group || "Not provided"}
                  />

                </div>

                <button
                  onClick={() =>
                    (window.location.href =
                      `/doctor/patients/${patient.id}`)
                  }
                  className="mt-6 w-full rounded-xl border border-[#ddd9d6] bg-[#fafaf9] px-4 py-3 text-sm font-semibold text-[#4d4851] transition hover:border-[#c9c4c1] hover:bg-white"
                >
                  View Patient
                </button>

              </div>

            ))}

          </div>

        )}

      </main>

      {/* ADD PATIENT MODAL */}

      {showAddPatient && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-[#ebe8e6] px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#979298]">
                  Patient Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#302a52]">
                  Add New Patient
                </h2>

              </div>

              <button
                onClick={() => setShowAddPatient(false)}
                className="rounded-xl p-2 text-[#77737a] hover:bg-[#f5f4f3]"
              >
                <X size={21} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={addPatient}
              className="p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <FormInput
                  label="First Name"
                  required
                  value={form.first_name}
                  onChange={(value) =>
                    updateField("first_name", value)
                  }
                />

                <FormInput
                  label="Last Name"
                  required
                  value={form.last_name}
                  onChange={(value) =>
                    updateField("last_name", value)
                  }
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField("email", value)
                  }
                />

                <FormInput
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                />

                <FormInput
                  label="Date of Birth"
                  type="date"
                  value={form.dob}
                  onChange={(value) =>
                    updateField("dob", value)
                  }
                />

                <div>

                  <label className="text-sm font-semibold text-[#555159]">
                    Gender
                  </label>

                  <select
                    value={form.gender}
                    onChange={(event) =>
                      updateField(
                        "gender",
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#ddd9d6] bg-white px-4 py-3 text-sm outline-none focus:border-[#70658f] focus:ring-2 focus:ring-[#70658f]/10"
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>

                </div>

                <div>

                  <label className="text-sm font-semibold text-[#555159]">
                    Blood Group
                  </label>

                  <select
                    value={form.blood_group}
                    onChange={(event) =>
                      updateField(
                        "blood_group",
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#ddd9d6] bg-white px-4 py-3 text-sm outline-none focus:border-[#70658f] focus:ring-2 focus:ring-[#70658f]/10"
                  >
                    <option value="">
                      Select blood group
                    </option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex justify-end gap-3 border-t border-[#ebe8e6] pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddPatient(false)
                  }
                  className="rounded-xl border border-[#ddd9d6] px-5 py-3 text-sm font-semibold text-[#555159] hover:bg-[#fafafa]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#302a52] px-6 py-3 text-sm font-semibold text-white hover:bg-[#252040] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Patient
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   PATIENT DETAIL
========================================================= */

function PatientDetail({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-[#77737a]">

      <div className="text-[#70658f]">
        {icon}
      </div>

      <span className="truncate">
        {value}
      </span>

    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="text-sm font-semibold text-[#555159]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-[#ddd9d6] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#70658f] focus:ring-2 focus:ring-[#70658f]/10"
      />

    </div>
  );
}
