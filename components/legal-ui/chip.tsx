"use client"

import { cn } from "@/lib/utils"

interface ChipProps {
  children: React.ReactNode
  color?: string
  mono?: boolean
  bold?: boolean
  className?: string
}

/**
 * Cinema-noir chip — thin border, tiny contract-font label,
 * subtle tinted background when an accent color is provided.
 */
export function Chip({
  children,
  color,
  mono = false,
  bold = false,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5",
        "text-[9px] whitespace-nowrap border transition-colors",
        mono ? "cinema-label" : "cinema-contract-tight",
        bold ? "font-bold" : "font-semibold",
        className
      )}
      style={{
        backgroundColor: color
          ? `color-mix(in srgb, ${color} 10%, transparent)`
          : "transparent",
        color: color || "var(--muted-foreground)",
        borderColor: color
          ? `color-mix(in srgb, ${color} 45%, var(--border))`
          : "var(--border)",
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
        "inline-block px-1.5 py-0.5 text-[9px] cinema-label",
        "border transition-colors",
        className
      )}
      style={{
        backgroundColor: isT1
          ? "color-mix(in srgb, var(--gold) 15%, transparent)"
          : "transparent",
        color: isT1 ? "var(--gold)" : "var(--muted-foreground)",
        borderColor: isT1 ? "var(--gold)" : "var(--border)",
      }}
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
