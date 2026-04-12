"use client"

import { cn } from "@/lib/utils"

interface ChipProps {
  children: React.ReactNode
  color?: string
  mono?: boolean
  bold?: boolean
  className?: string
}

export function Chip({ children, color, mono = false, bold = false, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5",
        "text-[10px] whitespace-nowrap",
        "border transition-theme",
        mono ? "font-mono" : "font-sans",
        bold ? "font-extrabold" : "font-semibold",
        // Light mode
        "border-border shadow-[2px_2px_0_var(--shadow-color)]",
        // Dark mode (Dracula glow)
        "-sm dark:shadow-none",
        className
      )}
      style={{
        backgroundColor: color ? `color-mix(in srgb, ${color} 15%, transparent)` : undefined,
        color: color || undefined,
        borderColor: color ? `color-mix(in srgb, ${color} 50%, var(--border))` : undefined,
      }}
    >
      {children}
    </span>
  )
}

interface TierBadgeProps {
  tier: 1 | 2
  className?: string
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const isT1 = tier === 1
  
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5",
        "text-[9px] font-mono font-extrabold",
        "border transition-theme",
        // Light mode
        "rounded-none",
        // Dark mode
        "-sm",
        isT1 
          ? "bg-yellow text-background border-yellow/80 dark:bg-yellow dark:text-background dark:border-yellow/50" 
          : "bg-surface-alt text-foreground border-border dark:bg-surface-alt dark:text-foreground dark:border-border/50",
        className
      )}
    >
      {isT1 ? "T1" : "T2"}
    </span>
  )
}

interface LaneBadgeProps {
  lane: "factual" | "procedural" | "scheduling"
  className?: string
}

export function LaneBadge({ lane, className }: LaneBadgeProps) {
  const config = {
    factual: { label: "FACTUAL", colorVar: "var(--lane-factual)" },
    procedural: { label: "PROCEDURAL", colorVar: "var(--lane-procedural)" },
    scheduling: { label: "SCHEDULING", colorVar: "var(--lane-scheduling)" },
  }
  
  const { label, colorVar } = config[lane]
  
  return (
    <Chip color={colorVar} mono bold className={className}>
      {label}
    </Chip>
  )
}
