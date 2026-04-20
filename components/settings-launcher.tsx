"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { SettingsModal } from "@/components/settings-modal"

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
 * Persistent Settings launcher. Icon-only noir gear trigger that opens
 * the full `SettingsModal`. Tooltip carries the label; the visual chrome
 * stays out of the way.
 */
export function SettingsLauncher({
  className,
  variant = "chip",
}: SettingsLauncherProps) {
  const [open, setOpen] = useState(false)

  const sharedButton = (
    <button
      type="button"
      aria-label="Open settings"
      title="Settings"
      onClick={() => setOpen(true)}
      className={cn(
        "group inline-flex items-center justify-center",
        "border transition-colors duration-150",
        variant === "square" ? "w-9 h-9" : "w-8 h-8",
        "border-[var(--border)] bg-transparent text-white/60",
        "hover:border-[var(--gold)] hover:text-[var(--gold)]",
        className
      )}
    >
      <Settings
        size={variant === "square" ? 15 : 13}
        className="transition-transform group-hover:rotate-45"
      />
    </button>
  )

  return (
    <>
      {sharedButton}
      <SettingsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
