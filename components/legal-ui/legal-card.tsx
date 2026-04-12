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

export function LegalCard({ children, color, animated = false, delay = 0, className, onClick }: LegalCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border transition-theme",
        "p-4",
        // Light mode
        "shadow-brut",
        // Dark mode
        " dark:shadow-brut",
        animated && "animate-card-in",
        onClick && "cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none",
        className
      )}
      style={{
        borderLeftColor: color,
        borderLeftWidth: color ? 3 : undefined,
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

export function LegalSection({ title, icon, count, color, children, className }: LegalSectionProps) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span 
          className="font-mono text-[9px] font-extrabold tracking-widest uppercase"
          style={{ color: color || "var(--muted-foreground)" }}
        >
          {title}
        </span>
        {count != null && (
          <span className="font-mono text-[8px] font-bold text-muted-foreground bg-muted/50 px-1 py-0.5 -sm border border-border/40">
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
        "bg-card border border-border",
        "p-4",
        // Light mode
        "shadow-brut-lg",
        // Dark mode
        " dark:shadow-brut-lg",
        "animate-panel-in",
        className
      )}
    >
      {children}
    </div>
  )
}
