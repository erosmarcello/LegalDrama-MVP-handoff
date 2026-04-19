"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { SettingsLauncher } from "@/components/settings-launcher"

interface MastheadProps {
  onSettingsClick?: () => void
  showSettings?: boolean
  pacerConnected?: boolean
  className?: string
  onSignIn?: () => void
  user?: { email: string; name: string } | null
  onSignOut?: () => void
  /** Optional search input in the masthead (e.g. dashboard/browse). */
  showSearch?: boolean
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  searchValue?: string
}

const NAV_LINKS = [
  { href: "/browse", label: "Active Trials" },
  { href: "/dashboard", label: "Discovery Archive" },
  { href: "/pricing", label: "Appellate" },
]

/**
 * Cinema-noir masthead.
 *
 * Visual language borrowed from "Law & Order title sequence meets PACER
 * database": condensed Anton wordmark, aged-gold metadata, wide-tracked
 * nav in JetBrains Mono, pulsing red live indicator.
 */
export function Masthead({
  onSignIn,
  user,
  onSignOut,
  pacerConnected = true,
  className,
  showSearch = false,
  searchPlaceholder = "Enter case # or name",
  onSearchChange,
  searchValue,
}: MastheadProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[var(--border)]",
        "bg-[#0a0a0a]/95 backdrop-blur-sm",
        "cinema-grain",
        className
      )}
    >
      <div className="relative z-10 max-w-[1600px] mx-auto px-5 md:px-8 h-14 flex items-center justify-between gap-6">
        {/* ── Brand + nav ── */}
        <div className="flex items-center gap-10 min-w-0">
          <Link
            href="/"
            className="flex items-baseline gap-1 select-none group shrink-0"
          >
            <span
              className="cinema-title text-[22px] md:text-[26px] text-white leading-none"
              style={{ textShadow: "1px 1px 0 #000" }}
            >
              LEGAL
            </span>
            <span
              className="cinema-title text-[22px] md:text-[26px] leading-none"
              style={{ color: "var(--red)", textShadow: "1px 1px 0 #000" }}
            >
              DRAMA
            </span>
            <span className="cinema-label text-[9px] text-[var(--gold)] tracking-[0.2em] ml-0.5 hidden sm:inline">
              .AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(link => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "cinema-label text-[11px] transition-colors relative",
                    "py-1",
                    isActive
                      ? "text-white"
                      : "text-[var(--muted-foreground)] hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute -bottom-[15px] left-0 right-0 h-[2px]"
                      style={{ background: "var(--red)" }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {showSearch && (
            <div className="hidden md:flex items-center gap-2 border-b border-[var(--border)] hover:border-[var(--gold)] focus-within:border-[var(--gold)] transition-colors pb-1 min-w-[220px]">
              <Search size={12} className="text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchValue ?? ""}
                onChange={e => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "flex-1 bg-transparent outline-none",
                  "cinema-label text-[11px] text-white",
                  "placeholder:text-[var(--muted-foreground)] placeholder:tracking-[0.12em]"
                )}
              />
            </div>
          )}

          {/* Live PACER status */}
          {pacerConnected && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="cinema-pulse-dot" aria-hidden />
              <span className="cinema-label text-[10px] text-[var(--muted-foreground)]">
                PACER Synced
              </span>
            </div>
          )}

          <SettingsLauncher variant="chip" />

          {user ? (
            <button
              onClick={onSignOut}
              title="Sign out"
              className={cn(
                "w-9 h-9 flex items-center justify-center",
                "border border-[var(--gold)] bg-transparent",
                "cinema-label text-[12px] text-[var(--gold)]",
                "hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-colors"
              )}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className={cn(
                "h-8 px-4 flex items-center justify-center",
                "border border-white bg-white text-[#0a0a0a]",
                "cinema-label text-[10px]",
                "hover:bg-[var(--gold)] hover:border-[var(--gold)] transition-colors"
              )}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
