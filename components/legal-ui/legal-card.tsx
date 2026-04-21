"use client"

import { cn } from "@/lib/utils"

interface LegalCardProps {
  children: React.ReactNode
  color?: string
  animated?: boolean
  delay?: number
  className?: string
  onClick?: () => void
}

/**
 * Cinema-noir card — thin 1px border against the film surface,
 * optional left-lane color accent, subtle hover that brightens
 * the border to gold instead of translating the element.
 */
export function LegalCard({
  children,
  color,
  animated = false,
  delay = 0,
  className,
  onClick,
}: LegalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative border border-[var(--border)] bg-[var(--card)] p-4",
        "transition-colors duration-150",
        animated && "animate-card-in",
        onClick &&
          "cursor-pointer hover:border-[var(--gold)]",
        className
      )}
      style={{
        borderLeftColor: color,
        borderLeftWidth: color ? 2 : undefined,
        animationDelay: animated ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  )
}

interface LegalSectionProps {
  title: string
  icon?: React.ReactNode
  count?: number
  color?: string
  children?: React.ReactNode
  className?: string
}

export function LegalSection({
  title,
  icon,
  count,
  color,
  children,
  className,
}: LegalSectionProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span
          className="cinema-label text-[10px]"
          style={{ color: color || "var(--gold)" }}
        >
          {title}
        </span>
        {count != null && (
          <span className="cinema-label text-[8px] text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)]">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

interface LegalPanelProps {
  children: React.ReactNode
  className?: string
}

export function LegalPanel({ children, className }: LegalPanelProps) {
  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--border)] p-4",
        "animate-panel-in",
        className
      )}
    >
      {children}
    </div>
  )
}
