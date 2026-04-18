"use client"

import { cn } from "@/lib/utils"
import { DRAMA_LEVELS, type DramaLevel } from "@/lib/case-data"

interface DramaLevelSliderProps {
  /** Current drama level (0..DRAMA_LEVELS.length - 1). */
  value: DramaLevel
  /** Called when the user picks a new level. */
  onChange: (next: DramaLevel) => void
  /**
   * Human-readable name of the entity this slider controls (character,
   * location, stake, etc.). Used for the `aria-label` on the radiogroup.
   */
  entityName: string
  /** Optional wrapper classes appended to the outer div. */
  className?: string
}

/**
 * Brutalist 5-stop parametric slider used to swap an entity's prose between
 * drama registers (Court Record → Mythic). Shared by characters and
 * locations; a stake / theme slider would reuse this as-is.
 *
 * Accessibility: the row is a `radiogroup`, each stop is a `radio`. Left /
 * right / up / down / Home / End keys all work. Only the active stop is in
 * the tab order, matching the ARIA radio pattern.
 */
export function DramaLevelSlider({
  value,
  onChange,
  entityName,
  className,
}: DramaLevelSliderProps) {
  const maxIndex = DRAMA_LEVELS.length - 1
  const activeLevel = DRAMA_LEVELS[value]

  const move = (next: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, next)) as DramaLevel
    if (clamped !== value) onChange(clamped)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          Drama · L{value}
        </div>
        <div
          className="font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ color: activeLevel.color }}
        >
          {activeLevel.label}
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label={`Drama level for ${entityName}`}
        className="flex gap-1"
      >
        {DRAMA_LEVELS.map((dl) => {
          const active = dl.id === value
          const filled = dl.id <= value
          return (
            <button
              key={dl.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${dl.label} (level ${dl.id})`}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(dl.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault()
                  move(value + 1)
                } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault()
                  move(value - 1)
                } else if (e.key === "Home") {
                  e.preventDefault()
                  move(0)
                } else if (e.key === "End") {
                  e.preventDefault()
                  move(maxIndex)
                }
              }}
              title={dl.label}
              className={cn(
                "flex-1 h-3.5 border-[2px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                active
                  ? "border-[var(--foreground)] shadow-[1px_1px_0_var(--shadow-color)]"
                  : "border-[var(--border)] hover:border-[var(--foreground)]/60",
              )}
              style={{
                backgroundColor: filled ? dl.color : "transparent",
                opacity: filled ? 1 : 0.35,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
