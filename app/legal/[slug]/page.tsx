import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Scale, AlertTriangle, Shield, FileText, Mail, Cookie, Copyright, BookOpen } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

/* ------------------------------------------------------------------ */
/*  Legal content — generic-yet-required scaffolding for the alpha     */
/*  MVP. Replace with counsel-reviewed copy before public launch.      */
/* ------------------------------------------------------------------ */

interface LegalDoc {
  title: string
  subtitle: string
  icon: typeof Scale
  accent: string
  updated: string
  sections: { heading: string; body: string[] }[]
}

const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    title: "Terms of Service",
    subtitle: "The rules of the road for using LegalDrama.ai.",
    icon: FileText,
    accent: "var(--amber)",
    updated: "April 2026",
    sections: [
      {
        heading: "1. Acceptance",
        body: [
          "By accessing or using LegalDrama.ai, you agree to be bound by these Terms. If you do not agree, do not use the service.",
          "LegalDrama.ai is a creative storytelling platform that transforms public federal court records into cinematic dramatizations. It is not a law firm, legal research tool, or substitute for counsel.",
        ],
      },
      {
        heading: "2. The Service",
        body: [
          "We ingest public court records (PACER, CourtListener, public filings) and generate AI-dramatized scenes, screenplays, timelines, and character profiles. All generated content is fictional interpretation, not a factual record.",
          "You may upload supplementary materials — \"mood board\" assets, reference photography, audio, or notes — which are used only within your workspace.",
        ],
      },
      {
        heading: "3. Acceptable Use",
        body: [
          "You agree not to: (a) upload material you do not have the right to use; (b) attempt to identify private individuals beyond what appears in public records; (c) represent AI-generated dramatizations as factual or legally binding; (d) use the service to harass, defame, or stalk any person.",
        ],
      },
      {
        heading: "4. No Legal Advice",
        body: [
          "Nothing on LegalDrama.ai constitutes legal advice. No attorney-client relationship is formed by using the service. Consult a licensed attorney for any real legal matter.",
        ],
      },
      {
        heading: "5. Termination",
        body: [
          "We may suspend or terminate your account at any time for breach of these Terms. You may delete your account at any time via Settings.",
        ],
      },
      {
        heading: "6. Governing Law",
        body: [
          "These Terms are governed by the laws of the State of New York, without regard to conflict of laws principles.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "What we collect, why we collect it, and how we protect it.",
    icon: Shield,
    accent: "var(--cyan)",
    updated: "April 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account data (email, name, auth tokens). Workspace data (cases you save, assets you upload, screenplays you draft). Usage telemetry (pages viewed, features used, error reports). We do not sell personal data.",
        ],
      },
      {
        heading: "Why we collect it",
        body: [
          "To operate the service, personalize your workspace, improve AI outputs, and maintain security. Usage telemetry is aggregated and anonymized before any analysis.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "Model providers (for AI inference), payment processors (for subscriptions), and infrastructure vendors (hosting, observability) — each under a data processing agreement. We do not share your workspace content with third parties for advertising.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request export or deletion of your data at any time by emailing privacy@legaldrama.ai. EU/UK residents have additional rights under GDPR; California residents under CCPA.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "We retain workspace data for as long as your account is active, plus 30 days after deletion for recovery. Telemetry is retained for 12 months.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "How we use cookies and similar technologies.",
    icon: Cookie,
    accent: "var(--orange)",
    updated: "April 2026",
    sections: [
      {
        heading: "Strictly necessary",
        body: [
          "Session cookies keep you logged in and remember your preferences (theme, layout). These cannot be disabled without breaking the service.",
        ],
      },
      {
        heading: "Analytics",
        body: [
          "We use privacy-preserving analytics to count page views and measure feature usage. You can opt out in Settings → Privacy.",
        ],
      },
      {
        heading: "Third-party cookies",
        body: [
          "Our payment processor (Stripe) sets its own cookies when you visit the Pricing or checkout pages. See their cookie policy for details.",
        ],
      },
    ],
  },
  "acceptable-use": {
    title: "Acceptable Use Policy",
    subtitle: "What's allowed — and what will get you suspended.",
    icon: AlertTriangle,
    accent: "var(--amber)",
    updated: "April 2026",
    sections: [
      {
        heading: "Prohibited content",
        body: [
          "Harassment, targeted defamation, doxxing, or content that identifies private individuals beyond what appears in the public record.",
          "CSAM, non-consensual intimate imagery, or anything that violates U.S. federal law.",
          "Material you don't have rights to — copyrighted images, other authors' scripts, confidential filings.",
        ],
      },
      {
        heading: "AI output guardrails",
        body: [
          "You may not represent AI-generated dramatizations as transcripts, recreations, or factual records of actual events. Always label generated content as dramatization when sharing externally.",
        ],
      },
      {
        heading: "Enforcement",
        body: [
          "We may remove content or suspend accounts that violate this policy. Repeat or severe violations result in permanent termination. Reports go to abuse@legaldrama.ai.",
        ],
      },
    ],
  },
  copyright: {
    title: "Copyright & DMCA",
    subtitle: "How to report infringement — and how we respond.",
    icon: Copyright,
    accent: "var(--red)",
    updated: "April 2026",
    sections: [
      {
        heading: "Ownership",
        body: [
          "Public court records are in the public domain. User-uploaded content remains owned by the uploader; you grant LegalDrama.ai a license to store and display it within your workspace.",
          "AI-generated dramatizations are made available to you under a broad creative license for personal and commercial projects, subject to these Terms.",
        ],
      },
      {
        heading: "DMCA notices",
        body: [
          "To report copyright infringement, send a DMCA-compliant notice to dmca@legaldrama.ai including: identification of the copyrighted work, the allegedly infringing material, your contact information, a good-faith statement, and a sworn accuracy statement.",
          "We process valid notices within 10 business days and will remove or disable access to infringing material.",
        ],
      },
      {
        heading: "Counter-notices",
        body: [
          "If you believe your content was removed in error, you may submit a counter-notice to the same address. We will restore the material unless we receive notice of a lawsuit within 10–14 business days.",
        ],
      },
    ],
  },
  disclaimers: {
    title: "Disclaimers",
    subtitle: "The important caveats for every dramatization you see.",
    icon: AlertTriangle,
    accent: "var(--amber)",
    updated: "April 2026",
    sections: [
      {
        heading: "Dramatization notice",
        body: [
          "Every scene, line of dialogue, character moment, and narrative beat generated by LegalDrama.ai is AI-synthesized interpretation, not a transcript or recreation. Real proceedings differ in tone, substance, pacing, and factual specifics.",
        ],
      },
      {
        heading: "No legal advice",
        body: [
          "LegalDrama.ai is a creative tool. It does not provide legal advice, does not create an attorney-client relationship, and should never be used to make legal decisions. Always consult a licensed attorney.",
        ],
      },
      {
        heading: "Accuracy",
        body: [
          "Public record data is sourced as-is from PACER and CourtListener. We do not verify or litigate the accuracy of the underlying filings. AI outputs may contain hallucinations, omissions, or embellishments.",
        ],
      },
      {
        heading: "Depictions of real people",
        body: [
          "Characters named after real parties, attorneys, or judges are dramatized interpretations. Nothing depicted should be attributed to the real individual as fact. Public figures retain their rights of publicity in their respective jurisdictions.",
        ],
      },
    ],
  },
  "ai-transparency": {
    title: "AI Transparency",
    subtitle: "What models we use and how we use them.",
    icon: Scale,
    accent: "var(--purple)",
    updated: "April 2026",
    sections: [
      {
        heading: "Models",
        body: [
          "We use a mix of frontier LLMs (via Anthropic and OpenAI APIs) and custom fine-tuned models for legal document parsing. The specific provider for any given output is displayed in the generation metadata.",
        ],
      },
      {
        heading: "Training data",
        body: [
          "User-uploaded content is not used to train base models. It is used within your workspace to generate your dramatizations. We may use aggregated, anonymized telemetry to improve retrieval quality.",
        ],
      },
      {
        heading: "Labeling",
        body: [
          "All AI-generated content is tagged with a provenance marker. When you export or share, that marker travels with the content.",
        ],
      },
      {
        heading: "Errors",
        body: [
          "AI outputs can be wrong. Report egregious errors via the feedback button inside any workspace — it helps us tune safety filters and retrieval.",
        ],
      },
    ],
  },
  "data-sources": {
    title: "Data Sources",
    subtitle: "Where case data comes from.",
    icon: BookOpen,
    accent: "var(--cyan)",
    updated: "April 2026",
    sections: [
      {
        heading: "PACER",
        body: [
          "Public Access to Court Electronic Records — the federal judiciary's official docket system. LegalDrama.ai maintains a research account; case data surfaced on this site is sourced from public PACER filings.",
        ],
      },
      {
        heading: "CourtListener / Free Law Project",
        body: [
          "A non-profit open archive of federal opinions, dockets, and oral arguments. We use CourtListener as a secondary source and to fill gaps where PACER is paywalled.",
        ],
      },
      {
        heading: "Public news and press releases",
        body: [
          "For contextual color we reference public news coverage and government press releases, cited where used. We do not republish copyrighted journalism verbatim.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact",
    subtitle: "The quickest way to reach a human.",
    icon: Mail,
    accent: "var(--green)",
    updated: "April 2026",
    sections: [
      {
        heading: "General",
        body: ["hello@legaldrama.ai — product questions, press, partnerships."],
      },
      {
        heading: "Privacy & data requests",
        body: ["privacy@legaldrama.ai — export, deletion, GDPR/CCPA requests."],
      },
      {
        heading: "Abuse & safety",
        body: ["abuse@legaldrama.ai — policy violations, harassment, safety issues."],
      },
      {
        heading: "Copyright",
        body: ["dmca@legaldrama.ai — DMCA notices and counter-notices."],
      },
      {
        heading: "Security",
        body: ["security@legaldrama.ai — responsible disclosure and vulnerability reports."],
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = LEGAL_DOCS[slug]
  if (!doc) return { title: "Legal — LegalDrama.ai" }
  return {
    title: `${doc.title} — LegalDrama.ai`,
    description: doc.subtitle,
  }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = LEGAL_DOCS[slug]
  if (!doc) notFound()

  const Icon = doc.icon

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* Mini-nav */}
      <header
        className="border-b-[2.5px] border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface)]"
      >
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-0.5 group">
            <span className="font-sans text-lg font-extrabold text-[var(--foreground)] transition-colors group-hover:text-[var(--red)]">
              legal
            </span>
            <span className="font-sans text-lg font-extrabold text-[var(--red)]">
              drama
            </span>
            <span className="font-mono text-xs text-[var(--pink)]">.ai</span>
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back to app
          </Link>
        </div>
      </header>

      {/* Document */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-10">
        {/* Title card */}
        <div
          className="border p-5 mb-8"
          style={{
            borderColor: doc.accent,
            background: `color-mix(in srgb, ${doc.accent} 6%, transparent)`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center border"
              style={{
                borderColor: doc.accent,
                background: `color-mix(in srgb, ${doc.accent} 15%, transparent)`,
                color: doc.accent,
              }}
            >
              <Icon size={18} />
            </div>
            <div>
              <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-[var(--foreground)]">
                {doc.title}
              </h1>
              <p className="mt-1 font-serif text-sm text-[var(--muted-foreground)]">
                {doc.subtitle}
              </p>
              <p
                className="mt-2 font-mono text-[10px] tracking-wider"
                style={{ color: doc.accent }}
              >
                LAST UPDATED — {doc.updated.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <article className="space-y-6">
          {doc.sections.map((section, i) => (
            <section
              key={i}
              className="border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <h2 className="font-sans text-lg font-bold text-[var(--foreground)] mb-3">
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.body.map((para, j) => (
                  <p
                    key={j}
                    className="font-serif text-[14px] leading-relaxed text-[var(--muted-foreground)]"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* Alpha notice */}
        <div className="mt-8 border border-dashed border-[var(--amber)]/50 bg-[var(--amber)]/5 p-4">
          <p className="font-mono text-[11px] text-[var(--foreground)]">
            <span className="font-bold text-[var(--amber)]">ALPHA NOTICE —</span>{" "}
            This document is a placeholder for the LegalDrama.ai public alpha and
            will be superseded by counsel-reviewed copy before general availability.
            For questions, email{" "}
            <a
              href="mailto:hello@legaldrama.ai"
              className="underline hover:text-[var(--amber)]"
            >
              hello@legaldrama.ai
            </a>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
