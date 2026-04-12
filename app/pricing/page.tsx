"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CheckCircle, Zap, Users, Crown,
  ChevronDown, ChevronUp, HelpCircle, ArrowRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton, Chip, ToastProvider, useToast } from "@/components/legal-ui"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    id: "starter",
    name: "STARTER",
    price: "$99",
    period: "one-time",
    description: "For individuals exploring legal storytelling",
    icon: Sparkles,
    color: "var(--cyan)",
    featured: false,
    features: [
      "25 case searches",
      "Basic screenplay generation",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "PRO",
    price: "$499",
    period: "one-time",
    description: "Full power for serious legal dramatists",
    icon: Zap,
    color: "var(--amber)",
    featured: true,
    features: [
      "Unlimited searches",
      "Full dramatization controls",
      "Priority support",
      "API access",
      "Collaboration",
    ],
    cta: "Go Pro",
  },
  {
    id: "team",
    name: "TEAM",
    price: "$59",
    period: "/mo per seat",
    description: "Built for studios and legal teams at scale",
    icon: Users,
    color: "var(--purple)",
    featured: false,
    features: [
      "Everything in Pro",
      "Real-time collaboration",
      "Custom branding",
      "Admin dashboard",
    ],
    cta: "Contact Sales",
  },
]

const FAQ_ITEMS = [
  {
    q: "What happens after I use all 25 searches on Starter?",
    a: "Your existing projects remain fully accessible. To run additional searches, upgrade to Pro for unlimited access or purchase another Starter license.",
  },
  {
    q: "Is the one-time price really one-time?",
    a: "Yes. Starter and Pro are single purchases with no recurring fees. You own the license indefinitely. Future major version upgrades may be offered at a discounted rate.",
  },
  {
    q: "Can I switch from Starter to Pro later?",
    a: "Absolutely. Upgrade at any time and we will credit your original Starter purchase toward the Pro price. No data is lost during the transition.",
  },
  {
    q: "How does Team billing work?",
    a: "Team is billed monthly per seat. Add or remove seats at any time and your invoice adjusts automatically at the next billing cycle. Annual billing with a 20% discount is also available.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on all plans. If LegalDrama is not the right fit, contact support for a full refund within the first two weeks.",
  },
]

/* ------------------------------------------------------------------ */
/*  Nav links                                                          */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Browse" },
  { href: "/pricing", label: "Pricing" },
]

/* ------------------------------------------------------------------ */
/*  Main content (wrapped in ToastProvider below)                      */
/* ------------------------------------------------------------------ */

function PricingContent() {
  const { toast } = useToast()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handlePlanClick = (planName: string) => {
    toast(`${planName} selected -- checkout coming soon`, "var(--green)")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav
        className={cn(
          "sticky top-0 z-40 px-4 py-2",
          "flex items-center justify-between gap-3",
          "border-b-[3px] border-red",
          "bg-foreground dark:bg-surface"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-baseline gap-1 cursor-pointer group"
        >
          <span className="font-sans text-lg font-black text-background dark:text-foreground transition-colors group-hover:text-red">
            legal
          </span>
          <span className="font-sans text-lg font-black text-red">drama</span>
          <span className="font-mono text-xs text-pink">.ai</span>
        </Link>

        {/* Center links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/pricing"
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1 font-mono text-[11px] font-bold uppercase transition-colors",
                  isActive
                    ? "text-amber border-b-2"
                    : "text-background dark:text-muted-foreground hover:text-amber"
                )}
                style={isActive ? { borderColor: "var(--amber)" } : undefined}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <LegalButton small>Sign in</LegalButton>
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h1 className="font-sans text-4xl font-extrabold text-foreground mb-3">
            Pricing
          </h1>
          <p className="font-serif text-lg text-muted-foreground max-w-lg mx-auto">
            Simple plans for every legal storyteller
          </p>
        </div>

        {/* ── Pricing Grid ─────────────────────────────────────── */}
        <div className="grid gap-6 sm:grid-cols-3 mb-20">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  "border-[2.5px] border-border bg-card",
                  "transition-all duration-150",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
                  "rounded-none "
                )}
                style={{
                  borderColor: plan.featured
                    ? "var(--amber)"
                    : "var(--border)",
                  boxShadow: "var(--shadow-color) 4px 4px 0px",
                }}
              >
                {/* Popular chip */}
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Chip
                      mono
                      small
                      style={{
                        backgroundColor: "var(--amber)",
                        color: "var(--background)",
                        borderColor: "var(--amber)",
                      }}
                    >
                      <Crown size={10} />
                      POPULAR
                    </Chip>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={cn(
                        "w-8 h-8 flex items-center justify-center",
                        "border-[2.5px] border-border",
                        "rounded-none "
                      )}
                      style={{ borderColor: plan.color }}
                    >
                      <Icon size={16} style={{ color: plan.color }} />
                    </div>
                    <span className="font-mono text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
                      {plan.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="font-sans text-4xl font-black text-foreground">
                      {plan.price}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase mb-4">
                    {plan.period}
                  </span>

                  {/* Description */}
                  <p className="font-serif text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2"
                      >
                        <CheckCircle
                          size={15}
                          className="shrink-0 mt-0.5"
                          style={{ color: plan.color }}
                        />
                        <span className="font-serif text-sm text-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    className={cn(
                      "w-full py-2.5 flex items-center justify-center gap-2",
                      "border-[2.5px] font-mono text-xs font-extrabold uppercase",
                      "transition-all duration-150 cursor-pointer",
                      "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                      "rounded-none "
                    )}
                    style={{
                      backgroundColor: plan.featured
                        ? "var(--amber)"
                        : "var(--card)",
                      color: plan.featured
                        ? "var(--background)"
                        : "var(--foreground)",
                      borderColor: plan.featured
                        ? "var(--amber)"
                        : "var(--border)",
                      boxShadow: "var(--shadow-color) 4px 4px 0px",
                    }}
                  >
                    {plan.cta}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-sans text-2xl font-extrabold text-foreground mb-2">
              Frequently Asked Questions
            </h2>
            <p className="font-serif text-sm text-muted-foreground">
              Everything you need to know before getting started
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className={cn(
                    "border-[2.5px] border-border bg-card",
                    "transition-all duration-150",
                    "rounded-none "
                  )}
                  style={{
                    boxShadow: isOpen
                      ? "none"
                      : "var(--shadow-color) 4px 4px 0px",
                    transform: isOpen
                      ? "translate(2px, 2px)"
                      : "translate(0, 0)",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className={cn(
                      "w-full flex items-center justify-between gap-4",
                      "p-4 text-left cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle
                        size={16}
                        className="shrink-0 text-amber"
                      />
                      <span className="font-sans text-sm font-bold text-foreground">
                        {item.q}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        size={16}
                        className="shrink-0 text-muted-foreground"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-muted-foreground"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pl-11">
                      <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────────────── */}
        <div className="mt-20 text-center">
          <div
            className={cn(
              "inline-block border-[2.5px] border-border bg-card p-8",
              "rounded-none "
            )}
            style={{ boxShadow: "var(--shadow-color) 4px 4px 0px" }}
          >
            <h3 className="font-sans text-xl font-extrabold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="font-serif text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our team is ready to help you find the perfect plan for your legal
              storytelling needs.
            </p>
            <LegalButton color="var(--primary)">
              Contact Support
              <ArrowRight size={14} />
            </LegalButton>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className={cn(
          "mt-16 border-t-[2.5px] border-border",
          "px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        )}
      >
        <span className="font-mono text-[10px] text-muted-foreground">
          &copy; 2026 LegalDrama.ai &mdash; All rights reserved
        </span>
        <div className="flex items-center gap-4">
          {["Terms", "Privacy", "Support"].map((link) => (
            <span
              key={link}
              className="font-mono text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export with ToastProvider                                           */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <ToastProvider>
      <PricingContent />
    </ToastProvider>
  )
}
