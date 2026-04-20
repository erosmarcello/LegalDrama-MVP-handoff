"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Scale, AlertTriangle, Shield, Github, Twitter } from "lucide-react"

interface SiteFooterProps {
  className?: string
  /** When true, renders the slimmer compact variant (workspace chrome). */
  variant?: "default" | "compact" | "ai-disclaimer"
}

/**
 * Tiny single-line AI disclaimer bar — NotebookLM-style.
 * Use standalone above the main SiteFooter on AI-generation workspaces
 * (the case demo), so the user sees the bottom of the page AND the
 * hallucination warning stays persistently visible.
 */
export function AiDisclaimerBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full border-t border-[var(--border)] bg-[#0b0b0b]",
        "px-5 py-2.5 flex items-center justify-center gap-2",
        className
      )}
      role="note"
      aria-label="AI disclaimer"
    >
      <AlertTriangle
        size={11}
        className="shrink-0 text-[var(--muted-foreground)]/70"
        aria-hidden
      />
      <p className="font-sans text-[11px] text-center text-[var(--muted-foreground)]/80 leading-tight">
        <span className="text-[var(--muted-foreground)]">Legal disclaimer:</span>{" "}
        LegalDrama.ai can be inaccurate. Please double-check responses.
      </p>
    </div>
  )
}

const YEAR = new Date().getFullYear()

const PRODUCT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Active Trials" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
]

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/acceptable-use", label: "Acceptable Use" },
  { href: "/legal/copyright", label: "Copyright / DMCA" },
]

const RESOURCES_LINKS = [
  { href: "/legal/disclaimers", label: "Disclaimers" },
  { href: "/legal/ai-transparency", label: "AI Transparency" },
  { href: "/legal/data-sources", label: "Data Sources" },
  { href: "/legal/contact", label: "Contact" },
]

/**
 * Alpha/omega cinema-noir footer — bookends every page.
 *
 * Dark film surface, aged-gold labels, white/red/gold disclaimer cards,
 * pulsing red copyright stamp.
 */
export function SiteFooter({ className, variant = "default" }: SiteFooterProps) {
  if (variant === "ai-disclaimer") {
    return <AiDisclaimerBar className={className} />
  }
  if (variant === "compact") {
    return (
      <footer
        className={cn(
          "w-full border-t border-[var(--border)]",
          "bg-[#0a0a0a]",
          "cinema-grain",
          "px-5 py-3",
          className
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="cinema-title text-[14px] text-white leading-none">
              LEGAL
            </span>
            <span
              className="cinema-title text-[14px] leading-none"
              style={{ color: "var(--red)" }}
            >
              DRAMA
            </span>
            <span className="cinema-label text-[8px] text-[var(--gold)] ml-1">
              .AI
            </span>
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)] ml-3">
              © {YEAR}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.slice(0, 3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="cinema-label text-[9px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)]/60 hidden sm:inline">
              · AI dramatization — not legal advice
            </span>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        "w-full border-t border-[var(--border)]",
        "bg-[#0a0a0a]",
        "cinema-grain",
        "mt-auto",
        className
      )}
    >
      {/* ═══ Disclaimer banner ═══ */}
      <div className="relative z-10 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
          <div className="cinema-contract text-[11px] text-[var(--gold)] mb-3">
            The Fine Print
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--border)]">
            <DisclaimerCard
              accent="var(--red)"
              icon={AlertTriangle}
              label="DRAMATIZATION"
              body="Scenes, dialogue, and characterizations are AI-generated dramatizations for entertainment. Not transcripts or recreations of actual courtroom events."
            />
            <DisclaimerCard
              accent="var(--gold)"
              icon={Scale}
              label="NOT LEGAL ADVICE"
              body="LegalDrama.ai is a creative storytelling tool. Nothing here constitutes legal advice or forms an attorney-client relationship. Consult a licensed attorney."
              borderLeft
            />
            <DisclaimerCard
              accent="#ffffff"
              icon={Shield}
              label="PUBLIC RECORD + AI"
              body="Case data sourced from public federal court records (PACER / CourtListener). AI-generated content is labeled and may contain errors or embellishments."
              borderLeft
            />
          </div>
        </div>
      </div>

      {/* ═══ Columns ═══ */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-baseline gap-1 group">
              <span
                className="cinema-title text-[28px] text-white leading-none"
                style={{ textShadow: "1px 1px 0 #000" }}
              >
                LEGAL
              </span>
              <span
                className="cinema-title text-[28px] leading-none"
                style={{ color: "var(--red)", textShadow: "1px 1px 0 #000" }}
              >
                DRAMA
              </span>
              <span className="cinema-label text-[11px] text-[var(--gold)] ml-1">
                .AI
              </span>
            </Link>
            <p className="mt-4 font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)] max-w-sm">
              Federal court cases reimagined as cinematic legal dramas.
              Built for screenwriters, true-crime obsessives, and anyone who
              thinks the docket is already a script.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialChip href="https://github.com/" label="GitHub">
                <Github size={13} />
              </SocialChip>
              <SocialChip href="https://twitter.com/" label="Twitter / X">
                <Twitter size={13} />
              </SocialChip>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="cinema-pulse-gold" aria-hidden />
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                Alpha — public record in, story out
              </span>
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
          <FooterColumn title="Resources" links={RESOURCES_LINKS} />
        </div>
      </div>

      {/* ═══ Bottom bar ═══ */}
      <div className="relative z-10 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="cinema-pulse-dot" aria-hidden />
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
              © {YEAR} LegalDrama.ai — All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/legal/terms"
              className="cinema-label text-[9px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/legal/privacy"
              className="cinema-label text-[9px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/cookies"
              className="cinema-label text-[9px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
            >
              Cookies
            </Link>
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)]/60">
              v0.1 · Alpha
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function DisclaimerCard({
  accent,
  icon: Icon,
  label,
  body,
  borderLeft = false,
}: {
  accent: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  label: string
  body: string
  borderLeft?: boolean
}) {
  return (
    <div
      className={cn(
        "p-4 flex items-start gap-3 bg-[var(--surface)]/50",
        borderLeft && "border-l border-[var(--border)]"
      )}
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <Icon size={14} className="shrink-0 mt-0.5" style={{ color: accent }} />
      <div>
        <div
          className="cinema-label text-[9px] mb-1.5"
          style={{ color: accent }}
        >
          {label}
        </div>
        <p className="font-sans text-[11px] leading-snug text-[var(--foreground)]">
          {body}
        </p>
      </div>
    </div>
  )
}

function SocialChip({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className={cn(
        "w-8 h-8 flex items-center justify-center",
        "border border-[var(--border)] bg-transparent",
        "text-[var(--muted-foreground)] hover:text-[var(--gold)] hover:border-[var(--gold)]",
        "transition-colors"
      )}
    >
      {children}
    </a>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) {
  return (
    <div>
      <h3 className="cinema-label text-[10px] text-[var(--gold)] mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-sans text-[12px] text-[var(--muted-foreground)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
