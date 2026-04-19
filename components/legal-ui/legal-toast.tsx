"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  message: string
  color?: string
}

interface ToastContextType {
  toast: (message: string, color?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, color?: string) => {
    const id = Math.random().toString(36).slice(2, 11)
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

/**
 * Cinema-noir toast — deep black card with a thin accent-color top rule
 * and a cinema-label message. Reads like a title card insert.
 */
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center">
      {toasts.map(t => {
        const accent = t.color || "var(--gold)"
        return (
          <div
            key={t.id}
            className={cn(
              "relative px-5 py-2.5 min-w-[200px] text-center",
              "cinema-label text-[10px] text-white",
              "bg-[#0f0f0f] border border-[var(--border)]",
              "animate-toast whitespace-nowrap shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            )}
            style={{ borderTop: `2px solid ${accent}` }}
          >
            {t.message}
          </div>
        )
      })}
    </div>
  )
}
