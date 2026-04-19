"use client"

import { useState } from "react"
import { LegalModal, LegalInput, LegalButton } from "@/components/legal-ui"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onAuth: (user: { email: string; name: string }) => void
  initialMode?: "signin" | "signup"
}

export function AuthModal({
  open,
  onClose,
  onAuth,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = () => {
    if (!email || !password) {
      setError("All fields required")
      triggerShake()
      return
    }
    if (!email.includes("@")) {
      setError("Valid email required")
      triggerShake()
      return
    }
    if (password.length < 4) {
      setError("Password too short")
      triggerShake()
      return
    }
    if (mode === "signup" && !name) {
      setError("Name is required")
      triggerShake()
      return
    }
    setError("")
    onAuth({ email, name: name || email.split("@")[0] })
  }

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin")
    setError("")
  }

  return (
    <LegalModal open={open} onClose={onClose} title="" shake={shake} maxWidth="420px">
      <div className="-m-5">
        {/* Brand header — cinema title card */}
        <div className="px-6 pt-7 pb-5 border-b border-[var(--border)] bg-black/40 text-center">
          <div className="cinema-label text-[9px] text-[var(--gold)] mb-2">
            The People · v. · Anonymous
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="cinema-title text-[28px] text-white">legal</span>
            <span className="cinema-title text-[28px] text-[var(--red)]">drama</span>
            <span className="cinema-label text-[11px] text-[var(--gold)] ml-1">.AI</span>
          </div>
          <p className="cinema-contract-italic text-[10px] text-white/60 mt-3">
            {mode === "signin"
              ? "Return to chambers. Your docket awaits."
              : "Enter the record. Five searches on the house."}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="px-6 pt-5">
          <div className="flex border-b border-[var(--border)]">
            {[
              { key: "signin", label: "Sign In" },
              { key: "signup", label: "Sign Up" },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key as "signin" | "signup")
                  setError("")
                }}
                className={cn(
                  "flex-1 py-2.5 cinema-label text-[10px]",
                  "border-b-2 transition-colors duration-150",
                  mode === m.key
                    ? "text-[var(--red)] border-[var(--red)]"
                    : "text-white/50 border-transparent hover:text-white"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="px-6 py-5">
          {mode === "signup" && (
            <LegalInput
              label="FULL NAME"
              placeholder="Counselor of record"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}
          <LegalInput
            label="EMAIL"
            placeholder="you@chambers.law"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <LegalInput
            label="PASSWORD"
            placeholder={mode === "signin" ? "Enter password" : "Create password"}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div
              className="mt-2 mb-3 px-3 py-2 cinema-label text-[10px]"
              style={{
                color: "var(--red)",
                backgroundColor: "rgba(220, 38, 38, 0.08)",
                borderLeft: "2px solid var(--red)",
              }}
            >
              {error}
            </div>
          )}

          <LegalButton
            color="var(--red)"
            active
            onClick={handleSubmit}
            className="w-full justify-center py-2.5 mt-2"
          >
            {mode === "signin" ? "Enter Chambers" : "Open Docket"}
          </LegalButton>

          {mode === "signin" && (
            <div className="text-center mt-4">
              <span className="cinema-label text-[9px] text-white/50 hover:text-[var(--gold)] cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>
          )}

          {mode === "signup" && (
            <div className="text-center mt-4 cinema-contract text-[9px] text-white/50 leading-relaxed">
              Continuance granted by signing up.
              <br />
              <span className="text-[var(--gold)]">5 searches</span> pro bono on
              the house.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-black/40">
          <div className="cinema-label text-[9px] text-white/40 text-center">
            {mode === "signin" ? "No docket? " : "Already filed? "}
            <span
              onClick={switchMode}
              className="text-[var(--gold)] cursor-pointer hover:underline"
            >
              {mode === "signin" ? "Open a new case" : "Return to chambers"}
            </span>
          </div>
        </div>
      </div>
    </LegalModal>
  )
}
