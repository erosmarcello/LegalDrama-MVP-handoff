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

export function LegalTabs({
  tabs,
  active,
  onChange,
  className,
  size = "md",
}: LegalTabsProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-[9px]",
    md: "px-3 py-1.5 text-[10px]",
    lg: "px-4 py-2 text-xs",
  }

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5",
              sizeClasses[size],
              "font-mono font-bold uppercase tracking-wider",
              "border-2 transition-all duration-150",
              "",
              isActive
                ? "bg-primary/15 border-primary text-primary shadow-brutal-sm dark:shadow-none"
                : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
            )}
          >
            {Icon && <Icon size={iconSizes[size]} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[8px] font-bold",
                  "rounded-full",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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

// Vertical tabs variant
interface LegalTabsVerticalProps extends LegalTabsProps {
  fullWidth?: boolean
}

export function LegalTabsVertical({
  tabs,
  active,
  onChange,
  className,
  size = "md",
  fullWidth = true,
}: LegalTabsVerticalProps) {
  const sizeClasses = {
    sm: "px-2 py-1.5 text-[9px]",
    md: "px-3 py-2 text-[10px]",
    lg: "px-4 py-2.5 text-xs",
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.key === active
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex items-center gap-2",
              sizeClasses[size],
              fullWidth && "w-full",
              "font-mono font-bold uppercase tracking-wider",
              "border-2 border-l-4 transition-all duration-150",
              "text-left",
              "",
              isActive
                ? "bg-primary/15 border-border border-l-primary text-primary"
                : "bg-surface border-border border-l-transparent text-muted-foreground hover:text-foreground hover:border-l-foreground/30"
            )}
          >
            {Icon && <Icon size={iconSizes[size]} />}
            <span className="flex-1">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[8px] font-bold",
                  "rounded-full",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
