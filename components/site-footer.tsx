"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Scale, AlertTriangle, Shield, Github, Twitter } from "lucide-react"

interface SiteFooterProps {
  className?: string
  /** When true, renders the slimmer compact variant (dashboard/workspace chrome). */
  variant?: "default" | "compact"
}

const YEAR = new Date().getFullYear()

const PRODUCT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
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
 * Alpha/omega site footer — appears at the bottom of every page.
 *
 * Frames the web app with the generic-yet-required legal scaffolding:
 * terms, privacy, copyright, AI disclosures, dramatization disclaimers.
 * Uses the same brutalist token set as the Masthead so the page feels
 * bookended.
 */
export function SiteFooter({ className, variant = "default" }: SiteFooterProps) {
  if (variant === "compact") {
    return (
      <footer
        className={cn(
          "w-full border-t-[2.5px] border-[var(--border)]",
          "bg-[var(--card)] dark:bg-[var(--surface)]",
          "px-5 py-3",
          className
        )}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="font-sans text-sm font-extrabold text-[var(--foreground)]">legal</span>
            <span className="font-sans text-sm font-extrabold text-[var(--red)]">drama</span>
            <span className="font-mono text-[11px] text-[var(--pink)]">.ai</span>
            <span className="ml-2 font-mono text-[10px] text-[var(--muted-foreground)]">
              © {YEAR}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-[var(--muted-foreground)]">
            {LEGAL_LINKS.slice(0, 3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[var(--amber)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[var(--muted-foreground)]/70">
              AI-generated dramatization — not legal advice
            </span>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        "w-full border-t-[2.5px] border-[var(--border)]",
        "bg-[var(--card)] dark:bg-[var(--surface)]",
        "mt-auto",
        className
      )}
    >
      {/* ═══ Disclaimer banner ═══ */}
      <div className="border-b-[2.5px] border-[var(--border)] bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              className="flex items-start gap-2 p-3 border-[2.5px] border-[var(--amber)]/40 bg-[var(--amber)]/5"
            >
              <AlertTriangle size={14} className="text-[var(--amber)] shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-[10px] font-bold text-[var(--amber)] tracking-wider mb-1">
                  DRAMATIZATION — NOT A RECORD
                </div>
                <p className="font-sans text-[11px] leading-snug text-[var(--foreground)]">
                  Scenes, dialogue, and characterizations are AI-generated
                  dramatizations for entertainment. They are not transcripts
                  or recreations of actual courtroom events.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-2 p-3 border-[2.5px] border-[var(--red)]/40 bg-[var(--red)]/5"
            >
              <Scale size={14} className="text-[var(--red)] shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-[10px] font-bold text-[var(--red)] tracking-wider mb-1">
                  NOT LEGAL ADVICE
                </div>
                <p className="font-sans text-[11px] leading-snug text-[var(--foreground)]">
                  LegalDrama.ai is a creative storytelling tool. Nothing on
                  this site constitutes legal advice or an attorney-client
                  relationship. Consult a licensed attorney for legal matters.
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-2 p-3 border-[2.5px] border-[var(--cyan)]/40 bg-[var(--cyan)]/5"
            >
              <Shield size={14} className="text-[var(--cyan)] shrink-0 mt-0.5" />
              <div>
                <div className="font-mono text-[10px] font-bold text-[var(--cyan)] tracking-wider mb-1">
                  PUBLIC RECORD + AI
                </div>
                <p className="font-sans text-[11px] leading-snug text-[var(--foreground)]">
                  Case data is sourced from public federal court records
                  (PACER / CourtListener). AI-generated content is labeled and
                  may contain errors, omissions, or embellishments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Columns ═══ */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-baseline gap-0.5 group">
              <span className="font-sans text-xl font-extrabold text-[var(--foreground)] transition-colors group-hover:text-[var(--red)]">
                legal
              </span>
              <span className="font-sans text-xl font-extrabold text-[var(--red)]">
                drama
              </span>
              <span className="font-mono text-sm text-[var(--pink)]">.ai</span>
            </Link>
            <p className="mt-3 font-serif text-[13px] leading-relaxed text-[var(--muted-foreground)] max-w-sm">
              Federal court cases reimagined as cinematic legal dramas.
              Public record in, story out.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className={cn(
                  "w-8 h-8 flex items-center justify-center",
                  "border-[2.5px] border-[var(--border)] bg-[var(--background)]",
                  "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]",
                  "brut-press shadow-[2px_2px_0px_var(--shadow-color)] transition-colors"
                )}
              >
                <Github size={14} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Twitter / X"
                className={cn(
                  "w-8 h-8 flex items-center justify-center",
                  "border-[2.5px] border-[var(--border)] bg-[var(--background)]",
                  "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]",
                  "brut-press shadow-[2px_2px_0px_var(--shadow-color)] transition-colors"
                )}
              >
                <Twitter size={14} />
              </a>
            </div>
          </div>

          {/* Product */}
          <FooterColumn title="Product" links={PRODUCT_LINKS} />

          {/* Legal */}
          <FooterColumn title="Legal" links={LEGAL_LINKS} />

          {/* Resources */}
          <FooterColumn title="Resources" links={RESOURCES_LINKS} />
        </div>
      </div>

      {/* ═══ Bottom bar ═══ */}
      <div className="border-t-[2.5px] border-[var(--border)] bg-[var(--surface-alt)]">
        <div className="max-w-7xl mx-auto px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--muted-foreground)]">
            <span>© {YEAR} LegalDrama.ai — All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">
              Made with public records and a lot of coffee.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <Link
              href="/legal/terms"
              className="text-[var(--muted-foreground)] hover:text-[var(--amber)] transition-colors"
            >
              Terms
            </Link>
            <span className="text-[var(--muted-foreground)]/40">·</span>
            <Link
              href="/legal/privacy"
              className="text-[var(--muted-foreground)] hover:text-[var(--amber)] transition-colors"
            >
              Privacy
            </Link>
            <span className="text-[var(--muted-foreground)]/40">·</span>
            <Link
              href="/legal/cookies"
              className="text-[var(--muted-foreground)] hover:text-[var(--amber)] transition-colors"
            >
              Cookies
            </Link>
            <span className="text-[var(--muted-foreground)]/40">·</span>
            <span className="text-[var(--muted-foreground)]/70">
              v0.1 — alpha
            </span>
          </div>
        </div>
      </div>
    </footer>
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
      <h3 className="font-mono text-[10px] font-bold text-[var(--foreground)] tracking-wider uppercase mb-3">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="font-sans text-[13px] text-[var(--muted-foreground)] hover:text-[var(--amber)] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
