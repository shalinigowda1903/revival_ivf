"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Baby,
  BarChart3,
  Brain,
  Dna,
  Egg,
  FlaskConical,
  Heart,
  ImageIcon,
  LockKeyhole,
  Mail,
  MapPin,
  Microscope,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
  Users,
} from "lucide-react";

export default function Home() {
  const [openTreatment, setOpenTreatment] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const treatments = [
    {
      icon: <Baby size={23} />,
      title: "In Vitro Fertilization (IVF)",
      text: "Eggs are collected and fertilized with sperm in a laboratory before an embryo may be transferred.",
      details:
        "IVF is an assisted reproductive treatment where eggs are collected, fertilized in a laboratory and monitored as embryos develop. A suitable embryo may later be transferred to the uterus.",
    },
    {
      icon: <Microscope size={23} />,
      title: "ICSI",
      text: "A specialized fertilization technique that may be used as part of an IVF cycle.",
      details:
        "ICSI involves injecting a single sperm directly into an egg. It may be considered in certain fertility situations, particularly when sperm-related factors are present.",
    },
    {
      icon: <Heart size={23} />,
      title: "IUI",
      text: "Prepared sperm is placed directly into the uterus around the time of ovulation.",
      details:
        "IUI stands for intrauterine insemination. A prepared sperm sample is placed inside the uterus around ovulation to assist the fertilization process.",
    },
    {
      icon: <Egg size={23} />,
      title: "Egg Freezing",
      text: "Eggs may be collected and preserved for possible future fertility treatment.",
      details:
        "Egg freezing involves collecting eggs and preserving them at very low temperatures. They may potentially be used during a future fertility treatment.",
    },
    {
      icon: <FlaskConical size={23} />,
      title: "Embryo Freezing",
      text: "Suitable embryos can be preserved for possible use in a future treatment cycle.",
      details:
        "Embryo freezing involves cryopreservation of suitable embryos. Frozen embryos may potentially be used in a future treatment cycle according to the clinical plan.",
    },
    {
      icon: <ShieldCheck size={23} />,
      title: "Fertility Preservation",
      text: "Preservation options may help protect future reproductive potential.",
      details:
        "Fertility preservation may involve preserving eggs, sperm or embryos depending on individual circumstances and medical recommendations.",
    },
  ];

  const faqs = [
    {
      question: "What is IVF?",
      answer:
        "In vitro fertilization is an assisted reproductive treatment in which eggs are collected and fertilized with sperm in a laboratory. Embryos that develop may then be considered for transfer.",
    },
    {
      question: "Who may need fertility treatment?",
      answer:
        "Fertility treatment may be considered when a person or couple has difficulty conceiving or has specific reproductive or medical factors. A fertility specialist can recommend appropriate evaluation.",
    },
    {
      question: "What is the difference between IVF and ICSI?",
      answer:
        "Both can be part of an IVF treatment cycle. In conventional IVF, eggs and sperm are placed together in the laboratory. In ICSI, a single sperm is injected directly into an egg.",
    },
    {
      question: "How long does an IVF cycle take?",
      answer:
        "The duration varies depending on the treatment protocol and individual circumstances. A fertility clinic can provide the specific timeline for a patient's treatment.",
    },
    {
      question: "Does IVF guarantee pregnancy?",
      answer:
        "No. IVF cannot guarantee pregnancy. Outcomes depend on many factors including age, reproductive health, embryo characteristics and other clinical factors.",
    },
    {
      question: "What is embryo grading?",
      answer:
        "Embryo grading describes certain observable characteristics of an embryo. It is one piece of information that may be considered during clinical decision-making.",
    },
    {
      question: "How does REVIVAL AI analyse embryos?",
      answer:
        "REVIVAL AI is designed to analyse embryo images using machine-learning techniques and provide structured AI-assisted information such as assessment and model confidence.",
    },
    {
      question: "Can patients upload embryo images?",
      answer:
        "No. In the REVIVAL IVF platform, embryo image upload is restricted to authorised doctor accounts. Patients do not receive permission to upload embryo images.",
    },
    {
      question: "Who makes the final embryo-related decision?",
      answer:
        "The final clinical decision remains with the qualified fertility specialist and clinical team. AI-generated information is intended to support professional judgement.",
    },
    {
      question: "What happens after embryo transfer?",
      answer:
        "After embryo transfer, appropriate clinical follow-up and pregnancy testing are performed according to the fertility clinic's treatment protocol.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fafaf9] text-[#29282d]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#e7e5e2] bg-[#fafaf9]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[88px] max-w-[1500px] items-center justify-between px-6 lg:px-12">

          <a href="#home" className="flex items-center gap-3">

            <img
              src="/images/revival-ivf-logo.jpeg"
              alt="REVIVAL IVF"
              className="h-14 w-14 rounded-full object-cover"
            />

            <div>
              <div className="text-[21px] font-semibold tracking-wide text-[#302a52]">
                REVIVAL <span className="text-[#bd5c83]">IVF</span>
              </div>

              <div className="text-[10px] uppercase tracking-[0.18em] text-[#858288]">
                AI-Powered Fertility Care
              </div>
            </div>

          </a>

          <nav className="hidden items-center gap-5 lg:flex">
            <a href="#home" className="nav-link">Home</a>
            <a href="#technology" className="nav-link">AI Technology</a>
            <a href="#statistics" className="nav-link">Statistics</a>
            <a href="#treatments" className="nav-link">Treatments</a>
            <a href="#symptoms" className="nav-link">Symptoms</a>
            <a href="#infertility" className="nav-link">Infertility</a>
            <a href="#journey" className="nav-link">IVF Journey</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">

            <a
              href="/patient/login"
              className="flex items-center gap-2 rounded-lg border border-[#d9d6d3] bg-white px-5 py-3 text-sm font-semibold text-[#444249] hover:bg-[#f3f2f0]"
            >
              <UserRound size={16} />
              Patient Login
            </a>

            <a
              href="/doctor/login"
              className="flex items-center gap-2 rounded-lg bg-[#302a52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#403866]"
            >
              <Stethoscope size={16} />
              Doctor Login
            </a>

          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section id="home" className="overflow-hidden pt-[88px]">

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div>

              <div className="mb-7 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeaf2]">
                  <Sparkles size={17} className="text-[#554b78]" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#77747a]">
                  AI-Powered Embryo Assessment
                </span>

              </div>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-[#302a52] sm:text-6xl lg:text-7xl">
                Advancing IVF with
                <span className="block text-[#bd5c83]">
                  intelligent technology.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#67666b]">
                REVIVAL IVF brings artificial intelligence, embryo imaging
                and fertility expertise together to support structured embryo
                assessment and informed clinical decision-making.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <a
                  href="#technology"
                  className="flex h-14 items-center justify-center gap-3 rounded-lg bg-[#302a52] px-7 text-sm font-semibold text-white hover:bg-[#403866]"
                >
                  Explore AI Technology
                  <ArrowRight size={18} />
                </a>

                <a
                  href="#journey"
                  className="flex h-14 items-center justify-center gap-3 rounded-lg border border-[#d7d4d1] bg-white px-7 text-sm font-semibold text-[#46434a] hover:bg-[#f5f4f2]"
                >
                  <Heart size={17} />
                  Explore IVF Journey
                </a>

              </div>

              <div className="mt-9 flex flex-wrap gap-7 text-sm text-[#77747a]">

                <span className="flex items-center gap-2">
                  <Brain size={16} />
                  AI-assisted analysis
                </span>

                <span className="flex items-center gap-2">
                  <Stethoscope size={16} />
                  Doctor-controlled
                </span>

                <span className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Secure access
                </span>

              </div>

            </div>

            <div className="mx-auto w-full max-w-xl">

              <div className="rounded-[28px] border border-[#dedbd8] bg-white p-5 shadow-xl">

                <div className="overflow-hidden rounded-[20px] bg-[#f7f6f4]">

                  <img
                    src="/images/revival-ivf-logo.jpeg"
                    alt="REVIVAL IVF"
                    className="w-full object-contain"
                  />

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="border-y border-[#e5e3e0] bg-white">

        <div className="mx-auto grid max-w-[1500px] md:grid-cols-3">

          <Intro
            icon={<Brain size={23} />}
            title="AI Assisted"
            text="Advanced image analysis designed to support embryo assessment."
          />

          <Intro
            icon={<Stethoscope size={23} />}
            title="Clinical First"
            text="Designed around the workflow of fertility specialists."
          />

          <Intro
            icon={<ShieldCheck size={23} />}
            title="Secure by Design"
            text="Role-based access keeps clinical information appropriately controlled."
          />

        </div>
      </section>

      {/* =====================================================
          AI TECHNOLOGY
      ===================================================== */}

      <section
        id="technology"
        className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12"
      >

        <Section
          eyebrow="AI Technology"
          title="Where artificial intelligence meets fertility care."
          text="REVIVAL IVF is designed to transform embryo images into structured insights while keeping clinical expertise at the centre of every decision."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <Tech
            icon={<ImageIcon size={22} />}
            number="01"
            title="Embryo Image Analysis"
            text="AI models analyse embryo images and identify visual characteristics relevant to structured assessment."
          />

          <Tech
            icon={<Dna size={22} />}
            number="02"
            title="Embryo Grading Support"
            text="Generate AI-assisted grading information to support fertility specialists during embryo review."
          />

          <Tech
            icon={<Activity size={22} />}
            number="03"
            title="Confidence Assessment"
            text="Present model confidence alongside AI results to make the assessment more transparent."
          />

          <Tech
            icon={<Sparkles size={22} />}
            number="04"
            title="AI Insights"
            text="Convert complex image information into structured insights that are easier to review."
          />

          <Tech
            icon={<BarChart3 size={22} />}
            number="05"
            title="Clinical Analytics"
            text="Create a foundation for future analytics and model performance monitoring."
          />

          <Tech
            icon={<LockKeyhole size={22} />}
            number="06"
            title="Controlled Access"
            text="Doctor and patient experiences remain separated through role-based authentication."
          />

        </div>
      </section>

      {/* =====================================================
          PLATFORM
      ===================================================== */}

      <section className="border-y border-[#e5e3e0] bg-[#f5f4f2]">

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <Section
            eyebrow="Platform"
            title="Everything connected in one intelligent ecosystem."
            text="REVIVAL IVF combines clinical workflow, AI assessment and patient communication into one structured platform."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <Feature
              icon={<Stethoscope size={23} />}
              title="Doctor Workspace"
              text="Review patients, upload embryo images and access AI-assisted assessments."
            />

            <Feature
              icon={<Users size={23} />}
              title="Patient Experience"
              text="Provide patients with relevant information and clinical reports."
            />

            <Feature
              icon={<FlaskConical size={23} />}
              title="Embryology Workflow"
              text="Support the journey from embryo imaging through assessment."
            />

            <Feature
              icon={<BarChart3 size={23} />}
              title="Reports & Analytics"
              text="Organise assessment results and build a foundation for future insights."
            />

          </div>
        </div>
      </section>

      {/* =====================================================
          IVF STATISTICS
          SAME REVIVAL IVF THEME
      ===================================================== */}

      <section
        id="statistics"
        className="border-y border-[#e5e3e0] bg-white"
      >

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <Section
            eyebrow="IVF Statistics"
            title="The growing role of assisted reproductive care."
            text="IVF has become an important part of modern fertility care. The statistics below provide a simple visual overview of the growth of IVF treatment over the years."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-4">

            <StatCard
              year="1980s"
              value="Early"
              title="IVF adoption"
              text="IVF began expanding from pioneering clinical work into wider fertility care."
            />

            <StatCard
              year="1990s"
              value="Growing"
              title="Treatment access"
              text="Assisted reproductive technologies became more widely available in fertility centres."
            />

            <StatCard
              year="2000s"
              value="Expanded"
              title="IVF development"
              text="Improved laboratory techniques contributed to broader use of IVF and embryo culture."
            />

            <StatCard
              year="Today"
              value="Advanced"
              title="AI-supported care"
              text="Modern fertility care increasingly combines imaging, data and emerging AI technologies."
            />

          </div>

          {/* Simple visual trend */}

          <div className="mt-10 rounded-3xl border border-[#dedbd8] bg-[#f5f4f2] p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-xl">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
                    <BarChart3 size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#817e83]">
                      IVF Over The Years
                    </p>

                    <h3 className="mt-1 text-2xl font-semibold text-[#302a52]">
                      From laboratory innovation to intelligent fertility care
                    </h3>
                  </div>

                </div>

                <p className="mt-5 text-sm leading-7 text-[#69676d]">
                  IVF has evolved considerably over several decades. Advances
                  in reproductive medicine, embryology, imaging and laboratory
                  technology continue to shape modern fertility treatment.
                </p>

              </div>

              <div className="w-full max-w-xl">

                <div className="flex h-52 items-end gap-4 rounded-2xl border border-[#dedbd8] bg-white p-6">

                  <TrendBar
                    label="1980s"
                    height="30%"
                  />

                  <TrendBar
                    label="1990s"
                    height="45%"
                  />

                  <TrendBar
                    label="2000s"
                    height="62%"
                  />

                  <TrendBar
                    label="2010s"
                    height="78%"
                  />

                  <TrendBar
                    label="Today"
                    height="94%"
                    active
                  />

                </div>

                <p className="mt-3 text-center text-xs text-[#858288]">
                  Illustrative progression — not clinical or population data.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          TREATMENTS
      ===================================================== */}

      <section
        id="treatments"
        className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12"
      >

        <Section
          eyebrow="Fertility Treatments"
          title="Treatment options designed around your fertility journey."
          text="Different fertility situations may require different approaches. Treatment decisions should always be made with guidance from a qualified fertility specialist."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {treatments.map((item) => (

            <div
              key={item.title}
              className="rounded-[20px] border border-[#dedbd8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
                {item.icon}
              </div>

              <h3 className="mt-6 text-xl font-semibold text-[#302a52]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#6b696f]">
                {item.text}
              </p>

              <button
                type="button"
                onClick={() =>
                  setOpenTreatment(
                    openTreatment === item.title ? "" : item.title
                  )
                }
                className="mt-5 flex w-full items-center justify-between border-t border-[#ebe8e5] pt-5 text-sm font-semibold text-[#8a6475]"
              >

                <span>
                  {openTreatment === item.title ? "Show less" : "Learn more"}
                </span>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#efedf2] text-[#40385f]">

                  {openTreatment === item.title ? (
                    <Minus size={15} />
                  ) : (
                    <Plus size={15} />
                  )}

                </span>

              </button>

              {openTreatment === item.title && (

                <div className="mt-5 border-t border-[#ebe8e5] pt-5">

                  <p className="text-sm leading-7 text-[#69676d]">
                    {item.details}
                  </p>

                </div>

              )}

            </div>

          ))}

        </div>
      </section>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      <section
        id="symptoms"
        className="border-y border-[#e5e3e0] bg-[#f5f4f2]"
      >

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <Section
            eyebrow="Fertility Awareness"
            title="Understanding symptoms and when to seek guidance."
            text="Fertility concerns can have many causes. Symptoms alone cannot diagnose infertility, but they may be a reason to speak with a healthcare professional."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <Symptom
              title="Irregular Periods"
              text="Changes in menstrual regularity may sometimes be associated with ovulation or hormonal factors."
            />

            <Symptom
              title="Difficulty Conceiving"
              text="Not achieving pregnancy after a period of regular unprotected intercourse may warrant fertility evaluation."
            />

            <Symptom
              title="Hormonal Concerns"
              text="Certain hormonal conditions can affect ovulation, reproductive function or sperm production."
            />

            <Symptom
              title="Recurrent Pregnancy Loss"
              text="Repeated pregnancy loss should be discussed with an appropriate healthcare professional."
            />

            <Symptom
              title="Changes in Sperm Health"
              text="Sperm count, movement and morphology can be important factors in male fertility."
            />

            <Symptom
              title="Unexplained Fertility Concerns"
              text="Sometimes fertility challenges occur even when an obvious cause is not immediately identified."
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          INFERTILITY
          MATCHED TO REVIVAL IVF THEME
      ===================================================== */}

      <section
        id="infertility"
        className="border-b border-[#e5e3e0] bg-white"
      >

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <div className="max-w-4xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-[#bd5c83]" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
                Infertility
              </span>

            </div>

            <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#302a52] sm:text-5xl">

              Infertility is not caused by
              <span className="text-[#bd5c83]"> one side alone.</span>

            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-[#69676d]">
              Fertility can involve factors affecting the female partner,
              the male partner, both partners, or sometimes no immediately
              identifiable cause. A proper evaluation considers both partners
              rather than placing responsibility on one person.
            </p>

          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">

            <InfertilityCard
              icon={<Heart size={23} />}
              label="Female Factors"
              title="Factors that may affect female fertility"
              items={[
                "Ovulation-related factors",
                "Age-related changes in fertility",
                "Fallopian tube factors",
                "Endometriosis and other reproductive conditions",
                "Uterine or cervical factors",
              ]}
            />

            <InfertilityCard
              icon={<Users size={23} />}
              label="Male Factors"
              title="Factors that may affect male fertility"
              items={[
                "Low sperm concentration",
                "Reduced sperm movement",
                "Abnormal sperm morphology",
                "Hormonal or reproductive factors",
                "Lifestyle and other health-related factors",
              ]}
            />

          </div>

          <div className="mt-8 rounded-3xl border border-[#dedbd8] bg-[#f5f4f2] p-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
                <ShieldCheck size={24} />
              </div>

              <div>

                <h3 className="text-xl font-semibold text-[#302a52]">
                  A balanced fertility evaluation matters.
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#69676d]">
                  Fertility assessment should consider both partners and
                  relevant medical factors. The appropriate evaluation and
                  treatment plan should be determined by a qualified
                  healthcare professional.
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          IVF JOURNEY
      ===================================================== */}

      <section id="journey" className="border-y border-[#e5e3e0] bg-white">

        <div className="mx-auto max-w-[1100px] px-6 py-24 lg:px-12">

          <div className="text-center">

            <Baby size={30} className="mx-auto text-[#bd5c83]" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
              Understanding IVF
            </p>

            <h2 className="mt-4 text-4xl font-semibold text-[#302a52] sm:text-5xl">

              The IVF journey,
              <span className="text-[#bd5c83]"> step by step.</span>

            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#69676d]">
              A simplified overview of the major stages involved in assisted
              reproductive treatment.
            </p>

          </div>

          <div className="mt-14 space-y-4">

            <Journey
              number="01"
              icon={<Users size={20} />}
              title="Consultation & Planning"
              text="The fertility specialist evaluates the patient's history, fertility factors and treatment plan."
            />

            <Journey
              number="02"
              icon={<Syringe size={20} />}
              title="Ovarian Stimulation"
              text="Medication may be used to stimulate the ovaries and encourage development of multiple follicles."
            />

            <Journey
              number="03"
              icon={<Egg size={20} />}
              title="Egg Retrieval"
              text="Mature eggs are collected through a controlled clinical procedure."
            />

            <Journey
              number="04"
              icon={<Users size={20} />}
              title="Sperm Collection"
              text="A sperm sample is collected and prepared for fertilization."
            />

            <Journey
              number="05"
              icon={<Heart size={20} />}
              title="Fertilization"
              text="Egg and sperm are combined in the laboratory. ICSI may be used when clinically appropriate."
            />

            <Journey
              number="06"
              icon={<Baby size={20} />}
              title="Embryo Development"
              text="Successfully fertilized eggs develop into embryos while embryologists monitor their progression."
            />

            <Journey
              highlight
              number="07"
              icon={<Microscope size={20} />}
              title="AI Embryo Assessment"
              text="REVIVAL IVF is designed to support embryo image assessment using artificial intelligence and structured analysis."
            />

            <Journey
              number="08"
              icon={<Stethoscope size={20} />}
              title="Embryo Transfer"
              text="The fertility specialist selects the appropriate embryo and performs the embryo transfer."
            />

            <Journey
              number="09"
              icon={<Baby size={20} />}
              title="Pregnancy Monitoring"
              text="Following transfer, appropriate clinical monitoring and pregnancy testing are performed."
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section id="faq" className="bg-[#f5f4f2]">

        <div className="mx-auto max-w-[1000px] px-6 py-24 lg:px-12">

          <div className="text-center">

            <Heart size={30} className="mx-auto text-[#bd5c83]" />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
              Frequently Asked Questions
            </p>

            <h2 className="mt-4 text-4xl font-semibold text-[#302a52] sm:text-5xl">

              Questions,
              <span className="text-[#bd5c83]"> answered.</span>

            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#69676d]">
              Find answers to common questions about IVF, fertility treatments
              and the REVIVAL IVF AI platform.
            </p>

          </div>

          <div className="mt-12 space-y-3">

            {faqs.map((faq, index) => (

              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-[#dedbd8] bg-white"
              >

                <button
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                >

                  <span className="text-base font-semibold text-[#302a52]">
                    {faq.question}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efedf2] text-[#40385f]">

                    {openFaq === index ? (
                      <Minus size={16} />
                    ) : (
                      <Plus size={16} />
                    )}

                  </span>

                </button>

                {openFaq === index && (

                  <div className="border-t border-[#ebe8e5] px-6 pb-6 pt-5">

                    <p className="text-sm leading-7 text-[#69676d]">
                      {faq.answer}
                    </p>

                  </div>

                )}

              </div>

            ))}

          </div>

        </div>
      </section>

      {/* =====================================================
          RESPONSIBLE AI
      ===================================================== */}

      <section className="bg-[#302a52]">

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <div className="flex items-center gap-3">

                <ShieldCheck size={21} className="text-[#d995af]" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9c5d1]">
                  Responsible AI
                </span>

              </div>

              <h2 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">

                Technology should support care,

                <span className="block text-[#d995af]">
                  not replace it.
                </span>

              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#d4d1db]">
                REVIVAL IVF is designed around a doctor-controlled workflow.
                Artificial intelligence provides assistance and structured
                information while clinical professionals remain responsible
                for interpretation and decisions.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <DarkBox
                icon={<LockKeyhole size={20} />}
                title="Role-Based Access"
                text="Separate experiences for doctors and patients."
              />

              <DarkBox
                icon={<ImageIcon size={20} />}
                title="Controlled Uploads"
                text="Embryo images remain within the doctor workflow."
              />

              <DarkBox
                icon={<Brain size={20} />}
                title="Transparent AI"
                text="Present AI results together with confidence information."
              />

              <DarkBox
                icon={<ShieldCheck size={20} />}
                title="Clinical Oversight"
                text="AI supports professional judgement."
              />

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="mx-auto max-w-[1100px] px-6 py-24 text-center lg:px-12"
      >

        <Dna size={31} className="mx-auto text-[#bd5c83]" />

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
          About REVIVAL IVF
        </p>

        <h2 className="mt-4 text-4xl font-semibold text-[#302a52] sm:text-5xl">

          Renewing hope.

          <span className="block text-[#bd5c83]">
            Creating life.
          </span>

        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#69676d]">
          Our vision is to build a responsible AI-powered fertility platform
          that brings advanced technology, clinical expertise and
          patient-centred care together.
        </p>

      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <section
        id="contact"
        className="border-t border-[#e5e3e0] bg-[#f5f4f2]"
      >

        <div className="mx-auto max-w-[1500px] px-6 py-24 lg:px-12">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-10 bg-[#bd5c83]" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
                  Contact Us
                </span>

              </div>

              <h2 className="mt-5 text-4xl font-semibold text-[#302a52] sm:text-5xl">

                Let's take the next step

                <span className="block text-[#bd5c83]">
                  together.
                </span>

              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#69676d]">
                Have questions about fertility care or the REVIVAL IVF
                platform? Get in touch with our team.
              </p>

              <div className="mt-9 space-y-5">

                <Contact
                  icon={<Phone size={19} />}
                  title="Phone"
                  value="+91 XXXXX XXXXX"
                />

                <Contact
                  icon={<Mail size={19} />}
                  title="Email"
                  value="contact@revivalivf.com"
                />

                <Contact
                  icon={<MapPin size={19} />}
                  title="Location"
                  value="Bengaluru, Karnataka, India"
                />

              </div>

            </div>

            <div className="rounded-3xl border border-[#dedbd8] bg-white p-8">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
                  <Stethoscope size={23} />
                </div>

                <div>

                  <p className="text-xs uppercase tracking-[0.15em] text-[#918d92]">
                    Fertility Care
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-[#302a52]">
                    Connect with REVIVAL IVF
                  </h3>

                </div>

              </div>

              <div className="mt-8 space-y-5">

                <input
                  type="text"
                  placeholder="Your name"
                  className="h-12 w-full rounded-lg border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none"
                />

                <input
                  type="email"
                  placeholder="Your email"
                  className="h-12 w-full rounded-lg border border-[#dcd9d6] bg-[#fafaf9] px-4 text-sm outline-none"
                />

                <textarea
                  placeholder="How can we help?"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-[#dcd9d6] bg-[#fafaf9] px-4 py-3 text-sm outline-none"
                />

                <button
                  type="button"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#302a52] text-sm font-semibold text-white hover:bg-[#403866]"
                >
                  Send Message
                  <ArrowRight size={17} />
                </button>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#e5e3e0] bg-white">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-10 lg:px-12">

          <div className="flex items-center gap-3">

            <div>

              <p className="font-semibold text-[#302a52]">
                REVIVAL IVF
              </p>

              <p className="mt-1 text-xs text-[#858288]">
                Renewing Hope, Creating Life
              </p>

            </div>

          </div>

          <p className="hidden text-xs text-[#858288] sm:block">
            AI-Powered Fertility Care
          </p>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="max-w-3xl">

      <div className="flex items-center gap-3">

        <span className="h-px w-10 bg-[#bd5c83]" />

        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#817e83]">
          {eyebrow}
        </span>

      </div>

      <h2 className="mt-5 text-4xl font-semibold leading-tight text-[#302a52] sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-8 text-[#6b696f]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   INTRO
========================================================= */

function Intro({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="border-b border-[#e5e3e0] p-8 md:border-b-0 md:border-r">

      <div className="flex gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
          {icon}
        </div>

        <div>

          <h3 className="text-lg font-semibold text-[#302a52]">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-7 text-[#6b696f]">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   TECHNOLOGY
========================================================= */

function Tech({
  icon,
  number,
  title,
  text,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dedbd8] bg-white p-7 hover:shadow-xl">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
          {icon}
        </div>

        <span className="text-xs text-[#aaa6ab]">
          {number}
        </span>

      </div>

      <h3 className="mt-7 text-xl font-semibold text-[#302a52]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#6b696f]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dedbd8] bg-white p-7">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold text-[#302a52]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#6b696f]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   STATISTICS CARD
========================================================= */

function StatCard({
  year,
  value,
  title,
  text,
}: {
  year: string;
  value: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dedbd8] bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
          <BarChart3 size={21} />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa6ab]">
          {year}
        </span>

      </div>

      <p className="mt-7 text-3xl font-semibold text-[#302a52]">
        {value}
      </p>

      <h3 className="mt-2 text-lg font-semibold text-[#bd5c83]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#69676d]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   TREND BAR
========================================================= */

function TrendBar({
  label,
  height,
  active = false,
}: {
  label: string;
  height: string;
  active?: boolean;
}) {
  return (
    <div className="flex h-full flex-1 flex-col justify-end">

      <div
        className={`w-full rounded-t-lg ${
          active ? "bg-[#bd5c83]" : "bg-[#40385f]"
        }`}
        style={{ height }}
      />

      <p className="mt-3 text-center text-[10px] font-semibold text-[#77747a]">
        {label}
      </p>

    </div>
  );
}


/* =========================================================
   SYMPTOM
========================================================= */

function Symptom({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dedbd8] bg-white p-7">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e9ee]">
          <Activity size={17} className="text-[#a65376]" />
        </div>

        <h3 className="text-lg font-semibold text-[#302a52]">
          {title}
        </h3>

      </div>

      <p className="mt-4 text-sm leading-7 text-[#69676d]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   INFERTILITY CARD
========================================================= */

function InfertilityCard({
  icon,
  label,
  title,
  items,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-[#dedbd8] bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#efedf2] text-[#40385f]">
          {icon}
        </div>

        <span className="rounded-full bg-[#f3e8ed] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9b4c70]">
          {label}
        </span>

      </div>

      <h3 className="mt-6 text-2xl font-semibold text-[#302a52]">
        {title}
      </h3>

      <div className="mt-8 space-y-4">

        {items.map((item) => (

          <div
            key={item}
            className="flex items-start gap-3"
          >

            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#efedf2]">
              <ShieldCheck
                size={13}
                className="text-[#554b78]"
              />
            </div>

            <p className="text-sm leading-7 text-[#69676d]">
              {item}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}


/* =========================================================
   JOURNEY
========================================================= */

function Journey({
  number,
  icon,
  title,
  text,
  highlight = false,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-[#d7b4c2] bg-[#fbf4f7]"
          : "border-[#dedbd8] bg-white"
      }`}
    >

      <div className="flex gap-5">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#efedf2] text-sm font-semibold text-[#40385f]">
          {number}
        </div>

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  highlight
                    ? "bg-[#f0dce4] text-[#a94f76]"
                    : "bg-[#efedf2] text-[#40385f]"
                }`}
              >
                {icon}
              </div>

              <h3 className="text-lg font-semibold text-[#302a52]">
                {title}
              </h3>

            </div>

            {highlight && (

              <span className="rounded-full bg-[#ead2dc] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9b4c70]">
                REVIVAL AI
              </span>

            )}

          </div>

          <p className="mt-3 text-sm leading-7 text-[#69676d]">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   DARK BOX
========================================================= */

function DarkBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#dfdbe5]">
        {icon}
      </div>

      <h3 className="mt-5 font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-[#cbc7d2]">
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   CONTACT
========================================================= */

function Contact({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#40385f] shadow-sm">
        {icon}
      </div>

      <div>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#918d92]">
          {title}
        </p>

        <p className="mt-1 text-sm font-medium text-[#444249]">
          {value}
        </p>

      </div>

    </div>
  );
}