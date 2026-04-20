"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, LogOut, User as UserIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { SettingsLauncher } from "@/components/settings-launcher"
import { useAuth, type AuthUser } from "@/lib/auth-context"

interface MastheadProps {
  onSettingsClick?: () => void
  showSettings?: boolean
  pacerConnected?: boolean
  className?: string
  onSignIn?: () => void
  /**
   * Optional user override. When omitted, the masthead reads from the
   * global `AuthProvider` context so sign-in state persists across all
   * routes (Luigi Mangione demo in particular).
   */
  user?: AuthUser | null
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
 * Visual language borrowed from "Law & Order title sequence meets federal
 * case archive": condensed Anton wordmark, aged-gold metadata, wide-tracked
 * nav in JetBrains Mono, pulsing red live indicator.
 *
 * Signed-in state: the "Sign In" button becomes a circular profile photo
 * with a thin gold ring. Clicking opens a tiny dropdown (name, email,
 * sign-out).
 */
export function Masthead({
  onSignIn,
  user: userProp,
  onSignOut,
  pacerConnected = false,
  showSettings = false,
  className,
  showSearch = false,
  searchPlaceholder = "Enter case # or name",
  onSearchChange,
  searchValue,
}: MastheadProps) {
  const pathname = usePathname()
  const auth = useAuth()

  // userProp wins when explicitly provided, else fall back to context.
  const user = userProp === undefined ? auth.user : userProp

  const handleSignOut = () => {
    if (onSignOut) onSignOut()
    else auth.signOut()
  }

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

          {/* Live PACER status — only when page opts in (case page only) */}
          {pacerConnected && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="cinema-pulse-dot" aria-hidden />
              <span className="cinema-label text-[10px] text-[var(--muted-foreground)]">
                PACER Synced
              </span>
            </div>
          )}

          {/* Settings launcher — icon-only */}
          {showSettings && <SettingsLauncher variant="chip" />}

          {user ? (
            <UserAvatarMenu user={user} onSignOut={handleSignOut} />
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

/* ------------------------------------------------------------------ */
/*  UserAvatarMenu — circular noir avatar with dropdown                */
/* ------------------------------------------------------------------ */

function UserAvatarMenu({
  user,
  onSignOut,
}: {
  user: AuthUser
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open])

  const initial = (user.name?.charAt(0) || user.email.charAt(0) || "?").toUpperCase()
  const displayName = user.name || user.email.split("@")[0]

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`Signed in as ${displayName}`}
        title={displayName}
        className={cn(
          "relative w-9 h-9 rounded-full overflow-hidden",
          "border border-[var(--gold)]",
          "bg-[#0a0a0a] text-[var(--gold)]",
          "cinema-label text-[12px]",
          "transition-transform hover:scale-105",
          "flex items-center justify-center"
        )}
      >
        {user.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatar}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={e => {
              // If the image fails, hide it and fall through to initial
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <span>{initial}</span>
        )}
        {/* Always render the initial behind the image as fallback */}
        {!user.avatar && <span aria-hidden>{initial}</span>}
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] right-0 z-[60]",
            "min-w-[220px]",
            "border border-[var(--border)] bg-[#0f0f0f]",
            "cinema-grain",
            "shadow-[0_30px_80px_rgba(0,0,0,0.7)]",
            "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[var(--gold)]"
          )}
        >
          <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--gold)] bg-[#0a0a0a] flex items-center justify-center text-[var(--gold)] cinema-label text-[13px]">
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="leading-tight min-w-0">
                <div className="cinema-label text-[10px] text-[var(--gold)] truncate">
                  {displayName}
                </div>
                <div className="cinema-contract text-[10px] text-white/60 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          <div className="py-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-4 py-2",
                "cinema-label text-[10px] text-white/70",
                "hover:text-[var(--gold)] hover:bg-white/5 transition-colors"
              )}
            >
              <UserIcon size={12} />
              Account · Settings
            </Link>
            <button
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2",
                "cinema-label text-[10px] text-white/70",
                "hover:text-[var(--red)] hover:bg-white/5 transition-colors"
              )}
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
