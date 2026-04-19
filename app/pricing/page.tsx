"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle,
  Zap,
  Users,
  Crown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Film,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"

/* ------------------------------------------------------------------ */
/*  Plans                                                              */
/* ------------------------------------------------------------------ */

interface Plan {
  id: string
  name: string
  price: string
  period: string
  tagline: string
  reel: string
  icon: typeof Sparkles
  accent: string
  featured: boolean
  features: string[]
  cta: string
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Matinee",
    price: "$99",
    period: "one-time",
    tagline: "A seat in the last row of the theater",
    reel: "Reel 01",
    icon: Sparkles,
    accent: "#ffffff",
    featured: false,
    features: [
      "25 federal case searches",
      "Basic screenplay generation",
      "Mood board (read-only)",
      "Email support",
      "Fair-use citation export",
    ],
    cta: "Buy Matinee Pass",
  },
  {
    id: "pro",
    name: "Prime Time",
    price: "$499",
    period: "one-time",
    tagline: "Private screening with the director's notes",
    reel: "Reel 02",
    icon: Zap,
    accent: "var(--gold)",
    featured: true,
    features: [
      "Unlimited federal case searches",
      "Full dramatization controls",
      "Editable mood board + exhibit pinboards",
      "API access (PACER + court listener)",
      "Fountain/Final Draft exports",
      "Priority support · 24h SLA",
    ],
    cta: "Go Prime Time",
  },
  {
    id: "team",
    name: "The Writers' Room",
    price: "$59",
    period: "per seat · mo",
    tagline: "Your whole room on one set",
    reel: "Reel 03",
    icon: Users,
    accent: "var(--red)",
    featured: false,
    features: [
      "Everything in Prime Time",
      "Real-time collaborative scripting",
      "Custom studio branding",
      "Admin + billing dashboard",
      "SAML/SSO · Private cases",
      "Dedicated CSM",
    ],
    cta: "Book A Screening",
  },
]

const FAQ_ITEMS = [
  {
    q: "What happens after I use all 25 searches on Matinee?",
    a: "Your existing projects remain fully accessible. To run additional searches, upgrade to Prime Time for unlimited access or purchase another Matinee pass.",
  },
  {
    q: "Is the one-time price really one-time?",
    a: "Yes. Matinee and Prime Time are single purchases with no recurring fees. You own the license indefinitely. Future major version upgrades may be offered at a discounted rate.",
  },
  {
    q: "Can I upgrade from Matinee to Prime Time later?",
    a: "Absolutely. Upgrade at any time and we credit your original Matinee purchase toward the Prime Time price. No data is lost during the transition.",
  },
  {
    q: "How does Writers' Room billing work?",
    a: "Writers' Room is billed monthly per seat. Add or remove seats at any time and your invoice adjusts automatically at the next billing cycle. Annual billing with a 20% discount is available.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on all plans. If LegalDrama is not the right fit, contact support for a full refund within the first two weeks.",
  },
  {
    q: "Is anything in LegalDrama.ai legal advice?",
    a: "No. Everything here is public-record dramatization and creative tooling. For legal guidance, consult a licensed attorney in your jurisdiction.",
  },
]

/* ------------------------------------------------------------------ */
/*  Pricing Content                                                    */
/* ------------------------------------------------------------------ */

function PricingContent() {
  const { toast } = useToast()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)

  const handlePlanClick = (planName: string) => {
    toast(`${planName} selected — checkout coming soon`, "var(--gold)")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Masthead
        user={user}
        onSignIn={() => toast("Sign in coming soon", "var(--gold)")}
        onSignOut={() => setUser(null)}
        pacerConnected
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
              Subscription Tiers · No Hidden Residuals
            </span>
          </div>
          <h1
            className="cinema-title text-[44px] md:text-[72px] lg:text-[92px] leading-[0.9] text-white"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Pick Your{" "}
            <span style={{ color: "var(--red)" }}>Seat</span>.
            <br />
            Walk Into The{" "}
            <span style={{ color: "var(--gold)" }}>Theater</span>.
          </h1>
          <p className="mt-5 font-sans text-[15px] leading-relaxed text-[var(--muted-foreground)] max-w-[58ch] mx-auto">
            Three tickets. One reel of federal court records. Cancel any time —
            your generated scripts, mood boards, and timelines stay yours.
          </p>
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
                      <div className="bg-[var(--gold)] px-3 py-1 cinema-contract text-[10px] text-[#0a0a0a] flex items-center gap-1.5">
                        <Crown size={10} /> Most Popular
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
                      className="cinema-title mt-5 text-[34px] md:text-[40px] leading-[0.95] text-white"
                      style={{ textShadow: "1px 1px 0 #000" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-2 cinema-contract-italic text-[13px] text-[var(--gold)]">
                      {plan.tagline}
                    </p>

                    <div className="mt-6 flex items-baseline gap-2 pb-5 border-b border-[var(--border)]">
                      <span
                        className="cinema-title text-[44px] leading-none"
                        style={{ color: plan.accent, textShadow: "1px 1px 0 #000" }}
                      >
                        {plan.price}
                      </span>
                      <span className="cinema-contract text-[11px] text-[var(--muted-foreground)]">
                        {plan.period}
                      </span>
                    </div>

                    <ul className="mt-5 space-y-3 flex-1">
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

                    <button
                      onClick={() => handlePlanClick(plan.name)}
                      className={cn(
                        "mt-7 h-11 w-full flex items-center justify-center gap-2 cinema-label text-[10px] transition-colors",
                        plan.featured
                          ? "bg-[var(--gold)] text-[#0a0a0a] hover:bg-white"
                          : "bg-white text-[#0a0a0a] hover:bg-[var(--gold)]"
                      )}
                    >
                      {plan.cta} <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comparison strip */}
          <div className="mt-12 border border-[var(--border)] bg-[#141414] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Film size={14} className="text-[var(--gold)]" />
              <span className="cinema-contract text-[11px] text-[var(--gold)]">
                All Tickets Include
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "Federal public record access",
                "AI-dramatization labels",
                "Cited source documents",
                "14-day refund window",
              ].map(item => (
                <div
                  key={item}
                  className="flex items-start gap-2"
                >
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
                      <span
                        className="cinema-contract text-[10px] w-6 text-[var(--gold)]"
                      >
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
            Not Sure Which Seat To Book?
          </h3>
          <p className="mt-4 font-sans text-[14px] text-[var(--muted-foreground)] max-w-[50ch] mx-auto">
            Our team walks through the plan with you, shows you a real case
            workspace, and answers everything — even the legal questions we
            can't answer.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/legal/contact"
              className="h-11 px-6 bg-white text-[#0a0a0a] cinema-label text-[11px] hover:bg-[var(--gold)] transition-colors inline-flex items-center gap-2"
            >
              Contact Support <ArrowRight size={12} />
            </Link>
            <Link
              href="/browse"
              className="h-11 px-6 border border-[var(--gold)] text-[var(--gold)] cinema-label text-[11px] hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-colors inline-flex items-center gap-2"
            >
              Watch A Demo Case
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
