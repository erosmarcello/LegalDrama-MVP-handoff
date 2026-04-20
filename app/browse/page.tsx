"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Gavel,
  BookOpen,
  Filter,
  ArrowRight,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"

/* ------------------------------------------------------------------ */
/*  Featured Cases Data                                                */
/* ------------------------------------------------------------------ */

interface FeaturedCase {
  id: string
  slug: string
  title: string
  court: string
  caseNumber: string
  description: string
  publisher: string
  lane: "govt" | "defense" | "court"
  status: "live" | "closed" | "appeal"
  year: string
  reels: number
}

const FEATURED_CASES: FeaturedCase[] = [
  {
    id: "1",
    slug: "mangione",
    title: "USA v. Luigi Mangione",
    court: "S.D.N.Y.",
    caseNumber: "1:25-CR-00176-MMG",
    description:
      "The high-profile federal case against Luigi Mangione, charged in connection with the fatal shooting of UnitedHealthcare CEO Brian Thompson in December 2024. The case sparked a national debate on healthcare industry accountability.",
    publisher: "legaldrama_team",
    lane: "govt",
    status: "live",
    year: "2025",
    reels: 4,
  },
  {
    id: "2",
    slug: "terraform-labs",
    title: "SEC v. Terraform Labs",
    court: "S.D.N.Y.",
    caseNumber: "1:23-CV-01346",
    description:
      "The SEC brought charges against Terraform Labs and its founder Do Kwon for orchestrating a multi-billion dollar crypto securities fraud involving the collapse of TerraUSD and Luna tokens.",
    publisher: "crypto_law",
    lane: "govt",
    status: "live",
    year: "2023",
    reels: 6,
  },
  {
    id: "3",
    slug: "apple-v-epic",
    title: "Apple Inc. v. Epic Games",
    court: "N.D. Cal.",
    caseNumber: "4:20-CV-05640",
    description:
      "A landmark antitrust battle over Apple's App Store policies and the 30% commission fee. Epic Games challenged Apple's monopoly on iOS app distribution after Fortnite was removed.",
    publisher: "tech_counsel",
    lane: "defense",
    status: "appeal",
    year: "2020",
    reels: 8,
  },
  {
    id: "4",
    slug: "elizabeth-holmes",
    title: "USA v. Elizabeth Holmes",
    court: "N.D. Cal.",
    caseNumber: "5:18-CR-00258",
    description:
      "The federal fraud trial of Theranos founder Elizabeth Holmes, who was convicted of defrauding investors with false claims about her company's blood-testing technology capabilities.",
    publisher: "biotech_watch",
    lane: "govt",
    status: "closed",
    year: "2018",
    reels: 5,
  },
  {
    id: "5",
    slug: "google-v-oracle",
    title: "Google LLC v. Oracle America",
    court: "U.S. Supreme Court",
    caseNumber: "3:10-CV-03561",
    description:
      "A decade-long Supreme Court copyright dispute over Google's use of Java APIs in the Android operating system. The ruling established key precedents for software fair use doctrine.",
    publisher: "scotus_digest",
    lane: "court",
    status: "closed",
    year: "2010",
    reels: 10,
  },
  {
    id: "6",
    slug: "sam-bankman-fried",
    title: "USA v. Sam Bankman-Fried",
    court: "S.D.N.Y.",
    caseNumber: "1:23-CR-00334",
    description:
      "The criminal prosecution of FTX founder Sam Bankman-Fried on charges of fraud, conspiracy, and money laundering tied to the collapse of the cryptocurrency exchange.",
    publisher: "finlaw_daily",
    lane: "govt",
    status: "closed",
    year: "2023",
    reels: 7,
  },
  {
    id: "7",
    slug: "twitter-v-musk",
    title: "Twitter v. Elon Musk",
    court: "Del. Ch.",
    caseNumber: "2022-0613-KSJM",
    description:
      "Twitter sued Elon Musk in Delaware Chancery Court to enforce the $44 billion acquisition agreement after Musk attempted to withdraw from the deal citing bot account concerns.",
    publisher: "deal_watch",
    lane: "defense",
    status: "closed",
    year: "2022",
    reels: 4,
  },
  {
    id: "8",
    slug: "dominion-v-fox",
    title: "Dominion v. Fox News",
    court: "D. Del.",
    caseNumber: "1:21-CV-00525",
    description:
      "Dominion Voting Systems filed a $1.6 billion defamation lawsuit against Fox News for broadcasting false claims about election fraud involving its voting machines after the 2020 election.",
    publisher: "media_law",
    lane: "defense",
    status: "closed",
    year: "2021",
    reels: 6,
  },
  {
    id: "9",
    slug: "r-kelly",
    title: "USA v. R. Kelly",
    court: "E.D.N.Y.",
    caseNumber: "1:19-CR-00286",
    description:
      "The federal racketeering and sex trafficking prosecution of R&B singer R. Kelly, resulting in conviction on all counts and a landmark sentence for decades of abuse.",
    publisher: "justice_report",
    lane: "govt",
    status: "closed",
    year: "2019",
    reels: 5,
  },
  {
    id: "10",
    slug: "obergefell-v-hodges",
    title: "Obergefell v. Hodges",
    court: "U.S. Supreme Court",
    caseNumber: "14-556",
    description:
      "The landmark Supreme Court decision establishing the constitutional right to same-sex marriage under the Fourteenth Amendment, transforming civil rights law nationwide.",
    publisher: "civil_rights_law",
    lane: "court",
    status: "closed",
    year: "2015",
    reels: 3,
  },
]

const LANE_FILTERS = [
  { key: "all", label: "All Lanes", accent: "#ffffff" },
  { key: "govt", label: "Government", accent: "var(--red)" },
  { key: "defense", label: "Defense", accent: "var(--gold)" },
  { key: "court", label: "Court", accent: "#ffffff" },
] as const

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "appeal", label: "Appeal" },
  { key: "closed", label: "Closed" },
] as const

function laneColor(lane: FeaturedCase["lane"]) {
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

function laneLabel(lane: FeaturedCase["lane"]) {
  switch (lane) {
    case "govt":
      return "▲ GOVT"
    case "defense":
      return "◆ DEFENSE"
    case "court":
    default:
      return "● COURT"
  }
}

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="border border-[var(--border)] bg-[#141414] animate-pulse">
      <div className="h-[200px] bg-[#1a1a1a]" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-[#1a1a1a] w-3/4" />
        <div className="h-3 bg-[#1a1a1a] w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-[#1a1a1a] w-full" />
          <div className="h-3 bg-[#1a1a1a] w-5/6" />
        </div>
        <div className="h-3 bg-[#1a1a1a] w-1/2" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Browse Content (inner, needs ToastProvider ancestor)                */
/* ------------------------------------------------------------------ */

function BrowseContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [laneFilter, setLaneFilter] = useState<typeof LANE_FILTERS[number]["key"]>("all")
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]["key"]>("all")
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const { toast } = useToast()

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredCases = useMemo(() => {
    let results = FEATURED_CASES

    if (laneFilter !== "all") {
      results = results.filter(c => c.lane === laneFilter)
    }
    if (statusFilter !== "all") {
      results = results.filter(c => c.status === statusFilter)
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase()
      results = results.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.court.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.publisher.toLowerCase().includes(q) ||
          c.caseNumber.toLowerCase().includes(q)
      )
    }

    return results
  }, [debouncedQuery, laneFilter, statusFilter])

  const activeFilterCount =
    (laneFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Masthead
        user={user}
        onSignIn={() => toast("Sign in coming soon", "var(--gold)")}
        onSignOut={() => setUser(null)}
        showSearch
        searchPlaceholder="Case name, number, or keyword"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ─── Marquee header ─── */}
      <section className="relative border-b border-[var(--border)] cinema-grain">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 40%, rgba(179,163,105,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 20% 60%, rgba(204,24,24,0.12), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="cinema-pulse-dot" aria-hidden />
            <span className="cinema-contract text-[12px] text-[var(--gold)]">
              Active Trials · PACER Synced · {FEATURED_CASES.length} Features
            </span>
          </div>
          <h1
            className="cinema-title text-[48px] md:text-[72px] lg:text-[92px] leading-[0.92] text-white"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Browse The{" "}
            <span style={{ color: "var(--red)" }}>Docket</span>.
            <br />
            Pick Your{" "}
            <span style={{ color: "var(--gold)" }}>Next Script</span>.
          </h1>
          <p className="mt-5 font-sans text-[14px] md:text-[16px] leading-relaxed text-[var(--muted-foreground)] max-w-[62ch]">
            Every case is a public record lifted from federal court. Filter by
            lane, status, or era. Open a file to see the AI-generated scene
            breakdown, mood board, and timeline.
          </p>
        </div>
      </section>

      {/* ─── Filter rail ─── */}
      <section className="relative border-b border-[var(--border)] bg-[#0a0a0a] sticky top-14 z-40 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Filter size={13} className="text-[var(--gold)]" />
            <span className="cinema-label text-[9px] text-[var(--gold)]">
              Filter
            </span>
            {activeFilterCount > 0 && (
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                · {activeFilterCount} active
              </span>
            )}
          </div>

          {/* Lane chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {LANE_FILTERS.map(f => {
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
                  style={active && f.key !== "all" ? { background: f.accent, borderColor: f.accent } : undefined}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <span className="hidden md:inline-block w-px h-5 bg-[var(--border)]" />

          {/* Status chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => {
              const active = statusFilter === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={cn(
                    "cinema-label text-[9px] px-3 py-1.5 border transition-colors inline-flex items-center gap-1.5",
                    active
                      ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/10"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold)] hover:text-white"
                  )}
                >
                  {f.key === "live" && (
                    <span className="cinema-pulse-dot" aria-hidden />
                  )}
                  {f.label}
                </button>
              )
            })}
          </div>

          {(activeFilterCount > 0 || searchQuery) && (
            <button
              onClick={() => {
                setLaneFilter("all")
                setStatusFilter("all")
                setSearchQuery("")
              }}
              className="ml-auto cinema-label text-[9px] text-[var(--muted-foreground)] hover:text-[var(--red)] transition-colors inline-flex items-center gap-1.5"
            >
              <X size={11} /> Reset
            </button>
          )}
        </div>
      </section>

      {/* ─── Results ─── */}
      <main className="relative flex-1 cinema-grain">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="cinema-label text-[9px] text-[var(--gold)] mb-1">
                § Case Catalog
              </div>
              <h2 className="cinema-title text-[24px] md:text-[32px] leading-[0.95] text-white">
                {isLoading ? "Loading…" : `${filteredCases.length} Cases`}
                {debouncedQuery && (
                  <span className="text-[var(--muted-foreground)]">
                    {" "}
                    · “{debouncedQuery}”
                  </span>
                )}
              </h2>
            </div>
            <span className="cinema-label text-[9px] text-[var(--muted-foreground)] hidden sm:inline">
              Sorted · Most Recent Docket Activity
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="border border-[var(--border)] bg-[#141414] py-20 px-6 text-center">
              <BookOpen
                size={40}
                className="mx-auto mb-4 text-[var(--muted-foreground)]"
                strokeWidth={1}
              />
              <p className="cinema-title text-[22px] text-white mb-2">
                No Matches On The Docket
              </p>
              <p className="font-sans text-[13px] text-[var(--muted-foreground)] max-w-[40ch] mx-auto">
                Try different keywords or reset filters to browse every
                featured case.
              </p>
              <button
                onClick={() => {
                  setLaneFilter("all")
                  setStatusFilter("all")
                  setSearchQuery("")
                }}
                className="mt-6 h-9 px-5 bg-white text-[#0a0a0a] cinema-label text-[10px] hover:bg-[var(--gold)] transition-colors inline-flex items-center gap-2"
              >
                Reset Everything
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCases.map(caseItem => (
                <PosterCard key={caseItem.id} data={caseItem} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Poster Card                                                        */
/* ------------------------------------------------------------------ */

function PosterCard({ data }: { data: FeaturedCase }) {
  const accent = laneColor(data.lane)

  return (
    <Link
      href={`/case/${data.slug}`}
      className="group relative flex flex-col border border-[var(--border)] bg-[#141414] hover:border-[var(--gold)] transition-colors"
    >
      {/* Poster */}
      <div
        className="relative h-[200px] overflow-hidden cinema-grain"
        style={{
          background: `radial-gradient(ellipse at 30% 30%, ${accent}55, transparent 55%), linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.8) 100%)",
          }}
          aria-hidden
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="cinema-label text-[8px] text-white/70">
            {data.court}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {data.status === "live" && (
            <span className="cinema-pulse-dot" aria-hidden />
          )}
          <span className="cinema-label text-[8px]" style={{ color: accent }}>
            {laneLabel(data.lane)}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <Gavel
            size={72}
            strokeWidth={1}
            className="text-white/25 group-hover:text-white/60 transition-colors"
            style={{ filter: "drop-shadow(3px 3px 0 #000)" }}
          />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-white/40" />
            <span className="cinema-label text-[8px] text-white/50">
              {data.year} · {data.reels} reels
            </span>
          </div>
          <span className="cinema-label text-[8px] text-[var(--gold)]">
            {data.caseNumber.split("-").slice(0, 2).join("-")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        className="flex flex-1 flex-col p-4"
        style={{ borderTop: `2px solid ${accent}` }}
      >
        <p className="cinema-contract text-[10px] text-[var(--gold)]">
          Case {data.caseNumber} · {data.court}
        </p>
        <div className="flex items-start justify-between gap-2 mt-2">
          <h2
            className="cinema-title text-[22px] leading-[0.95] text-white flex-1"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {data.title}
          </h2>
        </div>
        <p className="mt-3 font-sans text-[12px] leading-relaxed text-[var(--muted-foreground)] line-clamp-3 flex-1">
          {data.description}
        </p>
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <span className="cinema-contract text-[9px] text-[var(--muted-foreground)]">
            @{data.publisher}
          </span>
          <ArrowRight
            size={12}
            className="text-[var(--muted-foreground)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Export (wrapped in ToastProvider)                              */
/* ------------------------------------------------------------------ */

export default function BrowsePage() {
  return (
    <ToastProvider>
      <BrowseContent />
    </ToastProvider>
  )
}
