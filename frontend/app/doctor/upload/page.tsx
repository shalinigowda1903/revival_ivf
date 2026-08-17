export default function DoctorUploadPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] p-10 text-[#2f2e33]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e5e1df] bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f8a90]">
          REVIVAL IVF
        </p>
        <h1 className="mt-3 text-3xl font-bold">Upload</h1>
        <p className="mt-3 text-[#5a555d]">
          This upload page is ready for embryo or patient upload workflow.
        </p>
        <a
          href="/doctor/dashboard"
          className="mt-6 inline-block rounded-xl bg-[#302a52] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to dashboard
        </a>
      </div>
    </main>
  );
}
