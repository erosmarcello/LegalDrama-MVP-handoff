"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Moon, Sun, Search, Scale, Gavel, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { ToastProvider, useToast } from "@/components/legal-ui"

/* ------------------------------------------------------------------ */
/*  Featured Cases Data                                                */
/* ------------------------------------------------------------------ */

interface FeaturedCase {
  id: string
  slug: string
  title: string
  court: string
  description: string
  publisher: string
  thumbnailColor: string
}

const FEATURED_CASES: FeaturedCase[] = [
  {
    id: "1",
    slug: "mangione",
    title: "USA v. Luigi Mangione",
    court: "S.D.N.Y.",
    description:
      "The high-profile federal case against Luigi Mangione, charged in connection with the fatal shooting of UnitedHealthcare CEO Brian Thompson in December 2024. The case sparked a national debate on healthcare industry accountability.",
    publisher: "legaldrama_team",
    thumbnailColor: "var(--red)",
  },
  {
    id: "2",
    slug: "terraform-labs",
    title: "SEC v. Terraform Labs",
    court: "S.D.N.Y.",
    description:
      "The SEC brought charges against Terraform Labs and its founder Do Kwon for orchestrating a multi-billion dollar crypto securities fraud involving the collapse of TerraUSD and Luna tokens.",
    publisher: "crypto_law",
    thumbnailColor: "var(--cyan)",
  },
  {
    id: "3",
    slug: "apple-v-epic",
    title: "Apple Inc. v. Epic Games",
    court: "N.D. Cal.",
    description:
      "A landmark antitrust battle over Apple's App Store policies and the 30% commission fee. Epic Games challenged Apple's monopoly on iOS app distribution after Fortnite was removed.",
    publisher: "tech_counsel",
    thumbnailColor: "var(--purple)",
  },
  {
    id: "4",
    slug: "elizabeth-holmes",
    title: "USA v. Elizabeth Holmes",
    court: "N.D. Cal.",
    description:
      "The federal fraud trial of Theranos founder Elizabeth Holmes, who was convicted of defrauding investors with false claims about her company's blood-testing technology capabilities.",
    publisher: "biotech_watch",
    thumbnailColor: "var(--orange)",
  },
  {
    id: "5",
    slug: "google-v-oracle",
    title: "Google LLC v. Oracle America",
    court: "U.S. Supreme Court",
    description:
      "A decade-long Supreme Court copyright dispute over Google's use of Java APIs in the Android operating system. The ruling established key precedents for software fair use doctrine.",
    publisher: "scotus_digest",
    thumbnailColor: "var(--green)",
  },
  {
    id: "6",
    slug: "sam-bankman-fried",
    title: "USA v. Sam Bankman-Fried",
    court: "S.D.N.Y.",
    description:
      "The criminal prosecution of FTX founder Sam Bankman-Fried on charges of fraud, conspiracy, and money laundering tied to the collapse of the cryptocurrency exchange.",
    publisher: "finlaw_daily",
    thumbnailColor: "var(--amber)",
  },
  {
    id: "7",
    slug: "twitter-v-musk",
    title: "Twitter v. Elon Musk",
    court: "Del. Ch.",
    description:
      "Twitter sued Elon Musk in Delaware Chancery Court to enforce the $44 billion acquisition agreement after Musk attempted to withdraw from the deal citing bot account concerns.",
    publisher: "deal_watch",
    thumbnailColor: "var(--pink)",
  },
  {
    id: "8",
    slug: "dominion-v-fox",
    title: "Dominion v. Fox News",
    court: "Del. Super.",
    description:
      "Dominion Voting Systems filed a $1.6 billion defamation lawsuit against Fox News for broadcasting false claims about election fraud involving its voting machines after the 2020 election.",
    publisher: "media_law",
    thumbnailColor: "var(--red)",
  },
  {
    id: "9",
    slug: "r-kelly",
    title: "USA v. R. Kelly",
    court: "E.D.N.Y.",
    description:
      "The federal racketeering and sex trafficking prosecution of R&B singer R. Kelly, resulting in conviction on all counts and a landmark sentence for decades of abuse.",
    publisher: "justice_report",
    thumbnailColor: "var(--purple)",
  },
  {
    id: "10",
    slug: "obergefell-v-hodges",
    title: "Obergefell v. Hodges",
    court: "U.S. Supreme Court",
    description:
      "The landmark Supreme Court decision establishing the constitutional right to same-sex marriage under the Fourteenth Amendment, transforming civil rights law nationwide.",
    publisher: "civil_rights_law",
    thumbnailColor: "var(--cyan)",
  },
]

/* ------------------------------------------------------------------ */
/*  Helper: get initials from case title                               */
/* ------------------------------------------------------------------ */

function getInitials(title: string): string {
  const parts = title.split(" v. ")
  if (parts.length === 2) {
    return (
      parts[0].trim().charAt(0).toUpperCase() +
      parts[1].trim().charAt(0).toUpperCase()
    )
  }
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
}

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div
      className={cn(
        "border-[2.5px] border-border-light bg-card",
        "p-0 overflow-hidden animate-pulse"
      )}
      style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
    >
      <div className="h-32 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted w-3/4" />
        <div className="h-3 bg-muted w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-muted w-full" />
          <div className="h-3 bg-muted w-5/6" />
        </div>
        <div className="h-3 bg-muted w-1/2" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Browse Content (inner, needs ToastProvider ancestor)                */
/* ------------------------------------------------------------------ */

function BrowseContent() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Debounced search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Filtered cases
  const filteredCases = useMemo(() => {
    if (!debouncedQuery.trim()) return FEATURED_CASES
    const q = debouncedQuery.toLowerCase()
    return FEATURED_CASES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.court.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.publisher.toLowerCase().includes(q)
    )
  }, [debouncedQuery])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---- NAV ---- */}
      <nav>
        <div className="h-1 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)]" />

        <div
          className={cn(
            "relative px-5 py-3",
            "flex items-center justify-between",
            "bg-foreground dark:bg-surface"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 flex items-baseline gap-1 cursor-pointer group"
          >
            <span className="font-sans text-xl font-black text-background dark:text-foreground transition-colors group-hover:text-primary">
              legal
            </span>
            <span className="font-sans text-xl font-black text-red dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-pink dark:via-purple dark:to-cyan">
              drama
            </span>
            <span className="font-mono text-sm text-pink">.ai</span>
          </Link>

          {/* Right nav items */}
          <div className="relative z-10 flex items-center gap-2">
            <Link
              href="/"
              className="font-mono text-[11px] text-muted-foreground cursor-pointer font-semibold hover:text-foreground transition-colors hidden md:block"
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="font-mono text-[11px] text-background dark:text-foreground cursor-pointer font-bold transition-colors hidden md:block"
              style={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
            >
              Browse
            </Link>
            <span
              onClick={() =>
                toast("Pricing: $99 / $499 / $59mo", "var(--purple)")
              }
              className="font-mono text-[11px] text-muted-foreground cursor-pointer font-semibold hover:text-foreground transition-colors hidden md:block"
            >
              Pricing
            </span>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn(
                "brut-press w-10 h-10 flex items-center justify-center",
                "border-[2.5px] transition-all duration-300",
                isDark
                  ? "bg-surface-alt text-purple border-purple/50 hover:border-purple"
                  : "bg-background text-orange border-orange/50 hover:border-orange"
              )}
              style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
              suppressHydrationWarning
            >
              {mounted ? (
                isDark ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/"
              className={cn(
                "brut-press h-10 px-4 flex items-center justify-center",
                "border-[2.5px] border-red bg-red text-white",
                "font-mono text-xs font-bold",
                "cursor-pointer transition-all duration-200"
              )}
              style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- MAIN CONTENT ---- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale
              size={28}
              className="text-primary"
              strokeWidth={2.5}
            />
            <h1 className="font-sans font-extrabold text-3xl text-foreground">
              Browse Featured Cases
            </h1>
          </div>
          <p className="font-serif text-lg" style={{ color: "var(--muted-foreground)" }}>
            Explore real federal cases brought to life
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <div
            className={cn(
              "flex items-center gap-2",
              "border-[2.5px] border-border bg-card",
              "px-3 py-2"
            )}
            style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
          >
            <Search
              size={18}
              className="shrink-0"
              style={{ color: "var(--muted-foreground)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case name, court, or keyword..."
              className={cn(
                "w-full bg-transparent outline-none",
                "font-mono text-sm text-foreground",
                "placeholder:text-muted-foreground"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {debouncedQuery && (
            <p className="font-mono text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              {filteredCases.length} result{filteredCases.length !== 1 ? "s" : ""} for &quot;{debouncedQuery}&quot;
            </p>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          /* Empty state */
          <div
            className={cn(
              "border-[2.5px] border-border bg-card",
              "flex flex-col items-center justify-center py-20 px-6 text-center"
            )}
            style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
          >
            <BookOpen
              size={48}
              className="mb-4"
              style={{ color: "var(--muted-foreground)" }}
            />
            <p className="font-sans font-bold text-lg text-foreground mb-2">
              No cases match your search
            </p>
            <p
              className="font-serif text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Try different keywords or clear the search to browse all featured cases.
            </p>
          </div>
        ) : (
          /* Cases grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/case/${caseItem.slug}`}
                className="block group"
              >
                <div
                  className={cn(
                    "brut-lift border-[2.5px] border-border bg-card",
                    "overflow-hidden cursor-pointer",
                    "transition-all duration-150"
                  )}
                  style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className="h-32 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: caseItem.thumbnailColor }}
                  >
                    <span className="font-sans font-black text-4xl text-white/90 select-none">
                      {getInitials(caseItem.title)}
                    </span>
                    <Gavel
                      size={64}
                      className="absolute -bottom-2 -right-2 text-white/10"
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {/* Title */}
                    <h2 className="font-sans font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                      {caseItem.title}
                    </h2>

                    {/* Court */}
                    <p
                      className="font-mono text-[11px] font-medium mb-2"
                      style={{ color: "var(--cyan)" }}
                    >
                      {caseItem.court}
                    </p>

                    {/* Description - truncated to 3 lines */}
                    <p
                      className="font-serif text-sm leading-relaxed mb-3 line-clamp-3"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {caseItem.description}
                    </p>

                    {/* Publisher */}
                    <p
                      className="font-mono text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Published by{" "}
                      <span className="font-semibold text-foreground">
                        @{caseItem.publisher}
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer note */}
        {!isLoading && filteredCases.length > 0 && (
          <p
            className="font-mono text-xs text-center mt-10"
            style={{ color: "var(--muted-foreground)" }}
          >
            {FEATURED_CASES.length} featured cases available. More coming soon.
          </p>
        )}
      </main>
    </div>
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
