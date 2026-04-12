"use client"

import { cn } from "@/lib/utils"

interface LegalToggleProps {
  active: boolean
  onToggle: () => void
  color?: string
  disabled?: boolean
  className?: string
}

export function LegalToggle({ active, onToggle, color, disabled = false, className }: LegalToggleProps) {
  const activeColor = color || "var(--green)"
  
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      className={cn(
        "relative w-[34px] h-[18px] flex-shrink-0",
        "border transition-all duration-200 cursor-pointer",
        // Light mode
        "rounded-none",
        // Dark mode
        "-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        backgroundColor: active ? activeColor : "var(--surface-alt)",
        borderColor: active ? activeColor : "var(--border)",
        boxShadow: active ? `0 0 8px ${activeColor}40` : "none",
      }}
    >
      <div
        className={cn(
          "absolute top-0.5 w-3 h-3 transition-all duration-200",
          // Light mode
          "rounded-none",
          // Dark mode
          "-full"
        )}
        style={{
          left: active ? 18 : 2,
          backgroundColor: active ? "#FFF" : "var(--muted-foreground)",
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

export function LegalCheckbox({ checked, onCheck, color, disabled = false, className }: LegalCheckboxProps) {
  const activeColor = color || "var(--primary)"
  
  return (
    <div
      onClick={disabled ? undefined : onCheck}
      className={cn(
        "w-3.5 h-3.5 flex items-center justify-center",
        "border-2 transition-all duration-150 cursor-pointer",
        // Light mode
        "rounded-none",
        // Dark mode
        "-sm",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{
        borderColor: checked ? activeColor : "var(--muted-foreground)",
        backgroundColor: checked ? activeColor : "transparent",
      }}
    >
      {checked && (
        <span className="text-[9px] font-black text-white">
          &#10003;
        </span>
      )}
    </div>
  )
}
