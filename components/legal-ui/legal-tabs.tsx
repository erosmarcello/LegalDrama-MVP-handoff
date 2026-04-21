"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  key: string
  label: string
  icon?: LucideIcon
  badge?: number | string
}

interface LegalTabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

/**
 * Cinema-noir horizontal tabs. Active tab is marked with a red underline
 * rule (like a title-card section break), not a filled background.
 */
export function LegalTabs({
  tabs,
  active,
  onChange,
  className,
  size = "md",
}: LegalTabsProps) {
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-[9px]",
    md: "px-3.5 py-2 text-[10px]",
    lg: "px-4 py-2.5 text-[11px]",
  }

  const iconSizes = { sm: 10, md: 12, lg: 14 }

  return (
    <div
      className={cn(
        "flex items-center gap-0 border-b border-[var(--border)]",
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5",
              sizeClasses[size],
              "cinema-label transition-colors duration-150",
              isActive
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {Icon && <Icon size={iconSizes[size]} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[8px] cinema-label border",
                  isActive
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                )}
              >
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span
                className="absolute -bottom-px left-0 right-0 h-[2px]"
                style={{ background: "var(--red)" }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

interface LegalTabsVerticalProps extends LegalTabsProps {
  fullWidth?: boolean
}

/**
 * Cinema-noir vertical tabs — left rule colored gold on active.
 */
export function LegalTabsVertical({
  tabs,
  active,
  onChange,
  className,
  size = "md",
  fullWidth = true,
}: LegalTabsVerticalProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-[9px]",
    md: "px-3.5 py-2.5 text-[10px]",
    lg: "px-4 py-3 text-[11px]",
  }

  const iconSizes = { sm: 12, md: 14, lg: 16 }

  return (
    <div className={cn("flex flex-col", className)}>
      {tabs.map(tab => {
        const isActive = tab.key === active
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex items-center gap-2 text-left",
              sizeClasses[size],
              fullWidth && "w-full",
              "cinema-label transition-colors duration-150",
              "border-l-2",
              isActive
                ? "text-[var(--foreground)] bg-[var(--card)] border-l-[var(--gold)]"
                : "text-[var(--muted-foreground)] border-l-transparent hover:text-[var(--foreground)] hover:bg-[var(--card)]"
            )}
          >
            {Icon && <Icon size={iconSizes[size]} />}
            <span className="flex-1">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[8px] cinema-label border",
                  isActive
                    ? "border-[var(--gold)] text-[var(--gold)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)]"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
