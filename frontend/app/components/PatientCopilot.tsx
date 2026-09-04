"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const API_URL = "/api";

type Message = {
  id: string;
  sender: "copilot" | "patient";
  text: string;
  timestamp: string;
};

type PatientProps = {
  patient?: {
    first_name?: string;
    last_name?: string;
    ongoing_treatments?: string;
    current_medications?: string;
    doctor_notes?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  } | null;
  embryos?: Array<{
    embryo_id: number;
    status: string;
    embryo_grade: string | null;
    confidence: string | null;
    implantation_chance: string | null;
  }>;
};

export default function PatientCopilot({ patient, embryos = [] }: PatientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const patientFirstName = patient?.first_name || "Patient";

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "copilot",
          text: `Hello ${patientFirstName}! I am your Revival IVF Patient Copilot. I'm here to answer your questions about your ongoing treatment, medications, embryo reports, and IVF process. How can I assist your fertility journey today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [patientFirstName, messages.length]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: "My Ongoing Treatment", query: "What is my current ongoing treatment status?" },
    { label: "My Medication Regimen", query: "Can you explain my current medications?" },
    { label: "IVF Process Steps", query: "What are the main stages of an IVF cycle?" },
    { label: "Lifestyle Recommendations", query: "What lifestyle tips are recommended during IVF treatment?" },
    { label: "Emergency Contact", query: "Who is my emergency contact?" },
  ];


  async function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "patient",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("patient_token") || sessionStorage.getItem("patient_token")
          : null;

      let botReply = "";

      if (token) {
        try {
          const response = await fetch(`${API_URL}/patients/copilot`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: query }),
          });

          if (response.ok) {
            const data = await response.json();
            botReply = data.reply;
          }
        } catch {
          // Fallback if backend API is unreachable
        }
      }

      if (!botReply) {
        botReply = generateLocalCopilotReply(query, patient);
      }


      const botMsg: Message = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: `Hello ${patientFirstName}! I'm available to help you understand your IVF treatment options, medications, and embryo evaluation. If you have immediate medical concerns, please reach out to your doctor directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FLOATING COPILOT TRIGGER BUTTON (PATIENT PORTAL ONLY) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-3 rounded-full bg-[#302a52] px-5 py-3.5 text-white shadow-[0_10px_35px_rgba(48,42,82,0.35)] transition-all duration-300 hover:bg-[#403866] hover:scale-105 active:scale-95"
          aria-label="Open IVF Patient Copilot"
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#72c58e] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#52b774]" />
          </span>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
            <Bot size={18} />
          </div>

          <span className="text-sm font-semibold tracking-wide">
            IVF Copilot
          </span>

          <Sparkles size={16} className="text-[#d8cdfc] animate-pulse" />
        </button>
      </div>

      {/* COPILOT CHAT DRAWER */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[620px] w-[92vw] max-w-[430px] flex-col overflow-hidden rounded-3xl border border-[#e2dfdc] bg-white shadow-[0_20px_60px_rgba(30,25,55,0.22)] transition-all duration-300 sm:right-6">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#eeebe8] bg-[#302a52] px-6 py-4.5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Patient IVF Copilot
                  </h3>
                  <span className="rounded-full bg-[#52b774]/20 px-2 py-0.5 text-[10px] font-bold text-[#86e6a7]">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  AI Clinical Assistant • Patient Portal
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* PATIENT CONTEXT HIGHLIGHT BAR */}
          <div className="flex items-center gap-2 border-b border-[#eeecea] bg-[#f8f7fa] px-5 py-2.5 text-xs text-[#5e586c]">
            <ShieldCheck size={15} className="text-[#655c80] shrink-0" />
            <span className="truncate">
              Personalized for <strong>{patientFirstName}</strong> ({patient?.ongoing_treatments ? patient.ongoing_treatments.split('\n')[0] : 'IVF Care'})
            </span>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fcfbfb]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "patient" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "copilot" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#302a52] text-white text-xs font-bold shadow-sm">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs leading-5 sm:text-sm ${
                    msg.sender === "patient"
                      ? "bg-[#302a52] text-white rounded-br-none shadow-sm"
                      : "bg-white text-[#332f38] border border-[#e5e2df] rounded-bl-none shadow-[0_4px_15px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <p
                    className={`mt-1.5 text-[10px] text-right ${
                      msg.sender === "patient" ? "text-white/60" : "text-[#a09b9f]"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#302a52] text-white">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl bg-white border border-[#e5e2df] px-4 py-3 text-xs text-[#77737a]">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#70658f]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#70658f] [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#70658f] [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="border-t border-[#eeeec] bg-[#fafaf9] p-3">
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-[#9e99a0]">
              Suggested Questions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  className="whitespace-nowrap rounded-xl border border-[#dedad7] bg-white px-3 py-1.5 text-xs font-semibold text-[#55505b] hover:border-[#70658f] hover:bg-[#f0eef4] hover:text-[#302a52] transition shadow-2xs"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="border-t border-[#eeecea] bg-white p-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your treatment, embryo, medications..."
                className="flex-1 rounded-xl border border-[#dedbd8] bg-[#fafaf9] px-4 py-2.5 text-xs text-[#2f2c33] outline-none transition focus:border-[#70658f] focus:bg-white focus:ring-2 focus:ring-[#70658f]/10 sm:text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#302a52] text-white transition hover:bg-[#403866] disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function generateLocalCopilotReply(
  queryText: string,
  patient: PatientProps["patient"]
): string {
  const q = queryText.toLowerCase();
  const name = patient?.first_name || "Patient";
  const ongoingTx = patient?.ongoing_treatments || "No active treatment protocol recorded yet.";
  const meds = patient?.current_medications || "No medications specified.";

  if (q.includes("embryo") || q.includes("grade") || q.includes("gardner") || q.includes("quality") || q.includes("blastocyst") || q.includes("analysis")) {
    return `Hello ${name}! For medical security and privacy, detailed embryo evaluation records and laboratory grades are kept strictly confidential and reviewed directly by your attending fertility specialist. Please consult your doctor for detailed embryology insights.`;
  }
  if (q.includes("treatment") || q.includes("ongoing") || q.includes("status")) {
    return `Hello ${name}! Your current ongoing treatment is: "${ongoingTx}". Follow your doctor's exact cycle schedule and call your care team if you experience unusual symptoms.`;
  }
  if (q.includes("medication") || q.includes("medicine") || q.includes("pill") || q.includes("drug")) {
    return `Your listed medications: "${meds}". Always take hormonal medications at the exact times specified by your fertility doctor.`;
  }
  if (q.includes("step") || q.includes("ivf") || q.includes("process")) {
    return `Standard IVF Cycle Overview:\n1. Ovarian Stimulation (10-12 days of hormonal injections)\n2. Trigger Shot & Egg Retrieval\n3. Lab Fertilization & Embryo Culture\n4. AI Embryo Grading & Selection\n5. Embryo Transfer & Pregnancy Test.`;
  }
  if (q.includes("lifestyle") || q.includes("diet") || q.includes("tip")) {
    return `IVF Lifestyle Tips:\n• Drink plenty of water (2-3L daily).\n• Follow a Mediterranean nutrient-rich diet.\n• Avoid heat exposure (saunas, hot baths).\n• Take prescribed prenatal vitamins with folic acid.`;
  }
  if (q.includes("emergency") || q.includes("contact")) {
    return `Emergency Contact: ${patient?.emergency_contact_name || "Revival IVF Care Desk"} (${patient?.emergency_contact_phone || "+15550000001"}).`;
  }

  return `Hello ${name}! I am your Revival IVF Patient Copilot. You can ask me about your ongoing treatment ("${ongoingTx}"), medications ("${meds}"), or general IVF guidelines. How can I help you today?`;
}

