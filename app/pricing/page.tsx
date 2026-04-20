"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Feather,
  PenTool,
  PlayCircle,
  Film,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"

/* ------------------------------------------------------------------ */
/*  Plans — freemium + Scrivener-style active-use trial                */
/* ------------------------------------------------------------------ */

type Billing = "monthly" | "annual"

interface Plan {
  id: string
  name: string
  tagline: string
  reel: string
  icon: typeof Sparkles
  accent: string
  featured: boolean
  price: { monthly: string; annual: string }
  period: { monthly: string; annual: string }
  note?: string
  features: string[]
  cta: string
  ctaHref?: string
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Open Mic",
    tagline: "The writer's night. Walk in, watch a few cases.",
    reel: "Reel 00",
    icon: Sparkles,
    accent: "#ffffff",
    featured: false,
    price: { monthly: "Free", annual: "Free" },
    period: { monthly: "forever · no card", annual: "forever · no card" },
    note: "Perfect for loglines and one-sheets",
    features: [
      "3 federal case searches / month",
      "Read-only mood boards",
      "Dramatization preview · L0 → L2",
      "Watermarked fair-use export",
      "Community Discord support",
    ],
    cta: "Start Free",
    ctaHref: "/browse",
  },
  {
    id: "staff",
    name: "Staff Writer",
    tagline: "The writers' room in your laptop.",
    reel: "Reel 01",
    icon: PenTool,
    accent: "var(--gold)",
    featured: true,
    price: { monthly: "$19", annual: "$149" },
    period: { monthly: "per month", annual: "per year · save 35%" },
    note: "30-day trial · clock only ticks when you write",
    features: [
      "Unlimited federal case searches",
      "Full dramatization · L0 Court Record → L4 Mythic",
      "Editable mood boards + exhibit pinboards",
      "True-crime beat-sheet & act-break templates",
      "Fountain / Final Draft / FDX export",
      "Auto-generated story bible per case",
      "Priority email support · 24h SLA",
    ],
    cta: "Start 30-Day Trial",
  },
  {
    id: "room",
    name: "Writers' Room",
    tagline: "Your whole staff on one set.",
    reel: "Reel 02",
    icon: Users,
    accent: "var(--red)",
    featured: false,
    price: { monthly: "$39", annual: "$29" },
    period: { monthly: "per seat · month", annual: "per seat · month, billed yearly" },
    note: "5 seat minimum · add/remove anytime",
    features: [
      "Everything in Staff Writer",
      "Real-time collaborative outlining",
      "Shared case library + story bibles",
      "Studio branding on exports",
      "SSO · private cases · audit log",
      "Dedicated showrunner-success manager",
    ],
    cta: "Book a Reading",
  },
]

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQ_ITEMS = [
  {
    q: "How does the 30-day trial actually work?",
    a: "Same trick Scrivener uses. Your 30 days are days of active use, not calendar days. Open the app on Monday, skip Tuesday, come back Saturday — that's two days off your clock, not five. Writing true crime is a marathon; the trial shouldn't expire while you're in the research hole.",
  },
  {
    q: "Is this a tool for writers or for lawyers?",
    a: "Writers. Showrunners, staff writers, limited-series producers, true-crime documentarians, podcast producers. The source docs are federal court records, but everything the app does is dramatization tooling — beat sheets, character arcs, act breaks, mood boards, script exports. Nothing here is legal advice.",
  },
  {
    q: "Do I need a credit card to start the trial?",
    a: "No. The trial runs on your email and the active-use counter. If you like it, upgrade inside the app when you're ready. If you don't, you drop back to Open Mic — your projects and exports stay yours.",
  },
  {
    q: "What happens when the trial ends?",
    a: "You keep everything you made — mood boards, exports, story bibles — and the account gracefully drops to Open Mic (3 searches a month, read-only boards). Nothing gets deleted. Nothing auto-charges. You upgrade on your own clock.",
  },
  {
    q: "Can I pitch work generated with LegalDrama.ai?",
    a: "Yes. Every export includes fair-use citation footers pointing back to the public-record source. On Staff Writer and up, the watermark comes off — the output is yours to shop, pitch, and ultimately sell.",
  },
  {
    q: "Is a Writers' Room seat different from an individual Staff Writer?",
    a: "Yes. Writers' Room adds shared case libraries, real-time collaborative outlining, studio branding, SSO, and admin controls. Staff Writer is for one person working solo. Rooms should be at least five seats — a room of one is Staff Writer.",
  },
  {
    q: "Is any of this legal advice?",
    a: "No. Everything in LegalDrama.ai is public-record dramatization and creative tooling. For legal guidance, consult a licensed attorney in your jurisdiction.",
  },
]

/* ------------------------------------------------------------------ */
/*  Trial mechanic explainer                                           */
/* ------------------------------------------------------------------ */

const TRIAL_STEPS = [
  {
    icon: PlayCircle,
    title: "Sign up. Skip the card.",
    body: "No payment up front. Email, a case of your choice, and you're in the writers' room.",
  },
  {
    icon: Clock,
    title: "The clock only ticks when you write.",
    body: "Close the laptop for three weeks between research trips. Come back — still 28 days left. The trial measures active-use days, not calendar days.",
  },
  {
    icon: Feather,
    title: "Keep what you made.",
    body: "Exports, mood boards, and story bibles stay yours forever. Upgrade to Staff Writer when the script sells — not before.",
  },
]

/* ------------------------------------------------------------------ */
/*  Pricing Content                                                    */
/* ------------------------------------------------------------------ */

function PricingContent() {
  const { toast } = useToast()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [billing, setBilling] = useState<Billing>("monthly")

  const handlePlanClick = (plan: Plan) => {
    if (plan.id === "free") {
      toast("Redirecting to the archive…", "var(--gold)")
      return
    }
    if (plan.id === "staff") {
      toast("Starting your 30-day trial — no card required", "var(--gold)")
      return
    }
    toast(`${plan.name} selected — checkout coming soon`, "var(--gold)")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Masthead
        user={user}
        onSignIn={() => toast("Sign in coming soon", "var(--gold)")}
        onSignOut={() => setUser(null)}
      />

      {/* ─── Hero ─── */}
      <section className="relative border-b border-[var(--border)] cinema-grain">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 30%, rgba(179,163,105,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(204,24,24,0.12), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="cinema-pulse-gold" aria-hidden />
            <span className="cinema-contract text-[12px] text-[var(--gold)]">
              Built For Writers · Tuned For True Crime
            </span>
          </div>
          <h1
            className="cinema-title text-[44px] md:text-[72px] lg:text-[88px] leading-[0.9] text-white"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Free To{" "}
            <span style={{ color: "var(--red)" }}>Open</span>.
            <br />
            The Clock Only Ticks When You{" "}
            <span style={{ color: "var(--gold)" }}>Write</span>.
          </h1>
          <p className="mt-5 font-sans text-[15px] md:text-[16px] leading-relaxed text-[var(--muted-foreground)] max-w-[62ch] mx-auto">
            A freemium tier that never expires, plus a Staff Writer trial that
            measures your 30 days in active use — not calendar days. Built for
            showrunners, limited-series writers, and true-crime producers who
            live in the research hole between drafts.
          </p>

          {/* Billing toggle */}
          <div className="mt-9 inline-flex items-center border border-[var(--border)] bg-[#141414] p-1">
            {(["monthly", "annual"] as Billing[]).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "h-9 px-5 cinema-label text-[10px] transition-colors",
                  billing === b
                    ? "bg-[var(--gold)] text-[#0a0a0a]"
                    : "text-[var(--muted-foreground)] hover:text-white"
                )}
              >
                {b === "monthly" ? "Monthly" : "Annual · Save 35%"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Plan grid ─── */}
      <section className="relative bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-16">
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map(plan => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col border bg-[#141414] transition-colors",
                    plan.featured
                      ? "border-[var(--gold)]"
                      : "border-[var(--border)] hover:border-[var(--gold)]"
                  )}
                  style={{ borderTop: `2px solid ${plan.accent}` }}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-[var(--gold)] px-3 py-1 cinema-contract text-[10px] text-[#0a0a0a] flex items-center gap-1.5 whitespace-nowrap">
                        <Clock size={10} /> 30-Day Active-Use Trial
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <div className="cinema-contract text-[10px] text-[var(--gold)]">
                        {plan.reel}
                      </div>
                      <Icon size={16} style={{ color: plan.accent }} />
                    </div>

                    <h3
                      className="cinema-title mt-5 text-[32px] md:text-[38px] leading-[0.95] text-white"
                      style={{ textShadow: "1px 1px 0 #000" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2 cinema-contract-italic text-[13px] text-[var(--gold)]">
                      {plan.tagline}
                    </p>

                    <div className="mt-6 flex items-baseline gap-2 pb-2 border-b border-[var(--border)]">
                      <span
                        className="cinema-title text-[44px] leading-none"
                        style={{ color: plan.accent, textShadow: "1px 1px 0 #000" }}
                      >
                        {plan.price[billing]}
                      </span>
                      <span className="cinema-contract text-[11px] text-[var(--muted-foreground)]">
                        {plan.period[billing]}
                      </span>
                    </div>
                    {plan.note && (
                      <div className="pt-2 pb-4 cinema-label text-[9px] text-[var(--muted-foreground)] leading-relaxed">
                        {plan.note}
                      </div>
                    )}

                    <ul className="mt-4 space-y-3 flex-1">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle
                            size={14}
                            className="shrink-0 mt-0.5"
                            style={{ color: plan.accent }}
                          />
                          <span className="font-sans text-[13px] leading-snug text-white">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.ctaHref ? (
                      <Link
                        href={plan.ctaHref}
                        onClick={() => handlePlanClick(plan)}
                        className={cn(
                          "mt-7 h-11 w-full flex items-center justify-center gap-2 cinema-label text-[10px] transition-colors",
                          plan.featured
                            ? "bg-[var(--gold)] text-[#0a0a0a] hover:bg-white"
                            : "bg-white text-[#0a0a0a] hover:bg-[var(--gold)]"
                        )}
                      >
                        {plan.cta} <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handlePlanClick(plan)}
                        className={cn(
                          "mt-7 h-11 w-full flex items-center justify-center gap-2 cinema-label text-[10px] transition-colors",
                          plan.featured
                            ? "bg-[var(--gold)] text-[#0a0a0a] hover:bg-white"
                            : "bg-white text-[#0a0a0a] hover:bg-[var(--gold)]"
                        )}
                      >
                        {plan.cta} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* All tickets include */}
          <div className="mt-12 border border-[var(--border)] bg-[#141414] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Film size={14} className="text-[var(--gold)]" />
              <span className="cinema-contract text-[11px] text-[var(--gold)]">
                Included On Every Ticket
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Federal public-record access",
                "Dramatization intensity control · L0 → L4",
                "Fair-use citation on every export",
                "Your work stays yours forever",
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-[var(--gold)] mt-0.5 shrink-0" />
                  <span className="font-sans text-[12px] text-[var(--muted-foreground)] leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trial mechanic explainer ─── */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="text-center mb-10">
            <div className="cinema-contract text-[11px] text-[var(--gold)] mb-3">
              § How The Writer's Trial Works
            </div>
            <h2
              className="cinema-title text-[32px] md:text-[48px] leading-[0.95] text-white"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              30 Days Of <span style={{ color: "var(--gold)" }}>Use</span>.
              <br />
              Not 30 Days On The <span style={{ color: "var(--red)" }}>Calendar</span>.
            </h2>
            <p className="mt-5 font-sans text-[14px] leading-relaxed text-[var(--muted-foreground)] max-w-[58ch] mx-auto">
              Same trial mechanic the writers at Scrivener swear by — adapted
              for the research-heavy rhythm of a true-crime limited series.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TRIAL_STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="relative border border-[var(--border)] bg-[#141414] p-6 md:p-7 hover:border-[var(--gold)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="cinema-contract text-[10px] text-[var(--gold)]">
                      Step {String(idx + 1).padStart(2, "0")}
                    </div>
                    <Icon size={18} className="text-[var(--gold)]" />
                  </div>
                  <h3 className="cinema-title text-[22px] md:text-[24px] leading-[1.05] text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                    {step.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[900px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="cinema-contract text-[11px] text-[var(--gold)] mb-3 text-center">
            § Director's Commentary
          </div>
          <h2 className="cinema-title text-[32px] md:text-[44px] leading-[0.95] text-white text-center">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 border border-[var(--border)]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className={cn(
                    "border-b last:border-b-0 border-[var(--border)] bg-[#141414]",
                    isOpen && "bg-[#1a1a1a]"
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="cinema-contract text-[10px] w-6 text-[var(--gold)]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-[14px] font-medium text-white group-hover:text-[var(--gold)] transition-colors">
                        {item.q}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-[var(--gold)] shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-[var(--muted-foreground)] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 md:px-6 pb-5 pl-14">
                      <p className="font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Closing CTA ─── */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[900px] mx-auto px-5 md:px-8 py-14 md:py-16 text-center">
          <div className="cinema-contract text-[11px] text-[var(--gold)] mb-3">
            § Still Rolling
          </div>
          <h3
            className="cinema-title text-[32px] md:text-[44px] leading-[0.95] text-white"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            Not Ready To Pick A Tier?
          </h3>
          <p className="mt-4 font-sans text-[14px] text-[var(--muted-foreground)] max-w-[54ch] mx-auto">
            Open any case on the archive and see what the app feels like.
            The Luigi Mangione docket is already loaded as a demo — no account,
            no clock, no commitment.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/case/usa-v-mangione"
              className="h-11 px-6 bg-white text-[#0a0a0a] cinema-label text-[11px] hover:bg-[var(--gold)] transition-colors inline-flex items-center gap-2"
            >
              Open The Demo Case <ArrowRight size={12} />
            </Link>
            <Link
              href="/browse"
              className="h-11 px-6 border border-[var(--gold)] text-[var(--gold)] cinema-label text-[11px] hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-colors inline-flex items-center gap-2"
            >
              Browse The Archive
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export with ToastProvider                                          */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <ToastProvider>
      <PricingContent />
    </ToastProvider>
  )
}
