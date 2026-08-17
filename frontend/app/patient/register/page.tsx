"use client";

import { FormEvent, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CalendarDays,
  MapPin,
  ArrowLeft,
} from "lucide-react";

export default function PatientRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    blood_group: "",
    phone: "",
    email: "",
    country: "India",
    state: "Karnataka",
    city: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  const API_URL = "api/";

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/patients/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            dob: form.dob,
            gender: form.gender,
            blood_group:
              form.blood_group || null,
            phone: form.phone.trim(),
            email: form.email.trim(),
            country:
              form.country.trim() || null,
            state:
              form.state.trim() || null,
            city:
              form.city.trim() || null,
            address:
              form.address.trim() || null,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to create patient account."
        );
      }

      setSuccess(
        "Patient account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        window.location.href = "/patient/login";
      }, 1500);

    } catch (err) {
      console.error(
        "Patient registration error:",
        err
      );

      if (
        err instanceof TypeError ||
        (err instanceof Error &&
          err.message
            .toLowerCase()
            .includes("fetch"))
      ) {
        setError(
          "Cannot connect to the Revival IVF server. Please make sure the FastAPI backend is running."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-10 text-[#2f2e33]">

      <div className="mx-auto max-w-[900px]">

        {/* HEADER */}
        <div className="mb-7 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-md">

            <img
              src="/images/revival-ivf-logo.jpeg"
              alt="Revival IVF Logo"
              className="max-h-full max-w-full object-contain"
            />

          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#88858a]">
            REVIVAL IVF
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#302a52]">
            Create Patient Account
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#747176]">
            Enter your details to create your secure Revival IVF
            patient account.
          </p>

        </div>

        {/* FORM CARD */}
        <div className="rounded-[28px] border border-[#dfdcd9] bg-white p-6 shadow-[0_20px_70px_rgba(45,42,50,0.08)] sm:p-9">

          <form onSubmit={handleSubmit}>

            {/* PERSONAL DETAILS */}
            <div>

              <h2 className="text-lg font-semibold text-[#302a52]">
                Personal details
              </h2>

              <p className="mt-1 text-sm text-[#858188]">
                Please provide your basic information.
              </p>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* FIRST NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  First name
                </label>

                <div className="relative">

                  <UserRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                  />

                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                    className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm outline-none focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                  />

                </div>
              </div>

              {/* LAST NAME */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Last name
                </label>

                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none focus:border-[#70658f] focus:bg-white focus:ring-4 focus:ring-[#70658f]/10"
                />

              </div>

              {/* DOB */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Date of birth
                </label>

                <div className="relative">

                  <CalendarDays
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                  />

                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                  />

                </div>

              </div>

              {/* GENDER */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
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

              {/* BLOOD GROUP */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Blood group
                </label>

                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
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

              {/* PHONE */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Phone number
                </label>

                <div className="relative">

                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                  />

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    placeholder="Enter phone number"
                    className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                  />

                </div>

              </div>

            </div>

            {/* CONTACT */}
            <div className="mt-10 border-t border-[#eeeae7] pt-8">

              <h2 className="text-lg font-semibold text-[#302a52]">
                Contact information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* EMAIL */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                    />

                  </div>

                </div>

                {/* COUNTRY */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    Country
                  </label>

                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                  />

                </div>

                {/* STATE */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                  />

                </div>

                {/* CITY */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    City
                  </label>

                  <div className="relative">

                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-4 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                    />

                  </div>

                </div>

              </div>

              {/* ADDRESS */}
              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-[#444148]">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your address"
                  className="w-full resize-none rounded-xl border border-[#dcd9d6] bg-[#fafaf9] px-4 py-3 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="mt-10 border-t border-[#eeeae7] pt-8">

              <h2 className="text-lg font-semibold text-[#302a52]">
                Account security
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* PASSWORD */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Create password"
                      className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-12 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#858188] hover:bg-[#efeeec]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

                {/* CONFIRM */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#444148]">
                    Confirm password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#969198]"
                    />

                    <input
                      name="confirm_password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                      placeholder="Confirm password"
                      className="h-12 w-full rounded-xl border border-[#dcd9d6] bg-[#fafaf9] pl-11 pr-12 text-sm outline-none focus:border-[#70658f] focus:ring-4 focus:ring-[#70658f]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#858188] hover:bg-[#efeeec]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                </div>

              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm leading-5 text-red-700">
                  {error}
                </p>

              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mt-7 rounded-xl border border-green-200 bg-green-50 px-4 py-3">

                <p className="text-sm leading-5 text-green-700">
                  {success}
                </p>

              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#302a52] text-sm font-semibold text-white shadow-md transition hover:bg-[#403866] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Create Patient Account
                </>
              )}

            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="mt-7 border-t border-[#eeeae7] pt-6 text-center">

            <p className="text-sm text-[#77747a]">
              Already have an account?
            </p>

            <a
              href="/patient/login"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#302a52] hover:text-[#504575]"
            >
              <ArrowLeft size={16} />
              Back to Patient Login
            </a>

          </div>

        </div>

        <p className="mt-7 text-center text-xs text-[#aaa7ab]">
          REVIVAL IVF • AI-Powered Fertility Care
        </p>

      </div>

    </main>
  );
}