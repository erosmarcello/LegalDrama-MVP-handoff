"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Moon, Sun, Search, Bookmark, Settings, X, Check,
  SlidersHorizontal, ChevronDown, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { Masthead } from "@/components/masthead"

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const FEDERAL_COURTS = [
  "S.D.N.Y.", "E.D.N.Y.", "C.D. Cal.", "N.D. Ill.", "D. Mass.",
  "N.D. Cal.", "S.D. Fla.", "W.D. Tex.", "E.D. Va.", "D.D.C.",
  "S.D. Cal.", "N.D. Tex.", "D. Md.", "E.D. Pa.", "W.D. Wash.",
]

const BOOKMARKED_CASES = [
  { id: "1", label: "indav", caseName: "Miranda Tecnologia de la Informacion S.C. v. Endava Inc. et al", docket: "1:26-cv-02472-AT", court: "S.D.N.Y.", slug: "miranda-v-endava" },
  { id: "2", label: "test", caseName: "USA v. Mangione", docket: "1:25-cr-00176-MMG-1", court: "S.D.N.Y.", slug: "mangione" },
  { id: "3", label: "self-cut", caseName: "Estores v. The Partnerships and Unincorporated Associations Identified in Schedule A", docket: "1:25-cv-06151", court: "N.D. Ill.", slug: "estores-v-partnerships" },
  { id: "4", label: "Ehheh", caseName: "Delgado v. Donald J. Trump For President, Inc. et al", docket: "1:19-cv-11764-AT-KHP", court: "S.D.N.Y.", slug: "delgado-v-trump" },
  { id: "5", label: "mhsubappeal", caseName: "LegalForce RAPC Worldwide, PC v. MH Sub I, LLC", docket: "26-00023", court: "9th Cir.", slug: "legalforce-v-mhsub" },
  { id: "6", label: "fas", caseName: "MANDO INTERNATIONAL, LLC v. AIDP, INC et al (closed 02/25/2026)", docket: "3:25-cv-10682-TLT", court: "N.D. Cal.", slug: "mando-v-aidp", closed: true },
  { id: "7", label: "nd", caseName: "LegalForce RAPC Worldwide P.C. et al v. United States Patent & Trademark Office", docket: "5:25-cv-09010-PCP", court: "N.D. Cal.", slug: "legalforce-v-uspto" },
  { id: "8", label: "nd", caseName: "Legalforce RAPC Worldwide PC v. US Patent & Trademark Office", docket: "25-02089", court: "4th Cir.", slug: "legalforce-v-uspto-appeal" },
] as const

/* ------------------------------------------------------------------ */
/*  COURT TYPE BADGE                                                   */
/* ------------------------------------------------------------------ */

function CourtTypeBadge({ court }: { court: string }) {
  const isCircuit = court.includes("Cir.")
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0",
        "px-1.5 py-0.5 font-mono text-[9px] font-extrabold leading-none",
        "border-[2px]",
        isCircuit
          ? "bg-[var(--purple)] text-white border-[var(--purple)]"
          : "bg-[var(--red)] text-white border-[var(--red)]"
      )}
    >
      {isCircuit ? "CIR" : "DIST"}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  COURT SELECTOR DROPDOWN                                            */
/* ------------------------------------------------------------------ */

function CourtSelector({ onSelect }: { onSelect: (court: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState("")

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = () => setIsOpen(false)
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full max-w-xs px-3 py-2 flex items-center justify-between gap-2",
          "border-[2.5px] border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]",
          "font-mono text-xs",
          "shadow-[2px_2px_0px_var(--shadow-color)] brut-press",
          "transition-colors",
          isOpen && "border-[var(--cyan)]"
        )}
      >
        <span className={cn(!selected && "text-[var(--muted-foreground)]")}>
          {selected || "Select a court..."}
        </span>
        <ChevronDown
          size={14}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-1 w-full max-w-xs",
            "border-[2.5px] border-[var(--border)] bg-[var(--card)]",
            "shadow-[4px_4px_0px_var(--shadow-color)]",
            "max-h-60 overflow-y-auto"
          )}
        >
          {FEDERAL_COURTS.map((court) => (
            <button
              key={court}
              type="button"
              onClick={() => {
                setSelected(court)
                setIsOpen(false)
                onSelect(court)
              }}
              className={cn(
                "w-full px-3 py-2 text-left",
                "font-mono text-xs",
                "transition-colors",
                court === selected
                  ? "bg-[var(--cyan)] text-white"
                  : "text-[var(--foreground)] hover:bg-[var(--selection)]"
              )}
            >
              {court}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CHECKBOX                                                           */
/* ------------------------------------------------------------------ */

function BrutCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "w-5 h-5 shrink-0 flex items-center justify-center",
        "border-[2.5px] border-[var(--border)] bg-[var(--background)]",
        "transition-colors brut-press",
        checked && "bg-[var(--cyan)] border-[var(--cyan)]"
      )}
    >
      {checked && <Check size={12} strokeWidth={3} className="text-white" />}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD CONTENT                                                  */
/* ------------------------------------------------------------------ */

function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [user] = useState({ email: "user@legaldrama.ai", name: "Raj" })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCourtSelect = (court: string) => {
    toast(`Searching ${court}...`, "var(--cyan)")
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* NAV */}
      <Masthead user={user} onSignOut={() => router.push("/")} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">

        {/* ============================================================ */}
        {/*  FIND A NEW CASE                                              */}
        {/* ============================================================ */}
        <section className="mb-10">
          <h2 className="font-sans text-lg font-extrabold text-[var(--foreground)] mb-3">
            Find a new case to bookmark
          </h2>
          <div>
            <label className="font-mono text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">
              Courts
            </label>
            <CourtSelector onSelect={handleCourtSelect} />
          </div>
        </section>

        {/* ============================================================ */}
        {/*  BOOKMARKED CASES TABLE                                       */}
        {/* ============================================================ */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-lg font-extrabold text-[var(--foreground)]">
              My Bookmarked legal dramas
            </h2>
            {selectedIds.size > 0 && (
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <div
            className={cn(
              "border-[2.5px] border-[var(--border)] bg-[var(--card)]",
              "shadow-[4px_4px_0px_var(--shadow-color)]"
            )}
          >
            {BOOKMARKED_CASES.map((caseItem, i) => {
              const isClosed = "closed" in caseItem && caseItem.closed
              return (
                <div
                  key={caseItem.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    "transition-colors hover:bg-[var(--selection)]",
                    i < BOOKMARKED_CASES.length - 1 && "border-b border-[var(--border)]",
                    isClosed && "opacity-60"
                  )}
                >
                  {/* Checkbox */}
                  <BrutCheckbox
                    checked={selectedIds.has(caseItem.id)}
                    onChange={() => toggleSelect(caseItem.id)}
                  />

                  {/* Label tag */}
                  <span
                    className={cn(
                      "font-mono text-[10px] text-[var(--muted-foreground)]",
                      "shrink-0 w-20 truncate"
                    )}
                    title={caseItem.label}
                  >
                    {caseItem.label}
                  </span>

                  {/* Court type badge */}
                  <CourtTypeBadge court={caseItem.court} />

                  {/* Case name + docket */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/case/${caseItem.slug}`}
                      className={cn(
                        "font-sans text-sm font-bold leading-tight",
                        "transition-colors hover:underline",
                        isClosed
                          ? "text-[var(--muted-foreground)]"
                          : "text-[var(--cyan)]"
                      )}
                    >
                      <span className="line-clamp-1">{caseItem.caseName}</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        {caseItem.docket}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        &middot;
                      </span>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        {caseItem.court}
                      </span>
                      {isClosed && (
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0.5",
                            "font-mono text-[8px] font-extrabold uppercase",
                            "border-[2px] border-[var(--muted-foreground)] text-[var(--muted-foreground)]"
                          )}
                        >
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bookmark icon (filled) */}
                  <button
                    className={cn(
                      "p-1.5 shrink-0",
                      "text-[var(--cyan)] hover:text-[var(--amber)]",
                      "transition-colors"
                    )}
                    title="Bookmarked"
                  >
                    <Bookmark size={16} fill="currentColor" />
                  </button>

                  {/* Settings icon */}
                  <button
                    className={cn(
                      "p-1.5 shrink-0",
                      "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                      "transition-colors"
                    )}
                    title="Case settings"
                    onClick={() => toast("Settings opened", "var(--purple)")}
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  REFERENCE FILES                                              */}
        {/* ============================================================ */}
        <section className="mb-10">
          <button
            className={cn(
              "flex items-center gap-3 px-5 py-4 w-full",
              "border-[2.5px] border-[var(--border)] bg-[var(--card)]",
              "shadow-[4px_4px_0px_var(--shadow-color)]",
              "brut-lift transition-all",
              "hover:border-[var(--amber)]"
            )}
            onClick={() => toast("Reference Files coming soon", "var(--amber)")}
          >
            <FileText size={18} className="text-[var(--amber)] shrink-0" />
            <span className="font-sans text-sm font-bold text-[var(--foreground)]">
              Reference Files
            </span>
            <span className="font-mono text-[10px] text-[var(--muted-foreground)] ml-auto">
              Upload &amp; manage
            </span>
          </button>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="px-5 py-4 border-t-[2.5px] border-[var(--border)] bg-[var(--surface)] mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-mono text-[8px] text-[var(--muted-foreground)] tracking-wider">
            LegalDrama.AI MVP Rev V2.0
          </div>
          <div className="font-mono text-[8px] text-[var(--muted-foreground)]">
            Design: Eros M. Iuliano | Product: Trademarkia/PatentVC
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PAGE EXPORT                                                        */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}
