"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MastheadProps {
  onSettingsClick?: () => void
  showSettings?: boolean
  pacerConnected?: boolean
  className?: string
  onSignIn?: () => void
  user?: { email: string; name: string } | null
  onSignOut?: () => void
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/pricing", label: "Pricing" },
]

export function Masthead({ onSignIn, user, onSignOut, className }: MastheadProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "border-b-[2.5px] border-[var(--border)]",
        "bg-[var(--card)] dark:bg-[var(--surface)]",
        className
      )}
    >
      <div className="px-5 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-0.5 cursor-pointer group">
            <span className="font-sans text-xl font-extrabold text-[var(--foreground)] transition-colors group-hover:text-[var(--red)]">
              legal
            </span>
            <span className="font-sans text-xl font-extrabold text-[var(--red)]">
              drama
            </span>
            <span className="font-mono text-sm text-[var(--pink)]">
              .ai
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 font-sans text-sm font-semibold transition-colors",
                    isActive
                      ? "text-[var(--foreground)] border-b-[2.5px] border-[var(--amber)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--amber)]"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onSignOut}
                title="Sign out"
                className={cn(
                  "w-9 h-9 flex items-center justify-center",
                  "bg-[var(--purple)] text-[var(--background)]",
                  "font-mono text-sm font-black",
                  "border-[2.5px] border-[var(--purple)]",
                  "brut-press shadow-[2px_2px_0px_var(--shadow-color)]"
                )}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className={cn(
                "h-9 px-4 flex items-center justify-center",
                "border-[2.5px] border-[var(--red)] bg-[var(--red)] text-white",
                "font-mono text-xs font-bold",
                "brut-press shadow-[2px_2px_0px_var(--shadow-color)]",
                "hover:opacity-90"
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
