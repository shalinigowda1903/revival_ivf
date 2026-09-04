"use client";

import { useEffect } from "react";

export default function ReportsRouter() {
  useEffect(() => {
    const docToken =
      localStorage.getItem("doctor_token") || sessionStorage.getItem("doctor_token");
    const patToken =
      localStorage.getItem("patient_token") || sessionStorage.getItem("patient_token");

    if (docToken) {
      window.location.href = "/doctor/reports";
    } else if (patToken) {
      window.location.href = "/patient/reports";
    } else {
      window.location.href = "/patient/login";
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#ddd9e5] border-t-[#302a52]" />
        <p className="mt-4 text-sm font-semibold text-[#55505c]">Loading Clinical Reports...</p>
      </div>
    </main>
  );
}
