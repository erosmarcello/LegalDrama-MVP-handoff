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
   * - `square`: 40×40 brutalist square, matches the case-page nav gear.
   * - `chip`:  inline pill-ish chip, matches the home/browse/pricing nav rhythm.
   */
  variant?: "square" | "chip"
}

/**
 * Persistent Settings launcher. Wraps a brutalist gear trigger around
 * the existing `SettingsModal` so any page can drop a single
 * `<SettingsLauncher />` into its top nav and get the full Settings UX
 * without re-plumbing modal state.
 */
export function SettingsLauncher({ className, variant = "chip" }: SettingsLauncherProps) {
  const [open, setOpen] = useState(false)

  const trigger =
    variant === "square" ? (
      <button
        type="button"
        aria-label="Open settings"
        title="Settings"
        onClick={() => setOpen(true)}
        className={cn(
          "w-10 h-10 flex items-center justify-center group",
          "border-2 border-border bg-background dark:bg-surface-alt text-muted-foreground",
          "hover:text-foreground hover:border-green hover:shadow-[0_0_15px_var(--green)]",
          "rounded-none transition-all duration-200 click-scale",
          className
        )}
      >
        <Settings
          size={18}
          className="transition-transform group-hover:rotate-90"
        />
      </button>
    ) : (
      <button
        type="button"
        aria-label="Open settings"
        title="Settings"
        onClick={() => setOpen(true)}
        className={cn(
          "brut-press group inline-flex items-center gap-1.5 px-3 py-1.5",
          "font-mono text-[11px] font-bold",
          "transition-all duration-200",
          className
        )}
        style={{
          border: "2.5px solid var(--border)",
          background: "var(--surface)",
          color: "var(--foreground)",
          borderRadius: 0,
        }}
      >
        <Settings
          size={13}
          className="transition-transform group-hover:rotate-90"
        />
        <span className="hidden sm:inline">Settings</span>
      </button>
    )

  return (
    <>
      {trigger}
      <SettingsModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
