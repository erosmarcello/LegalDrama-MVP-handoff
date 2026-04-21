"use client"

import { cn } from "@/lib/utils"

interface LegalToggleProps {
  active: boolean
  onToggle: () => void
  color?: string
  disabled?: boolean
  className?: string
}

/**
 * Cinema-noir toggle. Thin 1px rule, gold fill when active, no glow.
 */
export function LegalToggle({
  active,
  onToggle,
  color,
  disabled = false,
  className,
}: LegalToggleProps) {
  const activeColor = color || "var(--gold)"

  return (
    <div
      onClick={disabled ? undefined : onToggle}
      role="switch"
      aria-checked={active}
      className={cn(
        "relative w-[34px] h-[18px] flex-shrink-0",
        "border transition-colors duration-200 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        backgroundColor: active ? activeColor : "transparent",
        borderColor: active ? activeColor : "var(--border)",
      }}
    >
      <div
        className="absolute top-[2px] w-3 h-3 transition-all duration-200"
        style={{
          left: active ? 18 : 2,
          backgroundColor: active ? "var(--background)" : "var(--muted-foreground)",
        }}
      />
    </div>
  )
}

interface LegalCheckboxProps {
  checked: boolean
  onCheck: () => void
  color?: string
  disabled?: boolean
  className?: string
}

/**
 * Cinema-noir checkbox — square thin-border box, gold fill with black
 * checkmark when active.
 */
export function LegalCheckbox({
  checked,
  onCheck,
  color,
  disabled = false,
  className,
}: LegalCheckboxProps) {
  const activeColor = color || "var(--gold)"

  return (
    <div
      onClick={disabled ? undefined : onCheck}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        "w-4 h-4 flex items-center justify-center",
        "border transition-colors duration-150 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: checked ? activeColor : "var(--border)",
        backgroundColor: checked ? activeColor : "transparent",
      }}
    >
      {checked && (
        <span
          className="text-[10px] leading-none"
          style={{ color: "var(--background)", fontWeight: 700 }}
        >
          ✓
        </span>
      )}
    </div>
  )
}
