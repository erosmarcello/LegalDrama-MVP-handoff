"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bookmark,
  Check,
  SlidersHorizontal,
  ChevronDown,
  FileText,
  Folder,
  Archive,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { Masthead } from "@/components/masthead"
import { SiteFooter, AiDisclaimerBar } from "@/components/site-footer"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const FEDERAL_COURTS = [
  "S.D.N.Y.", "E.D.N.Y.", "C.D. Cal.", "N.D. Ill.", "D. Mass.",
  "N.D. Cal.", "S.D. Fla.", "W.D. Tex.", "E.D. Va.", "D.D.C.",
  "S.D. Cal.", "N.D. Tex.", "D. Md.", "E.D. Pa.", "W.D. Wash.",
]

interface BookmarkedCase {
  id: string
  label: string
  caseName: string
  docket: string
  court: string
  slug: string
  closed?: boolean
  lane: "govt" | "defense" | "court"
}

const BOOKMARKED_CASES: BookmarkedCase[] = [
  { id: "1", label: "indav", caseName: "Miranda Tecnologia de la Informacion S.C. v. Endava Inc. et al", docket: "1:26-cv-02472-AT", court: "S.D.N.Y.", slug: "miranda-v-endava", lane: "defense" },
  { id: "2", label: "test", caseName: "USA v. Mangione", docket: "1:25-cr-00176-MMG-1", court: "S.D.N.Y.", slug: "mangione", lane: "govt" },
  { id: "3", label: "self-cut", caseName: "Estores v. The Partnerships and Unincorporated Associations Identified in Schedule A", docket: "1:25-cv-06151", court: "N.D. Ill.", slug: "estores-v-partnerships", lane: "defense" },
  { id: "4", label: "Ehheh", caseName: "Delgado v. Donald J. Trump For President, Inc. et al", docket: "1:19-cv-11764-AT-KHP", court: "S.D.N.Y.", slug: "delgado-v-trump", lane: "defense" },
  { id: "5", label: "mhsubappeal", caseName: "LegalForce RAPC Worldwide, PC v. MH Sub I, LLC", docket: "26-00023", court: "9th Cir.", slug: "legalforce-v-mhsub", lane: "court" },
  { id: "6", label: "fas", caseName: "MANDO INTERNATIONAL, LLC v. AIDP, INC et al", docket: "3:25-cv-10682-TLT", court: "N.D. Cal.", slug: "mando-v-aidp", closed: true, lane: "defense" },
  { id: "7", label: "nd", caseName: "LegalForce RAPC Worldwide P.C. et al v. USPTO", docket: "5:25-cv-09010-PCP", court: "N.D. Cal.", slug: "legalforce-v-uspto", lane: "govt" },
  { id: "8", label: "nd", caseName: "Legalforce RAPC Worldwide PC v. US Patent & Trademark Office", docket: "25-02089", court: "4th Cir.", slug: "legalforce-v-uspto-appeal", lane: "court" },
]

function laneColor(lane: BookmarkedCase["lane"]) {
  switch (lane) {
    case "govt":
      return "var(--red)"
    case "defense":
      return "var(--gold)"
    case "court":
    default:
      return "#ffffff"
  }
}

function laneLabel(lane: BookmarkedCase["lane"]) {
  switch (lane) {
    case "govt":
      return "GOVT"
    case "defense":
      return "DEFENSE"
    case "court":
    default:
      return "COURT"
  }
}

/* ------------------------------------------------------------------ */
/*  COURT SELECTOR DROPDOWN (noir)                                     */
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
    <div className="relative" onMouseDown={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full max-w-[320px] px-4 py-3 flex items-center justify-between gap-3",
          "border bg-[#0a0a0a] transition-colors",
          isOpen
            ? "border-[var(--gold)]"
            : "border-[var(--border)] hover:border-[var(--gold)]"
        )}
      >
        <span
          className={cn(
            "cinema-label text-[11px]",
            selected ? "text-white" : "text-[var(--muted-foreground)]"
          )}
        >
          {selected || "Select a district…"}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform text-[var(--gold)]",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 z-50 mt-1 w-full max-w-[320px]",
            "border border-[var(--gold)] bg-[#141414]",
            "max-h-[280px] overflow-y-auto"
          )}
        >
          {FEDERAL_COURTS.map(court => (
            <button
              key={court}
              type="button"
              onClick={() => {
                setSelected(court)
                setIsOpen(false)
                onSelect(court)
              }}
              className={cn(
                "w-full px-4 py-2.5 text-left cinema-label text-[10px]",
                "border-b border-[var(--border)] last:border-b-0 transition-colors",
                court === selected
                  ? "bg-[var(--gold)] text-[#0a0a0a]"
                  : "text-[var(--muted-foreground)] hover:bg-[#1e1d1b] hover:text-white"
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

function NoirCheckbox({
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
        "w-4 h-4 shrink-0 flex items-center justify-center",
        "border transition-colors",
        checked
          ? "bg-[var(--gold)] border-[var(--gold)]"
          : "bg-transparent border-[var(--border)] hover:border-[var(--gold)]"
      )}
    >
      {checked && <Check size={10} strokeWidth={3} className="text-[#0a0a0a]" />}
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
  const { user, signIn, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [laneFilter, setLaneFilter] = useState<"all" | BookmarkedCase["lane"]>("all")
  const [showClosed, setShowClosed] = useState(true)

  // First-name greeting fallback. Dashboard is post-auth so we prompt them
  // to sign in if they land here cold.
  const greetingName = user?.name?.split(" ")[0] || "counselor"

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
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
    toast(`Searching ${court}…`, "var(--gold)")
  }

  const filteredCases = useMemo(() => {
    let results = BOOKMARKED_CASES
    if (laneFilter !== "all") {
      results = results.filter(c => c.lane === laneFilter)
    }
    if (!showClosed) {
      results = results.filter(c => !c.closed)
    }
    return results
  }, [laneFilter, showClosed])

  const stats = useMemo(() => {
    const total = BOOKMARKED_CASES.length
    const live = BOOKMARKED_CASES.filter(c => !c.closed).length
    const govt = BOOKMARKED_CASES.filter(c => c.lane === "govt").length
    const defense = BOOKMARKED_CASES.filter(c => c.lane === "defense").length
    return { total, live, govt, defense }
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">
      <Masthead
        user={user}
        onSignIn={() => setAuthOpen(true)}
        onSignOut={() => {
          signOut()
          toast("Signed out of chambers", "var(--muted-foreground)")
          router.push("/")
        }}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={(u) => {
          signIn(u)
          setAuthOpen(false)
          toast(`Welcome back, ${u.name.split(" ")[0] || "counselor"}`, "var(--gold)")
        }}
      />

      {/* ─── Archive hero ─── */}
      <section className="relative border-b border-[var(--border)] cinema-grain">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 75% 35%, rgba(179,163,105,0.12), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-14">
          <div className="flex items-center gap-3 mb-3">
            <Archive size={14} className="text-[var(--gold)]" />
            <span className="cinema-contract text-[11px] text-[var(--gold)]">
              Discovery Archive · Personal Vault
            </span>
          </div>
          <h1
            className="cinema-title text-[40px] md:text-[60px] lg:text-[72px] leading-[0.92] text-white"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Welcome Back,{" "}
            <span style={{ color: "var(--gold)" }}>{greetingName}</span>.
          </h1>
          <p className="mt-4 font-sans text-[14px] md:text-[15px] leading-relaxed text-[var(--muted-foreground)] max-w-[58ch]">
            Your archive of bookmarked cases, saved searches, and reference files.
            Everything synced from PACER, staged for your next draft.
          </p>

          {/* Stat row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile label="Bookmarked" value={String(stats.total)} />
            <StatTile label="Active Trials" value={String(stats.live)} accent="var(--red)" />
            <StatTile label="Govt Lane" value={String(stats.govt)} accent="var(--red)" />
            <StatTile label="Defense Lane" value={String(stats.defense)} accent="var(--gold)" />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-5 md:px-8 py-10 md:py-12">
        {/* ============================================================ */}
        {/*  FIND A NEW CASE                                              */}
        {/* ============================================================ */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <div className="cinema-contract text-[11px] text-[var(--gold)] mb-1">
                § Case Intake
              </div>
              <h2 className="cinema-title text-[28px] md:text-[36px] leading-[0.95] text-white">
                Bookmark A New Case
              </h2>
            </div>
            <Link
              href="/browse"
              className="cinema-label text-[10px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-2"
            >
              Full Catalog <ArrowRight size={12} />
            </Link>
          </div>

          <div className="border border-[var(--border)] bg-[#141414] p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-8 items-end">
              <div>
                <div className="cinema-label text-[9px] text-[var(--gold)] mb-2">
                  Federal District
                </div>
                <CourtSelector onSelect={handleCourtSelect} />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/browse"
                  className="h-10 px-5 border border-[var(--border)] cinema-label text-[10px] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={12} /> Search By Case №
                </Link>
                <Link
                  href="/browse"
                  className="h-10 px-5 border border-[var(--border)] cinema-label text-[10px] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={12} /> Search By Name
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  BOOKMARKED CASES                                             */}
        {/* ============================================================ */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <div className="cinema-contract text-[11px] text-[var(--gold)] mb-1">
                § Bookmarked Legal Dramas
              </div>
              <h2 className="cinema-title text-[28px] md:text-[36px] leading-[0.95] text-white">
                {filteredCases.length} Cases Tracked
              </h2>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="cinema-label text-[10px] text-[var(--muted-foreground)]">
                  {selectedIds.size} selected
                </span>
                <button
                  className="h-9 px-4 border border-[var(--red)] text-[var(--red)] cinema-label text-[10px] hover:bg-[var(--red)] hover:text-white transition-colors inline-flex items-center gap-2"
                  onClick={() => {
                    toast(`Removed ${selectedIds.size} bookmark${selectedIds.size > 1 ? "s" : ""}`, "var(--red)")
                    setSelectedIds(new Set())
                  }}
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="cinema-contract text-[10px] text-[var(--gold)] mr-1">
              Filter ·
            </span>
            {(
              [
                { key: "all", label: "All Lanes" },
                { key: "govt", label: "Government" },
                { key: "defense", label: "Defense" },
                { key: "court", label: "Court" },
              ] as const
            ).map(f => {
              const active = laneFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setLaneFilter(f.key)}
                  className={cn(
                    "cinema-label text-[9px] px-3 py-1.5 border transition-colors",
                    active
                      ? "bg-white text-[#0a0a0a] border-white"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              )
            })}
            <span className="w-px h-5 bg-[var(--border)] mx-1" />
            <button
              onClick={() => setShowClosed(v => !v)}
              className={cn(
                "cinema-label text-[9px] px-3 py-1.5 border transition-colors inline-flex items-center gap-2",
                showClosed
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-white"
              )}
            >
              <NoirCheckbox checked={showClosed} onChange={() => {}} />
              Show Closed
            </button>
          </div>

          {/* Case list */}
          <div className="border border-[var(--border)] bg-[#141414]">
            {filteredCases.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <Bookmark
                  size={32}
                  strokeWidth={1}
                  className="mx-auto mb-3 text-[var(--muted-foreground)]"
                />
                <p className="cinema-title text-[18px] text-white">
                  No cases match these filters.
                </p>
                <p className="mt-2 font-sans text-[12px] text-[var(--muted-foreground)]">
                  Adjust the filter chips above or browse the catalog.
                </p>
              </div>
            ) : (
              filteredCases.map((caseItem, i) => {
                const isClosed = caseItem.closed
                const accent = laneColor(caseItem.lane)
                return (
                  <div
                    key={caseItem.id}
                    className={cn(
                      "group flex items-center gap-4 px-4 md:px-5 py-4 transition-colors",
                      "hover:bg-[#1a1a1a]",
                      i < filteredCases.length - 1 && "border-b border-[var(--border)]",
                      isClosed && "opacity-55"
                    )}
                    style={{ borderLeft: `2px solid ${accent}` }}
                  >
                    <NoirCheckbox
                      checked={selectedIds.has(caseItem.id)}
                      onChange={() => toggleSelect(caseItem.id)}
                    />

                    <span
                      className="cinema-label text-[9px]"
                      style={{ color: accent }}
                    >
                      {laneLabel(caseItem.lane)}
                    </span>

                    <span
                      className="cinema-contract text-[10px] text-[var(--muted-foreground)] shrink-0 w-20 truncate hidden sm:inline"
                      title={caseItem.label}
                    >
                      “{caseItem.label}”
                    </span>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/case/${caseItem.slug}`}
                        className="block font-sans text-[13px] font-medium text-white group-hover:text-[var(--gold)] transition-colors leading-tight"
                      >
                        <span className="line-clamp-1">{caseItem.caseName}</span>
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="cinema-contract text-[9px] text-[var(--gold)]">
                          {caseItem.docket}
                        </span>
                        <span className="cinema-label text-[8px] text-[var(--muted-foreground)]">
                          {caseItem.court}
                        </span>
                        {isClosed && (
                          <span className="cinema-label text-[8px] text-[var(--muted-foreground)] border border-[var(--border)] px-1.5 py-0.5">
                            Closed
                          </span>
                        )}
                        {!isClosed && (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5"
                              style={{ background: "var(--red)" }}
                              aria-hidden
                            />
                            <span className="cinema-label text-[8px] text-[var(--red)]">
                              Live
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Bookmark
                      size={14}
                      fill="currentColor"
                      className="text-[var(--gold)] shrink-0 hidden md:block"
                    />

                    <button
                      className="p-1.5 shrink-0 text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
                      onClick={() => toast("Case settings opened", "var(--gold)")}
                      title="Case settings"
                    >
                      <SlidersHorizontal size={14} />
                    </button>

                    <Link
                      href={`/case/${caseItem.slug}`}
                      className="p-1.5 shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  REFERENCE FILES                                              */}
        {/* ============================================================ */}
        <section>
          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <div className="cinema-contract text-[11px] text-[var(--gold)] mb-1">
                § Reference Files
              </div>
              <h2 className="cinema-title text-[28px] md:text-[36px] leading-[0.95] text-white">
                Your Vault
              </h2>
            </div>
          </div>

          <button
            onClick={() => toast("Reference Files coming soon", "var(--gold)")}
            className="w-full border border-[var(--border)] bg-[#141414] hover:border-[var(--gold)] transition-colors p-6 flex items-center gap-4 text-left"
            style={{ borderLeft: "2px solid var(--gold)" }}
          >
            <FileText size={20} className="text-[var(--gold)] shrink-0" />
            <div className="flex-1">
              <div className="cinema-title text-[20px] text-white leading-none">
                Reference Files
              </div>
              <p className="mt-1.5 font-sans text-[12px] text-[var(--muted-foreground)]">
                Upload scripts, photos, and research — pin to any case workspace.
              </p>
            </div>
            <Folder size={16} className="text-[var(--muted-foreground)] shrink-0" />
            <ArrowRight size={14} className="text-[var(--gold)] shrink-0" />
          </button>
        </section>
      </main>

      <AiDisclaimerBar />
      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Tile                                                          */
/* ------------------------------------------------------------------ */

function StatTile({
  label,
  value,
  accent = "#ffffff",
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div
      className="border border-[var(--border)] bg-[#141414] p-4"
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div
        className="cinema-title text-[36px] leading-none"
        style={{ color: accent, textShadow: "1px 1px 0 #000" }}
      >
        {value}
      </div>
      <div className="mt-2 cinema-contract text-[10px] text-[var(--muted-foreground)]">
        {label}
      </div>
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
