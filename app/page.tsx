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
  FileText,
  Folder,
  Film,
  Gavel,
  Play,
  Clock,
  BookOpen,
  Mic,
  Scale,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthModal } from "@/components/auth-modal"
import { ToastProvider, useToast } from "@/components/legal-ui"
import { SettingsLauncher } from "@/components/settings-launcher"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FEATURED_CASES = [
  {
    id: "usa-v-mangione",
    slug: "usa-v-mangione",
    title: "USA v. Luigi Mangione",
    court: "S.D.N.Y.",
    caseNumber: "1:25-cr-00176-MMG",
    description:
      "The dramatic prosecution of the suspect charged with the assassination of a healthcare CEO on a Manhattan sidewalk.",
    publisher: "LegalDrama Editorial",
    color: "var(--red)",
  },
  {
    id: "sec-v-terraform",
    slug: "sec-v-terraform-labs",
    title: "SEC v. Terraform Labs",
    court: "S.D.N.Y.",
    caseNumber: "1:23-cv-01346",
    description:
      "The SEC's landmark fraud case against the creators of the collapsed TerraUSD stablecoin ecosystem.",
    publisher: "CryptoLaw Watch",
    color: "var(--amber)",
  },
  {
    id: "apple-v-epic",
    slug: "apple-v-epic-games",
    title: "Apple Inc. v. Epic Games",
    court: "N.D. Cal.",
    caseNumber: "4:20-cv-05640",
    description:
      "A blockbuster antitrust battle over the App Store that reshaped how Big Tech controls digital marketplaces.",
    publisher: "TechLaw Digest",
    color: "var(--cyan)",
  },
  {
    id: "usa-v-holmes",
    slug: "usa-v-elizabeth-holmes",
    title: "USA v. Elizabeth Holmes",
    court: "N.D. Cal.",
    caseNumber: "5:18-cr-00258",
    description:
      "The rise and fall of Theranos and the fraud prosecution of its visionary founder.",
    publisher: "SiliconJustice",
    color: "var(--purple)",
  },
  {
    id: "google-v-oracle",
    slug: "google-v-oracle-america",
    title: "Google LLC v. Oracle America",
    court: "N.D. Cal.",
    caseNumber: "3:10-cv-03561",
    description:
      "A decade-long copyright war over Java APIs that reached the Supreme Court and defined fair use in software.",
    publisher: "CodeCase Files",
    color: "var(--green)",
  },
  {
    id: "usa-v-sbf",
    slug: "usa-v-sam-bankman-fried",
    title: "USA v. Sam Bankman-Fried",
    court: "S.D.N.Y.",
    caseNumber: "1:23-cr-00334",
    description:
      "The spectacular fraud trial of the FTX founder who lost billions in customer funds overnight.",
    publisher: "FinCrime Bureau",
    color: "var(--amber)",
  },
  {
    id: "dominion-v-fox",
    slug: "dominion-v-fox-news",
    title: "Dominion Voting v. Fox News",
    court: "D. Del.",
    caseNumber: "1:21-cv-00525",
    description:
      "A defamation lawsuit that exposed internal communications and ended in a historic settlement.",
    publisher: "MediaLaw Review",
    color: "var(--red)",
  },
  {
    id: "usa-v-rkelly",
    slug: "usa-v-r-kelly",
    title: "USA v. R. Kelly",
    court: "E.D.N.Y.",
    caseNumber: "1:19-cr-00286",
    description:
      "The racketeering and sex trafficking prosecution of a music mogul spanning decades of alleged abuse.",
    publisher: "Justice Beat",
    color: "var(--purple)",
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

/* ------------------------------------------------------------------ */
/*  HomePage (inner, needs ToastProvider ancestor)                      */
/* ------------------------------------------------------------------ */

function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Auth
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
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

  // Auto-scroll carousel every 4 seconds, pause on hover
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
        el.scrollBy({ left: 300, behavior: "smooth" })
      }
    }, 4000)

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
      setSearchError("Enter a PACER case number.")
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

  const clearSearch = () => {
    setCourtValue("")
    setLastName("")
    setFirstName("")
    setCaseNumber("")
    setSearchError("")
    setSearchResult(null)
  }

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
    requireAuth(() => toast(`Bookmarked: ${title}`, "var(--green)"))
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ============================================================ */}
      {/*  NAVIGATION                                                   */}
      {/* ============================================================ */}
      <nav
        className="sticky top-0 z-50 bg-background"
        style={{ borderBottom: "2.5px solid var(--border)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-0.5 select-none">
            <span className="font-sans text-xl font-black text-foreground">legal</span>
            <span className="font-sans text-xl font-black" style={{ color: "var(--red)" }}>
              drama
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--amber)" }}>
              .ai
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden items-center gap-6 md:flex">
            {[
              { label: "Home", href: "/", active: true },
              { label: "Browse", href: "/browse", active: false },
              { label: "Pricing", href: "/pricing", active: false },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "font-sans text-sm font-semibold transition-colors",
                  link.active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={
                  link.active
                    ? {
                        textDecoration: "underline",
                        textUnderlineOffset: "6px",
                        textDecorationThickness: "2.5px",
                        textDecorationColor: "var(--amber)",
                      }
                    : undefined
                }
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <SettingsLauncher variant="chip" />
            <button
              onClick={() => {
                setAuthMode("signup")
                setAuthOpen(true)
              }}
              className="brut-press hidden font-sans text-xs font-bold px-4 py-1.5 md:block"
              style={{
                background: "var(--amber)",
                color: "var(--background)",
                border: "2.5px solid var(--border)",
                boxShadow: "4px 4px 0px var(--shadow-color)",
                borderRadius: 0,
              }}
            >
              Get Started
            </button>

            {user ? (
              <button
                onClick={() => {
                  setUser(null)
                  toast("Signed out", "var(--muted-foreground)")
                }}
                className="brut-press font-mono text-[11px] font-bold px-3 py-1.5"
                style={{
                  border: "2.5px solid var(--border)",
                  background: "var(--surface)",
                  borderRadius: 0,
                }}
              >
                {user.name.split(" ")[0]}
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("signin")
                  setAuthOpen(true)
                }}
                className="brut-press font-sans text-xs font-semibold px-3 py-1.5"
                style={{
                  border: "2.5px solid var(--border)",
                  background: "var(--surface)",
                  borderRadius: 0,
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-6 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-tight md:text-5xl">
          Turn Real Court Cases Into
          <br />
          Thrilling Legal Dramas
        </h1>
        <p className="mt-4 font-serif text-lg" style={{ color: "var(--muted-foreground)" }}>
          Enter a <strong className="font-sans font-bold text-foreground">federal case number</strong> to get started.
        </p>
      </section>

      {/* ============================================================ */}
      {/*  SEARCH BAR                                                   */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-xl px-4 pb-6">
        <div
          style={{
            border: searchError
              ? "2.5px solid var(--red)"
              : searchResult
                ? "2.5px solid var(--green)"
                : "2.5px solid var(--border)",
            boxShadow: "4px 4px 0px var(--shadow-color)",
            background: "var(--card)",
            borderRadius: 0,
          }}
        >
          {/* Mode tabs */}
          <div style={{ borderBottom: "2.5px solid var(--border)", display: "flex" }}>
            {(
              [
                { key: "court", label: "By Court" },
                { key: "name", label: "By Name" },
                { key: "case", label: "By Case #" },
              ] as const
            ).map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => {
                  setSearchMode(tab.key)
                  setSearchError("")
                  setSearchResult(null)
                }}
                className="font-mono text-[11px] font-extrabold tracking-wide transition-colors"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: searchMode === tab.key ? "var(--amber)" : "transparent",
                  color: searchMode === tab.key ? "var(--background)" : "var(--muted-foreground)",
                  borderRight: i < 2 ? "2.5px solid var(--border)" : undefined,
                  borderRadius: 0,
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4">
            {searchMode === "court" && (
              <select
                value={courtValue}
                onChange={(e) => {
                  setCourtValue(e.target.value)
                  setSearchError("")
                }}
                className="w-full font-mono text-sm px-3 py-2.5 focus:outline-none"
                style={{
                  border: "2.5px solid var(--border)",
                  borderRadius: 0,
                  background: "var(--surface)",
                  color: courtValue ? "var(--foreground)" : "var(--muted-foreground)",
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              >
                <option value="" className="font-serif italic">
                  Select a federal district court...
                </option>
                {FEDERAL_COURTS.map((c) => (
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
                  onChange={(e) => {
                    setLastName(e.target.value)
                    setSearchError("")
                  }}
                  placeholder="Last name"
                  className="flex-1 font-mono text-sm px-3 py-2.5 placeholder:font-serif placeholder:italic focus:outline-none"
                  style={{
                    border: "2.5px solid var(--border)",
                    borderRadius: 0,
                    background: "var(--surface)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="flex-1 font-mono text-sm px-3 py-2.5 placeholder:font-serif placeholder:italic focus:outline-none"
                  style={{
                    border: "2.5px solid var(--border)",
                    borderRadius: 0,
                    background: "var(--surface)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            )}

            {searchMode === "case" && (
              <div className="relative">
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => {
                    setCaseNumber(e.target.value)
                    setSearchError("")
                  }}
                  placeholder="e.g. 1:25-cr-00176"
                  className="w-full font-mono text-sm px-3 py-2.5 pr-8 placeholder:font-serif placeholder:italic focus:outline-none"
                  style={{
                    border: "2.5px solid var(--border)",
                    borderRadius: 0,
                    background: "var(--surface)",
                    color: "var(--foreground)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {caseNumber && (
                  <button
                    onClick={() => {
                      setCaseNumber("")
                      setSearchError("")
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
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
              className="brut-press mt-3 flex w-full items-center justify-center gap-2 py-2.5 font-sans text-sm font-bold"
              style={{
                background: "var(--cyan)",
                color: "var(--background)",
                border: "2.5px solid var(--border)",
                boxShadow: "4px 4px 0px var(--shadow-color)",
                borderRadius: 0,
                opacity: searchLoading ? 0.7 : 1,
                cursor: searchLoading ? "wait" : "pointer",
              }}
            >
              {searchLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {searchLoading ? "Searching..." : "Search Federal Courts"}
            </button>

            {/* Error */}
            {searchError && (
              <p
                className="mt-2 font-mono text-xs font-bold"
                style={{ color: "var(--red)" }}
              >
                {searchError}
              </p>
            )}

            {/* Helper text */}
            {!searchResult && !searchError && (
              <p
                className="mt-2 font-mono text-[11px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Enter a federal case to get started
              </p>
            )}
          </div>

          {/* Search result card */}
          {searchResult && (
            <div
              className="mx-4 mb-4 p-3"
              style={{
                border: "2.5px solid var(--green)",
                background: "var(--surface)",
                borderRadius: 0,
              }}
            >
              <div className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                  style={{ color: "var(--green)" }}
                />
                <div>
                  <p className="font-sans text-sm font-bold">{searchResult.title}</p>
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {searchResult.court} &mdash; {searchResult.caseNumber}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push(`/case/${searchResult.slug}`)}
                  className="brut-press flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs font-bold"
                  style={{
                    background: "var(--cyan)",
                    color: "var(--background)",
                    border: "2.5px solid var(--border)",
                    boxShadow: "3px 3px 0px var(--shadow-color)",
                    borderRadius: 0,
                  }}
                >
                  Open Case <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => handleBookmark(searchResult.title)}
                  className="brut-press flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-bold"
                  style={{
                    border: "2.5px solid var(--border)",
                    background: "var(--card)",
                    boxShadow: "3px 3px 0px var(--shadow-color)",
                    borderRadius: 0,
                  }}
                >
                  <Bookmark size={12} /> Bookmark
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SIGN UP CTA                                                  */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-xl px-4 pb-12 text-center">
        <p className="font-serif text-base" style={{ color: "var(--muted-foreground)" }}>
          Sign up to get <strong className="font-sans font-bold text-foreground">5 free searches!</strong>
        </p>
        <button
          onClick={() => {
            setAuthMode("signup")
            setAuthOpen(true)
          }}
          className="brut-press mt-3 font-sans text-sm font-bold px-6 py-2"
          style={{
            background: "var(--amber)",
            color: "var(--background)",
            border: "2.5px solid var(--border)",
            boxShadow: "4px 4px 0px var(--shadow-color)",
            borderRadius: 0,
          }}
        >
          Get Started
        </button>
      </section>

      {/* ============================================================ */}
      {/*  FEATURED CASE HERO — USA v. Mangione                         */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="mb-6 font-sans text-2xl font-extrabold text-center md:text-3xl">
          View a Sample Real Legal Drama Unfold
        </h2>

        <div
          style={{
            border: "2.5px solid var(--border)",
            boxShadow: "4px 4px 0px var(--shadow-color)",
            background: "var(--card)",
            borderRadius: 0,
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left — Courtroom image placeholder (clickable) */}
            <Link
              href="/case/usa-v-mangione"
              className="flex items-center justify-center md:w-[45%] min-h-[280px] cursor-pointer transition-transform hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, var(--red), var(--amber), var(--purple))",
                borderRight: "0px",
                borderBottom: "2.5px solid var(--border)",
              }}
            >
              <div
                className="flex flex-col items-center justify-center gap-3"
                style={{
                  width: 180,
                  height: 180,
                  border: "3px solid var(--background)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <Gavel size={48} style={{ color: "var(--background)" }} />
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--background)" }}
                >
                  Courtroom Photo
                </span>
              </div>
            </Link>

            {/* Right — Case details */}
            <div className="flex-1 p-5 md:p-6" style={{ borderLeft: "0px" }}>
              {/* On md+, add left border */}
              <div
                className="hidden md:block absolute left-0 top-0 bottom-0"
                style={{ width: 0, borderLeft: "2.5px solid var(--border)" }}
              />

              <p
                className="font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--red)" }}
              >
                Featured Case
              </p>

              <Link
                href="/case/usa-v-mangione"
                className="inline-block mt-2 transition-colors hover:text-[var(--red)]"
              >
                <h3 className="font-sans text-2xl font-black md:text-3xl">
                  USA v. Mangione
                </h3>
              </Link>

              <p
                className="mt-1 font-mono text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                1:25-cr-00176-MMG-1 (S.D.N.Y.)
              </p>

              <p
                className="mt-1 font-mono text-[10px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Updated as of March 27, 2026
              </p>

              {/* Latest happening CTA card */}
              <div
                className="mt-4 p-4"
                style={{
                  border: "2.5px solid var(--border)",
                  background: "var(--surface)",
                  boxShadow: "3px 3px 0px var(--shadow-color)",
                  borderRadius: 0,
                }}
              >
                <p
                  className="font-mono text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--amber)" }}
                >
                  Latest Happening
                </p>
                <p className="mt-2 font-serif text-sm leading-relaxed">
                  The defendant has entered a plea of not guilty on all counts.
                  The court has scheduled a pre-trial conference for next month.
                  Defense counsel filed a motion to suppress key evidence.
                </p>
                <Link
                  href="/case/usa-v-mangione"
                  className="brut-press mt-3 inline-flex items-center gap-2 px-4 py-2 font-sans text-xs font-bold"
                  style={{
                    background: "var(--red)",
                    color: "var(--background)",
                    border: "2.5px solid var(--border)",
                    boxShadow: "3px 3px 0px var(--shadow-color)",
                    borderRadius: 0,
                  }}
                >
                  Read Full Update <ArrowRight size={12} />
                </Link>
              </div>

              {/* Action buttons row */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Overview of Case", icon: Scale },
                  { label: "Audio Summaries", icon: Mic },
                  { label: "Screenplay Ideas", icon: Film },
                  { label: "View Docket", icon: BookOpen },
                ].map((btn) => {
                  const BtnIcon = btn.icon
                  return (
                    <Link
                      key={btn.label}
                      href="/case/usa-v-mangione"
                      className="brut-press flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] font-bold"
                      style={{
                        border: "2.5px solid var(--border)",
                        background: "var(--card)",
                        boxShadow: "3px 3px 0px var(--shadow-color)",
                        borderRadius: 0,
                      }}
                    >
                      <BtnIcon size={12} style={{ color: "var(--cyan)" }} />
                      {btn.label}
                    </Link>
                  )
                })}
              </div>

              {/* Timeline — clickable, opens the Story So Far on the case page */}
              <Link
                href="/case/usa-v-mangione"
                className="block mt-4 p-3 transition-all hover:shadow-[3px_3px_0px_var(--shadow-color)] hover:border-[var(--red)] cursor-pointer"
                style={{
                  border: "2.5px solid var(--border)",
                  background: "var(--surface-alt)",
                  borderRadius: 0,
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="font-mono text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Timeline — Story So Far
                  </p>
                  <ArrowRight size={12} style={{ color: "var(--muted-foreground)" }} />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {[
                    { date: "Dec 2024", event: "Arrest" },
                    { date: "Jan 2025", event: "Indictment" },
                    { date: "Mar 2025", event: "Arraignment" },
                    { date: "TBD", event: "Trial" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            background: idx < 3 ? "var(--red)" : "var(--muted-foreground)",
                            border: "2px solid var(--border)",
                          }}
                        />
                        <p className="font-mono text-[9px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                          {item.date}
                        </p>
                        <p className="font-mono text-[9px] font-bold">{item.event}</p>
                      </div>
                      {idx < 3 && (
                        <div
                          style={{
                            width: 24,
                            height: 2,
                            background: "var(--border)",
                            marginBottom: 20,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Link>

              {/* Reference Files button */}
              <Link
                href="/case/usa-v-mangione"
                className="brut-press mt-4 inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] font-bold"
                style={{
                  border: "2.5px solid var(--border)",
                  background: "var(--surface)",
                  boxShadow: "3px 3px 0px var(--shadow-color)",
                  borderRadius: 0,
                }}
              >
                <Folder size={14} style={{ color: "var(--amber)" }} />
                Reference Files
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  AUTO-ROTATING FEATURED CASES CAROUSEL                        */}
      {/* ============================================================ */}
      <section
        className="mx-auto max-w-6xl px-4 pb-20"
        onMouseEnter={() => setCarouselHovered(true)}
        onMouseLeave={() => setCarouselHovered(false)}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-2xl font-extrabold">Featured Cases</h2>
          <div className="flex gap-2">
            {(["left", "right"] as const).map((dir) => {
              const enabled = dir === "left" ? canScrollLeft : canScrollRight
              return (
                <button
                  key={dir}
                  onClick={() => scrollCarousel(dir)}
                  disabled={!enabled}
                  className="brut-press flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    border: "2.5px solid var(--border)",
                    background: enabled ? "var(--card)" : "var(--surface)",
                    boxShadow: enabled ? "3px 3px 0px var(--shadow-color)" : "none",
                    borderRadius: 0,
                    opacity: enabled ? 1 : 0.35,
                    cursor: enabled ? "pointer" : "default",
                  }}
                  aria-label={`Scroll ${dir}`}
                >
                  {dir === "left" ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {FEATURED_CASES.map((c) => (
            <div
              key={c.id}
              className="brut-lift flex w-[280px] shrink-0 cursor-pointer flex-col"
              style={{
                border: "2.5px solid var(--border)",
                boxShadow: "4px 4px 0px var(--shadow-color)",
                background: "var(--card)",
                borderRadius: 0,
              }}
              onClick={() => router.push(`/case/${c.slug}`)}
            >
              {/* Color thumbnail */}
              <div
                className="flex h-28 items-end p-3"
                style={{ background: c.color }}
              >
                <span
                  className="font-mono text-[10px] font-bold px-2 py-0.5"
                  style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    border: "1.5px solid var(--border)",
                    borderRadius: 0,
                  }}
                >
                  {c.court}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-3">
                <h3 className="font-sans text-sm font-bold leading-snug">
                  {c.title}
                </h3>
                <p
                  className="mt-1.5 font-serif text-xs leading-relaxed line-clamp-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {c.description}
                </p>
                <div className="mt-auto pt-3">
                  <p
                    className="font-mono text-[10px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Published by {c.publisher}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer
        className="py-6 text-center"
        style={{ borderTop: "2.5px solid var(--border)" }}
      >
        <p
          className="font-mono text-[11px]"
          style={{ color: "var(--muted-foreground)" }}
        >
          LegalDrama.AI MVP Rev V2.0
        </p>
      </footer>

      {/* ============================================================ */}
      {/*  AUTH MODAL                                                   */}
      {/* ============================================================ */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={(u) => {
          setUser(u)
          setAuthOpen(false)
          toast(`Welcome, ${u.name}`, "var(--green)")
        }}
        initialMode={authMode}
      />
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
