"use client"

import Link from "next/link"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsLauncherProps {
  /** Optional className appended to the trigger button. */
  className?: string
  /**
   * Visual variant.
   * - `square`: 36×36 noir square tile.
   * - `chip`:   compact icon-only button for top navbars.
   *
   * Both variants are icon-only — the previous "Settings" text label
   * was removed per product direction. The gear icon plus tooltip
   * is enough.
   */
  variant?: "square" | "chip"
}

/**
 * Persistent Settings launcher.
 *
 * Previously this opened a floating `SettingsModal` pop-up. Per product
 * direction we now have a full-site `/settings` route, so this becomes a
 * thin Link wrapper that navigates the user there. The styling, hover
 * rotation, and tooltip are preserved — only the behavior flips from
 * "open modal" to "navigate to settings site."
 */
export function SettingsLauncher({
  className,
  variant = "chip",
}: SettingsLauncherProps) {
  return (
    <Link
      href="/settings"
      aria-label="Open settings"
      title="Settings"
      className={cn(
        "group inline-flex items-center justify-center",
        "border transition-colors duration-150",
        variant === "square" ? "w-9 h-9" : "w-8 h-8",
        "border-[var(--border)] bg-transparent text-[var(--foreground)]/60",
        "hover:border-[var(--gold)] hover:text-[var(--gold)]",
        className
      )}
    >
      <Settings
        size={variant === "square" ? 15 : 13}
        className="transition-transform group-hover:rotate-45"
      />
    </Link>
  )
}
