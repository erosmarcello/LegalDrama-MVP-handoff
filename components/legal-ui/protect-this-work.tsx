"use client"

/**
 * Protect-This-Work — copyright-registration CTA surface for the
 * post-generation view (after a user produces a narrative, script,
 * treatment, or pitch deck).
 *
 * Ships two pieces that callers compose together:
 *   1. <ProtectThisWork />          — full explainer card with
 *                                     shield + description + chips
 *                                     + orange "Register Copyright"
 *                                     CTA + Trademarkia® footer.
 *                                     Lives BELOW the artifact output.
 *   2. <RegisterCopyrightButton />  — compact pill that sits IN the
 *                                     Copy/Export action bar, same
 *                                     altitude as Copy and Share.
 *
 * The two pieces share one handler so the whole flow is one callback
 * at the call site. If you only want the button, use the button; if
 * you only want the card, use the card. For the highest-conversion
 * moment (a fresh artifact just rendered) you want both.
 *
 * All styling uses theme tokens. No hardcoded colors, no logo assets —
 * Trademarkia is referenced by name only in the footer line.
 */

import { Shield, FileCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Eligible-work chip palette ─────────────────────────────────────
// Each work type the flow can protect gets its own accent so the chip
// rail reads like a spectrum of covered artifact shapes. Kept inside
// this file since these labels are the product's vocabulary for
// "things that are copyrightable" — not reused elsewhere.
type EligibleWork = {
  label: string
  /** CSS var name (without `var()` wrapper) so Chip-like styling works */
  color: string
}

const DEFAULT_ELIGIBLE: EligibleWork[] = [
  { label: "Narratives",  color: "var(--purple)" },
  { label: "Scripts",     color: "var(--pink)" },
  { label: "Pitch Decks", color: "var(--cyan)" },
  { label: "Podcasts",    color: "var(--amber)" },
]

// ───────────────────────────────────────────────────────────────────
// Shared handler type — one callback that both pieces dispatch on
// click. The parent (artifact view) decides whether to open a modal,
// hand off to Trademarkia, fire a toast, etc. The CTA pieces don't
// care about the downstream.
// ───────────────────────────────────────────────────────────────────
type ProtectHandler = () => void

// ═══════════════════════════════════════════════════════════════════
// <RegisterCopyrightButton /> — compact action-bar pill
// ═══════════════════════════════════════════════════════════════════
//
// Rendering contract:
//   - Same height class as the Copy / Share buttons in the Screenplay
//     action bar (`px-4 py-3`) so it aligns cleanly.
//   - Shield icon + "Register Copyright" label.
//   - Orange accent on hover to pre-announce the big CTA below.
//   - Disabled prop so callers can gate it on "artifact exists".
//
interface RegisterCopyrightButtonProps {
  onRegister: ProtectHandler
  disabled?: boolean
  className?: string
  /** Optional compact variant — emoji-only badge for very tight bars */
  compact?: boolean
}

export function RegisterCopyrightButton({
  onRegister,
  disabled = false,
  className,
  compact = false,
}: RegisterCopyrightButtonProps) {
  return (
    <button
      onClick={onRegister}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 border-2 font-mono text-sm font-bold",
        "rounded-lg transition-all duration-200",
        "border-[var(--border)] text-[var(--foreground)]",
        "hover:border-[var(--orange)] hover:text-[var(--orange)]",
        "hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--orange)_15%,transparent)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "disabled:hover:border-[var(--border)] disabled:hover:text-[var(--foreground)]",
        "disabled:hover:shadow-none",
        compact ? "px-3 py-2" : "px-4 py-3",
        className
      )}
      title="Register this work with the U.S. Copyright Office"
    >
      <Shield size={16} />
      {compact ? "Protect" : "Register Copyright"}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// <ProtectThisWork /> — full explainer card
// ═══════════════════════════════════════════════════════════════════
//
// Rendering contract:
//   - Card that sits BELOW the artifact output. Full modal width.
//   - Orange-tinted shield badge on the left, copy on the right.
//   - Chip rail listing what the service covers.
//   - Orange gradient CTA ("Register Copyright — $500") as the only
//     primary button in the card.
//   - Tiny footer line crediting Trademarkia (the actual service that
//     files the registration) and what the user receives.
//
interface ProtectThisWorkProps {
  /** Click handler for the primary CTA button. */
  onRegister: ProtectHandler
  /**
   * What was just generated. Customizes the first line so the user
   * knows the system saw what they produced. Defaults to "original
   * content" which works for any artifact type.
   */
  artifactLabel?: string
  /** Override which work-type chips render. Defaults to the 4 common. */
  eligibleWorks?: EligibleWork[]
  /**
   * Price shown inside the CTA button. Left as a prop (not hardcoded
   * in the handler) so pricing tiers can swap without touching the
   * call site. $500 matches Trademarkia's current federal rate.
   */
  priceLabel?: string
  className?: string
}

export function ProtectThisWork({
  onRegister,
  artifactLabel = "original content",
  eligibleWorks = DEFAULT_ELIGIBLE,
  priceLabel = "$500",
  className,
}: ProtectThisWorkProps) {
  return (
    <div
      className={cn(
        "relative border border-[var(--border)] bg-[var(--card)] rounded-xl overflow-hidden",
        className
      )}
    >
      {/* Subtle orange wash across the top so the card reads as a CTA
          surface without looking like an ad. Uses color-mix on the
          orange token so it adapts to theme. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--orange) 12%, transparent) 0%, transparent 60%)",
        }}
      />

      {/* Body ─ two columns: shield badge + copy/CTA stack. */}
      <div className="relative flex gap-4 p-5">
        {/* Shield badge */}
        <div
          className="flex-none w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--orange) 85%, transparent), color-mix(in srgb, var(--orange) 40%, var(--card)))",
            boxShadow:
              "0 4px 12px color-mix(in srgb, var(--orange) 25%, transparent)",
          }}
        >
          <Shield size={22} className="text-[var(--foreground)]" strokeWidth={2.25} />
        </div>

        {/* Copy + chips + CTA */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-sans text-[15px] font-bold text-[var(--foreground)]">
                Protect This Work
              </h4>
            </div>
            <p className="font-sans text-[13px] text-[var(--muted-foreground)] leading-relaxed">
              You just created {artifactLabel}. Register your copyright with the
              U.S. Copyright Office before sharing — it takes 5 minutes and
              gives you legal protection against unauthorized use.
            </p>
          </div>

          {/* Eligible-work chips ─ declarative list of what's covered. */}
          <div className="flex flex-wrap gap-1.5">
            {eligibleWorks.map((w) => (
              <span
                key={w.label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold"
                style={{
                  color: w.color,
                  borderColor: `color-mix(in srgb, ${w.color} 40%, var(--border))`,
                  backgroundColor: `color-mix(in srgb, ${w.color} 8%, transparent)`,
                }}
              >
                <Sparkles size={9} />
                {w.label}
              </span>
            ))}
          </div>

          {/* Primary CTA — the only filled button in the card. */}
          <button
            onClick={onRegister}
            className={cn(
              "w-full sm:w-auto px-5 py-3 flex items-center justify-center gap-2",
              "font-mono text-sm font-bold tracking-wide",
              "rounded-lg transition-all duration-200",
              "text-[var(--foreground)]",
              "shadow-[0_4px_14px_color-mix(in_srgb,var(--orange)_30%,transparent)]",
              "hover:shadow-[0_6px_18px_color-mix(in_srgb,var(--orange)_40%,transparent)]",
              "hover:scale-[1.015] active:scale-[0.985]"
            )}
            style={{
              background:
                "linear-gradient(90deg, var(--orange), color-mix(in srgb, var(--orange) 75%, var(--pink)))",
            }}
          >
            <Shield size={14} />
            Register Copyright — {priceLabel}
          </button>

          {/* Provider footer — tiny, tertiary typography. */}
          <div className="pt-1 flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-[var(--muted-foreground)]">
            <span className="opacity-70">Powered by</span>
            <span className="text-[var(--foreground)] font-bold">
              Trademarkia®
            </span>
            <span className="opacity-40">·</span>
            <FileCheck size={10} className="opacity-70" />
            <span className="opacity-70">
              Federal registration · Certificate of Registration
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
