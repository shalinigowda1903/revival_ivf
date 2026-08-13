"use client";

import { FormEvent, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function PatientRegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    blood_group: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    address: "",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/patients/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          dob: form.dob,
          gender: form.gender,
          blood_group: form.blood_group || null,
          phone: form.phone,
          email: form.email,
          country: form.country || null,
          state: form.state || null,
          city: form.city || null,
          address: form.address || null,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to create patient account."
        );
      }

      setMessage(
        `Patient account created successfully. Patient ID: ${data.patient_id}`
      );

      setForm({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
        blood_group: "",
        phone: "",
        email: "",
        country: "",
        state: "",
        city: "",
        address: "",
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Revival IVF server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] px-5 py-10 text-[#333333]">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-2xl">👤</div>

          <p className="text-sm font-medium tracking-wide text-[#777777]">
            REVIVAL IVF
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#333333]">
            Create Patient Account
          </h1>

          <p className="mt-2 text-sm text-[#777777]">
            Enter your details to create your patient account.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="rounded-2xl border border-[#ddddda] bg-white p-6 shadow-sm sm:p-8">

          <form onSubmit={handleSubmit}>

            {/* PERSONAL DETAILS */}
            <section>
              <h2 className="text-lg font-semibold text-[#3d3d3d]">
                Personal Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <InputField
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />

                <InputField
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />

                <InputField
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  placeholder="Select date"
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#555555]">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-lg border border-[#d7d7d3] bg-white px-3 text-sm outline-none focus:border-[#777777]"
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#555555]">
                    Blood Group
                  </label>

                  <select
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-[#d7d7d3] bg-white px-3 text-sm outline-none focus:border-[#777777]"
                  >
                    <option value="">Select blood group</option>
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
            </section>

            {/* CONTACT DETAILS */}
            <section className="mt-9 border-t border-[#eeeeeb] pt-8">

              <h2 className="text-lg font-semibold text-[#3d3d3d]">
                Contact Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />

                <InputField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                />

                <InputField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />

                <InputField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />

              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-[#555555]">
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[#d7d7d3] bg-white px-3 py-3 text-sm outline-none focus:border-[#777777]"
                />
              </div>

            </section>

            {/* ACCOUNT DETAILS */}
            <section className="mt-9 border-t border-[#eeeeeb] pt-8">

              <h2 className="text-lg font-semibold text-[#3d3d3d]">
                Account Security
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                />

                <InputField
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />

              </div>

              <p className="mt-3 text-xs text-[#888888]">
                Password must contain at least 6 characters.
              </p>

            </section>

            {/* SUCCESS */}
            {message && (
              <div className="mt-7 rounded-lg border border-[#cddfd1] bg-[#f4faf5] p-4 text-sm text-[#42604a]">
                ✓ {message}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-7 rounded-lg border border-[#e1cccc] bg-[#faf5f5] p-4 text-sm text-[#754848]">
                ⚠ {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-8 h-12 w-full rounded-lg bg-[#3f3f3f] text-sm font-semibold text-white transition hover:bg-[#2f2f2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Patient Account"}
            </button>

          </form>

          {/* LOGIN */}
          <div className="mt-7 border-t border-[#eeeeeb] pt-6 text-center">

            <p className="text-sm text-[#777777]">
              Already have an account?
            </p>

            <a
              href="/patient/login"
              className="mt-2 inline-block text-sm font-semibold text-[#444444] hover:underline"
            >
              Patient Login →
            </a>

          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-7 text-center text-xs text-[#999999]">
          REVIVAL IVF • Secure Patient Portal
        </p>

      </div>
    </main>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#555555]"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-lg border border-[#d7d7d3] bg-white px-3 text-sm text-[#333333] outline-none placeholder:text-[#aaaaaa] focus:border-[#777777]"
      />
    </div>
  );
}