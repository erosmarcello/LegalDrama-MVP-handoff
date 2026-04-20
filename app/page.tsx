"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  X,
  Bookmark,
  ArrowRight,
  Folder,
  Film,
  Gavel,
  Play,
  BookOpen,
  Mic,
  Scale,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthModal } from "@/components/auth-modal"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"
import { useAuth } from "@/lib/auth-context"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FEATURED_CASES = [
  {
    id: "usa-v-mangione",
    slug: "usa-v-mangione",
    title: "USA v. Mangione",
    court: "S.D.N.Y.",
    caseNumber: "1:25-CR-00176-MMG",
    description:
      "The dramatic prosecution of the suspect charged with the assassination of a healthcare CEO on a Manhattan sidewalk.",
    publisher: "LegalDrama Editorial",
    lane: "govt",
    year: "2025",
  },
  {
    id: "sec-v-terraform",
    slug: "sec-v-terraform-labs",
    title: "SEC v. Terraform Labs",
    court: "S.D.N.Y.",
    caseNumber: "1:23-CV-01346",
    description:
      "The SEC's landmark fraud case against the creators of the collapsed TerraUSD stablecoin ecosystem.",
    publisher: "CryptoLaw Watch",
    lane: "govt",
    year: "2023",
  },
  {
    id: "apple-v-epic",
    slug: "apple-v-epic-games",
    title: "Apple v. Epic Games",
    court: "N.D. CAL.",
    caseNumber: "4:20-CV-05640",
    description:
      "A blockbuster antitrust battle over the App Store that reshaped how Big Tech controls digital marketplaces.",
    publisher: "TechLaw Digest",
    lane: "defense",
    year: "2020",
  },
  {
    id: "usa-v-holmes",
    slug: "usa-v-elizabeth-holmes",
    title: "USA v. Elizabeth Holmes",
    court: "N.D. CAL.",
    caseNumber: "5:18-CR-00258",
    description:
      "The rise and fall of Theranos and the fraud prosecution of its visionary founder.",
    publisher: "SiliconJustice",
    lane: "govt",
    year: "2018",
  },
  {
    id: "google-v-oracle",
    slug: "google-v-oracle-america",
    title: "Google v. Oracle America",
    court: "N.D. CAL.",
    caseNumber: "3:10-CV-03561",
    description:
      "A decade-long copyright war over Java APIs that reached the Supreme Court and defined fair use in software.",
    publisher: "CodeCase Files",
    lane: "court",
    year: "2010",
  },
  {
    id: "usa-v-sbf",
    slug: "usa-v-sam-bankman-fried",
    title: "USA v. Sam Bankman-Fried",
    court: "S.D.N.Y.",
    caseNumber: "1:23-CR-00334",
    description:
      "The spectacular fraud trial of the FTX founder who lost billions in customer funds overnight.",
    publisher: "FinCrime Bureau",
    lane: "govt",
    year: "2023",
  },
  {
    id: "dominion-v-fox",
    slug: "dominion-v-fox-news",
    title: "Dominion v. Fox News",
    court: "D. DEL.",
    caseNumber: "1:21-CV-00525",
    description:
      "A defamation lawsuit that exposed internal communications and ended in a historic settlement.",
    publisher: "MediaLaw Review",
    lane: "defense",
    year: "2021",
  },
  {
    id: "usa-v-rkelly",
    slug: "usa-v-r-kelly",
    title: "USA v. R. Kelly",
    court: "E.D.N.Y.",
    caseNumber: "1:19-CR-00286",
    description:
      "The racketeering and sex trafficking prosecution of a music mogul spanning decades of alleged abuse.",
    publisher: "Justice Beat",
    lane: "govt",
    year: "2019",
  },
]

const FEDERAL_COURTS = [
  "S.D.N.Y.",
  "E.D.N.Y.",
  "C.D. Cal.",
  "N.D. Ill.",
  "D. Mass.",
  "N.D. Cal.",
  "S.D. Fla.",
  "W.D. Tex.",
  "E.D. Va.",
  "D.D.C.",
  "S.D. Cal.",
  "N.D. Tex.",
  "D. Md.",
  "E.D. Pa.",
  "W.D. Wash.",
]

type SearchMode = "court" | "name" | "case"

interface SearchResult {
  title: string
  court: string
  caseNumber: string
  slug: string
}

function laneColor(lane: string) {
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

/* ------------------------------------------------------------------ */
/*  HomePage (inner, needs ToastProvider ancestor)                      */
/* ------------------------------------------------------------------ */

function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auth — from shared context so sign-in persists across routes
  const { user, signIn, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")

  // Search
  const [searchMode, setSearchMode] = useState<SearchMode>("court")
  const [courtValue, setCourtValue] = useState("")
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [caseNumber, setCaseNumber] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  // Carousel
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [carouselHovered, setCarouselHovered] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  // Auto-scroll carousel, pause on hover
  useEffect(() => {
    if (carouselHovered) {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
        autoScrollRef.current = null
      }
      return
    }

    autoScrollRef.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" })
      }
    }, 4500)

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
        autoScrollRef.current = null
      }
    }
  }, [carouselHovered])

  const scrollCarousel = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  /* ---- search ---- */
  const handleSearch = useCallback(() => {
    setSearchError("")
    setSearchResult(null)

    if (searchMode === "court" && !courtValue) {
      setSearchError("Select a federal district court.")
      return
    }
    if (searchMode === "name" && !lastName.trim()) {
      setSearchError("Last name is required.")
      return
    }
    if (searchMode === "case" && !caseNumber.trim()) {
      setSearchError("Enter a federal case number.")
      return
    }

    setSearchLoading(true)
    setTimeout(() => {
      setSearchLoading(false)
      setSearchResult({
        title:
          searchMode === "court"
            ? `Recent Filing in ${courtValue}`
            : searchMode === "name"
              ? `Case involving ${lastName}${firstName ? ", " + firstName : ""}`
              : `Case ${caseNumber}`,
        court: searchMode === "court" ? courtValue : "S.D.N.Y.",
        caseNumber:
          searchMode === "case"
            ? caseNumber
            : "1:25-cv-" + Math.floor(Math.random() * 99999).toString().padStart(5, "0"),
        slug: "demo-case-result",
      })
    }, 1400)
  }, [searchMode, courtValue, lastName, firstName, caseNumber])

  /* ---- auth guard ---- */
  const requireAuth = (action: () => void) => {
    if (user) {
      action()
    } else {
      setAuthMode("signup")
      setAuthOpen(true)
    }
  }

  const handleBookmark = (title: string) => {
    requireAuth(() => toast(`Bookmarked: ${title}`, "var(--gold)"))
  }

  const handleSignIn = () => {
    setAuthMode("signin")
    setAuthOpen(true)
  }

  const handleSignUp = () => {
    setAuthMode("signup")
    setAuthOpen(true)
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Masthead
        user={user}
        onSignIn={handleSignIn}
        onSignOut={() => {
          signOut()
          toast("Signed out", "var(--muted-foreground)")
        }}
      />

      {/* ============================================================ */}
      {/*  HERO — full-bleed cinematic opening shot                     */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden cinema-grain">
        {/* atmospheric gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(204,24,24,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 80%, rgba(179,163,105,0.12), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
          }}
          aria-hidden
        />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-24">
          {/* Marquee label */}
          <div className="flex items-center gap-3 mb-6">
            <span className="cinema-pulse-dot" aria-hidden />
            <span className="cinema-contract text-[12px] text-[var(--gold)]">
              Now Streaming · Federal Court Records Reimagined
            </span>
          </div>

          <h1
            className="cinema-title text-[54px] sm:text-[72px] md:text-[92px] lg:text-[112px] leading-[0.88] text-white max-w-[18ch]"
            style={{ textShadow: "3px 3px 0 #000" }}
          >
            Every Docket
            <br />
            Is A{" "}
            <span style={{ color: "var(--red)" }}>Screenplay</span>
            <br />
            Waiting To Be
            <br />
            <span style={{ color: "var(--gold)" }}>Written.</span>
          </h1>

          <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <p className="font-sans text-[15px] md:text-[17px] leading-relaxed text-[var(--muted-foreground)] max-w-[60ch]">
              LegalDrama.ai turns real federal court cases into cinematic legal
              dramas. Public record goes in — scripts, timelines, and mood boards
              come out. Built for screenwriters, true-crime obsessives, and
              anyone who thinks the docket already reads like a thriller.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSignUp}
                className={cn(
                  "h-11 px-6 flex items-center gap-2",
                  "bg-white text-[#0a0a0a]",
                  "cinema-label text-[11px]",
                  "hover:bg-[var(--gold)] transition-colors"
                )}
              >
                <Play size={13} /> Start Free Trial
              </button>
              <Link
                href="/browse"
                className={cn(
                  "h-11 px-6 flex items-center gap-2",
                  "border border-[var(--gold)] text-[var(--gold)]",
                  "cinema-label text-[11px]",
                  "hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-colors"
                )}
              >
                Browse Active Cases <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ticker strip */}
          <div className="mt-12 md:mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--border)] pt-5">
            <StatChip label="Cases Indexed" value="12,847" />
            <StatChip label="Docket Entries" value="4.2M" accent="var(--gold)" />
            <StatChip label="Scripts Generated" value="38,201" accent="var(--red)" />
            <StatChip label="Screenwriters Onboard" value="2,106" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SEARCH — the investigation console                           */}
      {/* ============================================================ */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-16 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12">
          <div className="max-w-[320px]">
            <div className="cinema-label text-[9px] text-[var(--gold)] mb-3">
              § Case Intake
            </div>
            <h2 className="cinema-title text-[32px] md:text-[42px] leading-[0.95] text-white">
              Pull A Case.
              <br />
              <span style={{ color: "var(--red)" }}>Write The Scene.</span>
            </h2>
            <p className="mt-4 font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)]">
              Enter a federal case number, defendant name, or search by district
              court. We lift the docket off the public record and stage it for
              you — ready to be adapted, dramatized, or studied.
            </p>
          </div>

          <div className="border border-[var(--border)] bg-[#141414]">
            {/* Mode tabs */}
            <div className="grid grid-cols-3 border-b border-[var(--border)]">
              {(
                [
                  { key: "court", label: "By Court" },
                  { key: "name", label: "By Name" },
                  { key: "case", label: "By Case №" },
                ] as const
              ).map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSearchMode(tab.key)
                    setSearchError("")
                    setSearchResult(null)
                  }}
                  className={cn(
                    "cinema-label text-[10px] py-3 transition-colors",
                    i < 2 && "border-r border-[var(--border)]",
                    searchMode === tab.key
                      ? "bg-[var(--gold)] text-[#0a0a0a]"
                      : "text-[var(--muted-foreground)] hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-5 md:p-6">
              {searchMode === "court" && (
                <select
                  value={courtValue}
                  onChange={e => {
                    setCourtValue(e.target.value)
                    setSearchError("")
                  }}
                  className={cn(
                    "w-full bg-[#0a0a0a] border border-[var(--border)]",
                    "cinema-label text-[11px] text-white",
                    "px-4 py-3 focus:outline-none focus:border-[var(--gold)]"
                  )}
                  style={{ appearance: "none", WebkitAppearance: "none" }}
                >
                  <option value="">Select a Federal District Court…</option>
                  {FEDERAL_COURTS.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {searchMode === "name" && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value)
                      setSearchError("")
                    }}
                    placeholder="Last name"
                    className={cn(
                      "flex-1 bg-[#0a0a0a] border border-[var(--border)]",
                      "cinema-label text-[11px] text-white px-4 py-3",
                      "placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.1em]",
                      "focus:outline-none focus:border-[var(--gold)]"
                    )}
                  />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={cn(
                      "flex-1 bg-[#0a0a0a] border border-[var(--border)]",
                      "cinema-label text-[11px] text-white px-4 py-3",
                      "placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.1em]",
                      "focus:outline-none focus:border-[var(--gold)]"
                    )}
                  />
                </div>
              )}

              {searchMode === "case" && (
                <div className="relative">
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={e => {
                      setCaseNumber(e.target.value)
                      setSearchError("")
                    }}
                    placeholder="e.g. 1:25-cr-00176"
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    className={cn(
                      "w-full bg-[#0a0a0a] border border-[var(--border)]",
                      "cinema-label text-[11px] text-white px-4 py-3 pr-10",
                      "placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.1em]",
                      "focus:outline-none focus:border-[var(--gold)]"
                    )}
                  />
                  {caseNumber && (
                    <button
                      onClick={() => setCaseNumber("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--gold)]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className={cn(
                  "mt-4 w-full h-11 flex items-center justify-center gap-2",
                  "bg-white text-[#0a0a0a]",
                  "cinema-label text-[11px]",
                  "hover:bg-[var(--gold)] transition-colors",
                  searchLoading && "opacity-70 cursor-wait"
                )}
              >
                {searchLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Search size={14} />
                )}
                {searchLoading ? "Scanning the archive…" : "Search Federal Courts"}
              </button>

              {/* Messages */}
              {searchError && (
                <div
                  className="mt-3 flex items-center gap-2 cinema-label text-[10px]"
                  style={{ color: "var(--red)" }}
                >
                  <span className="cinema-pulse-dot" aria-hidden />
                  {searchError}
                </div>
              )}
              {!searchResult && !searchError && (
                <p className="mt-3 cinema-label text-[9px] text-[var(--muted-foreground)]">
                  Public record · Federal only · Updated hourly
                </p>
              )}

              {/* Result */}
              {searchResult && (
                <div
                  className="mt-5 p-4 border border-[var(--gold)] bg-[#0a0a0a]"
                  style={{ borderTop: "2px solid var(--gold)" }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={15}
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--gold)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="cinema-title text-[18px] text-white leading-tight">
                        {searchResult.title}
                      </p>
                      <p className="mt-1 cinema-label text-[10px] text-[var(--muted-foreground)]">
                        {searchResult.court} · {searchResult.caseNumber}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/case/${searchResult.slug}`)}
                      className="h-9 px-4 flex items-center gap-2 bg-white text-[#0a0a0a] cinema-label text-[10px] hover:bg-[var(--gold)] transition-colors"
                    >
                      Open Case File <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleBookmark(searchResult.title)}
                      className="h-9 px-4 flex items-center gap-2 border border-[var(--border)] text-[var(--muted-foreground)] cinema-label text-[10px] hover:text-[var(--gold)] hover:border-[var(--gold)] transition-colors"
                    >
                      <Bookmark size={12} /> Bookmark
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURED HERO — USA v. Mangione as a cinematic one-sheet     */}
      {/* ============================================================ */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="cinema-label text-[9px] text-[var(--red)] mb-2">
                § Feature Presentation
              </div>
              <h2 className="cinema-title text-[32px] md:text-[44px] leading-[0.95] text-white">
                Watch The Story Unfold
              </h2>
            </div>
            <Link
              href="/browse"
              className="hidden md:inline-flex items-center gap-2 cinema-label text-[10px] text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors"
            >
              View All Features <ArrowRight size={12} />
            </Link>
          </div>

          <Link
            href="/case/usa-v-mangione"
            className="block group border border-[var(--border)] bg-[#141414] overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-[42%_1fr]">
              {/* Poster panel */}
              <div
                className="relative min-h-[280px] md:min-h-[440px] overflow-hidden cinema-grain"
                style={{
                  background:
                    "radial-gradient(ellipse at 20% 30%, rgba(204,24,24,0.6), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(0,0,0,0.8), rgba(10,10,10,0.95))",
                }}
              >
                {/* vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
                  }}
                  aria-hidden
                />

                {/* central motif */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Gavel
                      size={140}
                      strokeWidth={1}
                      className="text-white/90 transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: "drop-shadow(4px 4px 0 #000)" }}
                    />
                  </div>
                </div>

                {/* corner metadata */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="cinema-pulse-dot" aria-hidden />
                    <span className="cinema-label text-[9px] text-white">
                      Live Trial
                    </span>
                  </div>
                  <span className="cinema-label text-[9px] text-[var(--gold)]">
                    Rated NR · Unredacted
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span className="cinema-label text-[9px] text-white/60">
                    S.D.N.Y. · 2025
                  </span>
                  <span className="cinema-label text-[9px] text-white/60">
                    Reel 01 / 04
                  </span>
                </div>
              </div>

              {/* Details panel */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="cinema-contract text-[12px] text-[var(--red)]">
                  Now Playing · Federal Criminal
                </div>
                <p className="mt-4 cinema-contract text-[11px] text-[var(--gold)]">
                  Case 1:25-CR-00176-MMG · S.D.N.Y. · Updated 27 Mar 2026
                </p>
                <p className="mt-2 cinema-contract-italic text-[14px] text-[var(--gold)]">
                  A quiet man. A hot pistol. A country holding its breath.
                </p>
                <h3
                  className="cinema-title mt-3 text-[40px] md:text-[56px] leading-[0.9] text-white"
                  style={{ textShadow: "2px 2px 0 #000" }}
                >
                  USA <span className="text-[var(--muted-foreground)]">v.</span>{" "}
                  <span style={{ color: "var(--red)" }}>Mangione</span>
                </h3>
                <p className="mt-4 cinema-contract text-[11px] text-[var(--gold)] pb-2 border-b border-[var(--border)]">
                  Luigi Mangione · Hon. Margaret M. Garnett · SDNY, Pearl Street
                </p>

                <p className="mt-5 font-sans text-[14px] leading-relaxed text-[var(--muted-foreground)] max-w-[60ch]">
                  A healthcare CEO gunned down on a Midtown sidewalk. A young
                  suspect carrying a manifesto. A city split between outrage
                  and sympathy. The trial of a generation, staged before the
                  Southern District of New York.
                </p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Overview", icon: Scale },
                    { label: "Audio Brief", icon: Mic },
                    { label: "Screenplay", icon: Film },
                    { label: "Docket", icon: BookOpen },
                  ].map(btn => {
                    const BtnIcon = btn.icon
                    return (
                      <div
                        key={btn.label}
                        className="border border-[var(--border)] bg-[#0a0a0a] px-3 py-2 flex items-center gap-2"
                      >
                        <BtnIcon size={12} style={{ color: "var(--gold)" }} />
                        <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                          {btn.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Mini timeline */}
                <div className="mt-6 border border-[var(--border)] bg-[#0a0a0a] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="cinema-label text-[9px] text-[var(--gold)]">
                      Timeline · Story So Far
                    </span>
                    <ArrowRight size={12} className="text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    {[
                      { date: "DEC 2024", event: "Arrest", done: true },
                      { date: "JAN 2025", event: "Indictment", done: true },
                      { date: "MAR 2025", event: "Arraignment", done: true },
                      { date: "TBD", event: "Trial", done: false },
                    ].map((item, idx, arr) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center text-center relative"
                      >
                        <div
                          className="w-2.5 h-2.5"
                          style={{
                            background: item.done ? "var(--red)" : "var(--border)",
                            outline: "2px solid #0a0a0a",
                          }}
                        />
                        <span className="cinema-label text-[8px] text-[var(--muted-foreground)] mt-2">
                          {item.date}
                        </span>
                        <span className="cinema-label text-[9px] text-white mt-0.5">
                          {item.event}
                        </span>
                        {idx < arr.length - 1 && (
                          <div
                            className="absolute top-[5px] left-[calc(50%+8px)] right-[calc(-50%+8px)] h-px"
                            style={{ background: "var(--border)" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="h-9 px-5 flex items-center gap-2 bg-white text-[#0a0a0a] cinema-label text-[10px] group-hover:bg-[var(--red)] group-hover:text-white transition-colors">
                    <Play size={12} /> Open Case File
                  </span>
                  <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                    4 Reels · 128 Docket Entries · 12 Exhibits
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURED CASES CAROUSEL — the movie-poster wall               */}
      {/* ============================================================ */}
      <section
        className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain"
        onMouseEnter={() => setCarouselHovered(true)}
        onMouseLeave={() => setCarouselHovered(false)}
      >
        <div className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="flex items-end justify-between mb-6 gap-4">
            <div>
              <div className="cinema-label text-[9px] text-[var(--gold)] mb-2">
                § Now Showing
              </div>
              <h2 className="cinema-title text-[32px] md:text-[44px] leading-[0.95] text-white">
                Blockbusters Of The Docket
              </h2>
            </div>
            <div className="flex gap-2">
              {(["left", "right"] as const).map(dir => {
                const enabled = dir === "left" ? canScrollLeft : canScrollRight
                return (
                  <button
                    key={dir}
                    onClick={() => scrollCarousel(dir)}
                    disabled={!enabled}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center border transition-colors",
                      enabled
                        ? "border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#0a0a0a]"
                        : "border-[var(--border)] text-[var(--border)] cursor-default"
                    )}
                    aria-label={`Scroll ${dir}`}
                  >
                    {dir === "left" ? (
                      <ChevronLeft size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 cinema-scrollbar-hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {FEATURED_CASES.map(c => {
              const accent = laneColor(c.lane)
              return (
                <Link
                  key={c.id}
                  href={`/case/${c.slug}`}
                  className="group relative flex w-[260px] sm:w-[300px] shrink-0 flex-col border border-[var(--border)] bg-[#141414] hover:border-[var(--gold)] transition-colors"
                >
                  {/* Poster */}
                  <div
                    className="relative h-[180px] overflow-hidden cinema-grain"
                    style={{
                      background: `radial-gradient(ellipse at 30% 30%, ${accent}55, transparent 55%), linear-gradient(180deg, #1a1a1a, #0a0a0a)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
                      }}
                      aria-hidden
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="cinema-label text-[8px] text-white/70">
                        {c.court}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className="cinema-label text-[8px]"
                        style={{ color: accent }}
                      >
                        {c.lane === "govt"
                          ? "▲ GOVT"
                          : c.lane === "defense"
                            ? "◆ DEFENSE"
                            : "● COURT"}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Gavel
                        size={60}
                        strokeWidth={1}
                        className="text-white/25 group-hover:text-white/60 transition-colors"
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="cinema-label text-[8px] text-white/50">
                        Reel · {c.year}
                      </span>
                      <span className="cinema-label text-[8px] text-[var(--gold)]">
                        {c.caseNumber.split("-")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className="flex flex-1 flex-col p-4"
                    style={{ borderTop: `2px solid ${accent}` }}
                  >
                    <p className="cinema-contract text-[10px] text-[var(--gold)]">
                      Case {c.caseNumber} · {c.court}
                    </p>
                    <h3
                      className="cinema-title mt-2 text-[22px] leading-[0.95] text-white"
                      style={{ textShadow: "1px 1px 0 #000" }}
                    >
                      {c.title}
                    </h3>
                    <p className="mt-3 font-sans text-[12px] leading-relaxed text-[var(--muted-foreground)] line-clamp-3 flex-1">
                      {c.description}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="cinema-contract text-[9px] text-[var(--muted-foreground)]">
                        {c.publisher}
                      </span>
                      <ArrowRight
                        size={12}
                        className="text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DUAL-AUDIENCE STRIP — writers vs true-crime                  */}
      {/* ============================================================ */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="cinema-label text-[9px] text-[var(--gold)] mb-3">
            § Two Audiences · One Docket
          </div>
          <h2 className="cinema-title text-[32px] md:text-[44px] leading-[0.95] text-white max-w-[20ch]">
            Built For People Who Think{" "}
            <span style={{ color: "var(--red)" }}>The Record</span>{" "}
            Already Reads Like A Script.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border border-[var(--border)]">
            <AudienceCard
              accent="var(--gold)"
              label="For Screenwriters"
              title="Your Next Draft, Already Outlined By Reality"
              body="Turn a docket into a beat sheet. Export cleaned transcripts, character dossiers, and three-act timelines. Every scene is pre-grounded in public record — no need to invent what a courtroom actually sounds like."
              bullets={[
                "Scene-ready transcripts",
                "Automatic character sheets",
                "Fair-use citation export",
              ]}
            />
            <AudienceCard
              accent="var(--red)"
              label="For True-Crime Obsessives"
              title="Beyond The Podcast Episode. Into The Record."
              body="Follow active federal trials as they unfold. Mood boards pull in news photos, filings, and AI-generated dramatizations — all clearly labeled, all cited, all grounded in the public record."
              bullets={[
                "Live docket syncs",
                "Case-study mood boards",
                "Story-so-far timelines",
              ]}
              borderLeft
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CLOSING CTA                                                  */}
      {/* ============================================================ */}
      <section className="relative border-t border-[var(--border)] bg-[#0a0a0a] cinema-grain">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(204,24,24,0.12), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-[900px] mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
          <div className="cinema-label text-[9px] text-[var(--gold)] mb-4">
            § Final Reel
          </div>
          <h2
            className="cinema-title text-[44px] md:text-[72px] leading-[0.9] text-white"
            style={{ textShadow: "2px 2px 0 #000" }}
          >
            Five Free Searches.
            <br />
            <span style={{ color: "var(--red)" }}>No Camera Crew Needed.</span>
          </h2>
          <p className="mt-5 font-sans text-[15px] text-[var(--muted-foreground)] max-w-[52ch] mx-auto">
            Sign up and start pulling federal cases. Turn the next one into a
            spec, a podcast arc, or just a late-night rabbit hole.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSignUp}
              className="h-12 px-8 flex items-center gap-2 bg-white text-[#0a0a0a] cinema-label text-[11px] hover:bg-[var(--gold)] transition-colors"
            >
              <Play size={13} /> Start Free Trial
            </button>
            <Link
              href="/pricing"
              className="h-12 px-8 flex items-center gap-2 border border-[var(--gold)] text-[var(--gold)] cinema-label text-[11px] hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-colors"
            >
              See Subscription Tiers
            </Link>
          </div>
        </div>
      </section>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={u => {
          signIn(u)
          setAuthOpen(false)
          toast(`Welcome, ${u.name}`, "var(--gold)")
        }}
        initialMode={authMode}
      />

      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tiny sub-components                                                */
/* ------------------------------------------------------------------ */

function StatChip({
  label,
  value,
  accent = "#ffffff",
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="cinema-title text-[28px] md:text-[32px] leading-none"
        style={{ color: accent, textShadow: "1px 1px 0 #000" }}
      >
        {value}
      </span>
      <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
        {label}
      </span>
    </div>
  )
}

function AudienceCard({
  accent,
  label,
  title,
  body,
  bullets,
  borderLeft = false,
}: {
  accent: string
  label: string
  title: string
  body: string
  bullets: string[]
  borderLeft?: boolean
}) {
  return (
    <div
      className={cn(
        "p-6 md:p-8 bg-[#141414]",
        borderLeft && "md:border-l border-[var(--border)]"
      )}
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div className="cinema-label text-[9px]" style={{ color: accent }}>
        {label}
      </div>
      <h3
        className="cinema-title mt-3 text-[24px] md:text-[30px] leading-[0.95] text-white max-w-[20ch]"
        style={{ textShadow: "1px 1px 0 #000" }}
      >
        {title}
      </h3>
      <p className="mt-4 font-sans text-[13px] leading-relaxed text-[var(--muted-foreground)] max-w-[50ch]">
        {body}
      </p>
      <ul className="mt-5 space-y-2">
        {bullets.map(b => (
          <li
            key={b}
            className="flex items-center gap-3 cinema-label text-[10px] text-[var(--muted-foreground)]"
          >
            <span
              className="w-1.5 h-1.5 shrink-0"
              style={{ background: accent }}
              aria-hidden
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Root export with ToastProvider wrapper                              */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <ToastProvider>
      <HomePage />
    </ToastProvider>
  )
}
