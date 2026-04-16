"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Gavel,
  X,
  Send,
  Loader2,
  ArrowUpRight,
  Scale,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "user" | "assistant"
type ChatMessage = { role: Role; content: string }

type QuickReply = {
  label: string
  prompt?: string
  href?: string
}

const QUICK_REPLIES: QuickReply[] = [
  { label: "Story So Far", href: "/case/usa-v-mangione#story" },
  { label: "Timeline & Docket", href: "/case/usa-v-mangione#timeline" },
  { label: "Characters", href: "/case/usa-v-mangione#characters" },
  { label: "Browse cases", href: "/browse" },
  { label: "Settings", href: "/settings" },
  {
    label: "Weak points in gov's case?",
    prompt:
      "What are the likely weak points in the government's case against Luigi Mangione?",
  },
  {
    label: "Any female detectives?",
    prompt:
      "Were there any female detectives or agents involved in the Mangione investigation?",
  },
  {
    label: "Suggest a complementing character",
    prompt:
      "Suggest a defense-side character (archetype) that would complement the lead prosecutor in the Mangione case for a dramatization.",
  },
]

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Sidebar is open. Ask me anything about this case — the record, the strategy, or the cast. I can also jump you around the app. What do you want to get into?",
}

const PATH_PILL_REGEX = /`(\/[a-z0-9\-\/#]*)`/g

// ─────────────────────────────────────────────────────────────
// Scripted user-journey engine
// ─────────────────────────────────────────────────────────────
type Script = { test: RegExp; reply: string }

const SCRIPTS: Script[] = [
  // ── Chip prompts ────────────────────────────────────────────
  {
    test: /weak points|government'?s case|weak.*government|holes in the case/i,
    reply:
      "Three soft spots worth pressing, in rough order of leverage.\n\nFirst, the Altoona stop. The McDonald's encounter was a classic Terry situation that slid into a full search — if the defense argues the tip was too thin for reasonable suspicion, the notebook and the firearm come under a suppression cloud. Motion to suppress is already on the docket: `/case/usa-v-mangione#timeline`.\n\nSecond, chain of custody on the so-called manifesto. It traveled from a Pennsylvania booking room to federal evidence vaults. Any gap in that handoff gives the defense an authenticity fight right before trial.\n\nThird, the parallel state case. A simultaneous New York prosecution on overlapping facts creates jury-exposure risk and opens a narrative the defense will exploit — federal overreach on a case the state could have run cleanly.",
  },
  {
    test: /female detective|female agent|women.*investigat|woman.*detective/i,
    reply:
      "The public filings don't name any female detectives or agents on the record — the appearance sheets lead with male AUSAs and a male lead FBI case agent.\n\nThat's an opening, not a wall. NYPD's detective bureau and the S.D.N.Y. task force both have women in senior roles; court filings just don't surface everyone on a case. Assume there are female investigators whose names aren't in the docket.\n\nFor the dramatization, introduce a composite NYPD detective — the one who ran the Midtown canvass and pieced together the sidewalk video — as a grounded counterweight to the federal prosecutors. Flag her as a composite in your production notes and you're clear.",
  },
  {
    test: /suggest.*(character|archetype)|complement.*prosecutor|defense.*character|character.*complement/i,
    reply:
      "Cast the defense lead as the tonal inverse of the prosecutor.\n\nArchetype: a former S.D.N.Y. prosecutor turned defender. Early forties, has tried capital cases from both chairs, left government after a high-profile acquittal shook her. She's precise where the prosecutor is theatrical, quiet where he's loud, and she reads juries like sheet music. Karen Friedman Agnifilo is the real-world template — borrow the energy, invent the character.\n\nGive her a second chair: an appellate nerd who lives in the statute and never addresses the jury. That pairing lets you stage the defense as strategy versus showmanship and it earns every courtroom scene.\n\nSlot them in at `/case/usa-v-mangione#characters`.",
  },

  // ── Greetings ───────────────────────────────────────────────
  {
    test: /^(hi|hello|hey|yo|sup|howdy|greetings)\b/i,
    reply:
      "Sidebar here. We've got USA v. Mangione open — the record, the roster, or the strategy, pick your angle. I can also move you around: `/case/usa-v-mangione#timeline`, `/case/usa-v-mangione#characters`, or `/browse` for the case library.",
  },

  // ── Case facts ──────────────────────────────────────────────
  {
    test: /\b(charge|counts?|indictment|indicted)\b/i,
    reply:
      "Four federal counts on the original indictment: interstate stalking resulting in death, murder through the use of a firearm, and two separate firearms counts. Two of the four are now dismissed. What remains is still a murder prosecution — just no longer capital.\n\nFull docket trail at `/case/usa-v-mangione#timeline`.",
  },
  {
    test: /\b(judge|garnett|bench|presid)/i,
    reply:
      "Judge Margaret M. Garnett, S.D.N.Y. Former AUSA, appointed in 2023. She runs a tight courtroom — sharp on Daubert, impatient with procedural drift, and she's the one who accepted the death penalty withdrawal on Dkt #113 (Feb 27, 2026).",
  },
  {
    test: /\b(trial date|when.*trial|october|trial.*sched|court date)/i,
    reply:
      "Trial is calendared for October 13, 2026. Pre-trial conference ahead of it, motion to suppress still pending. Any slippage will likely come from the suppression fight.",
  },
  {
    test: /\b(defense|counsel|agnifilo|lawyer|attorney)\b/i,
    reply:
      "Lead defense is Karen Friedman Agnifilo — former Manhattan chief ACDA, now partner at Agnifilo Intrater. Media-fluent, jury-instinct strong. She drove the death-penalty withdrawal; expect the suppression motion to be the next show.",
  },
  {
    test: /\b(death penalty|capital|execution)\b/i,
    reply:
      "Capital notice was formally withdrawn on February 27, 2026 (Dkt #113). The case now proceeds as a non-capital federal murder prosecution with a max of life without parole. That shift reshapes the defense calculus — no bifurcated penalty phase, no death-qualified jury.",
  },
  {
    test: /\b(suppress|motion to suppress|fourth amendment|search|seizure|terry stop)\b/i,
    reply:
      "The open motion targets the McDonald's stop in Altoona, PA — the tip, the ID, the subsequent search, and everything that flowed from it (notebook, firearm, writings). If Garnett grants even a partial suppression, the government loses its most cinematic evidence. Briefing schedule is in the docket: `/case/usa-v-mangione#timeline`.",
  },
  {
    test: /\b(evidence|notebook|firearm|gun|manifesto|writings|backpack|suppressor)\b/i,
    reply:
      "Headline evidence: the spiral notebook with handwritten entries, the ghost gun recovered from the backpack, and a 3D-printed suppressor described in filings. The government's theory leans on the notebook for intent and on the firearm for the 18 U.S.C. § 924(j) count. All of it routes back through the suppression motion — if Altoona falls, the chain weakens.",
  },
  {
    test: /\b(victim|thompson|unitedhealth|uhc|ceo|brian)\b/i,
    reply:
      "Victim is Brian Thompson, then-CEO of UnitedHealthcare, shot outside the New York Hilton on a Midtown sidewalk in December 2024. The case has pulled in national attention because of who he was and what the defendant allegedly wrote about the insurance industry.",
  },
  {
    test: /\b(plea|plead|not guilty|arraign)\b/i,
    reply:
      "Defendant pleaded not guilty on all counts. No signal of a plea negotiation in the public filings — the defense is running this at trial.",
  },
  {
    test: /\b(prosecut|ausa|u\.?s\.? attorney|government|state)\b/i,
    reply:
      "Office of the U.S. Attorney for the Southern District of New York. Expect a team trial posture — multiple AUSAs, one lead on the murder count, one on the firearms counts. S.D.N.Y. doesn't take a case like this in lightly.",
  },
  {
    test: /\b(venue|sdny|southern district|court|district)\b/i,
    reply:
      "United States District Court for the Southern District of New York. Docket 1:25-cr-00176-MMG. Manhattan courthouse, Judge Garnett presiding.",
  },
  {
    test: /\b(jury|voir dire)\b/i,
    reply:
      "With capital off the table, jury selection simplifies — no death-qualification. Expect an aggressive voir dire on pretrial publicity and on views about the healthcare industry. The defense will want jurors who can hold the government to its burden without filtering through the headline.",
  },

  // ── Navigation intents ──────────────────────────────────────
  {
    test: /\b(browse|other case|case library|more cases)\b/i,
    reply: "Head to `/browse` for the case library.",
  },
  {
    test: /\b(settings|preferences|theme|dark mode|light mode)\b/i,
    reply:
      "Settings live at `/settings` — that's where Open Court / In Camera themes toggle.",
  },
  {
    test: /\b(dashboard|account)\b/i,
    reply: "Your dashboard is at `/dashboard`.",
  },
  {
    test: /\b(home|landing|main page)\b/i,
    reply: "Main screen is `/`.",
  },
  {
    test: /\b(timeline|docket)\b/i,
    reply:
      "Timeline and the full docket are at `/case/usa-v-mangione#timeline`.",
  },
  {
    test: /\b(characters?|cast|roster)\b/i,
    reply: "Characters lane is at `/case/usa-v-mangione#characters`.",
  },
  {
    test: /\b(story so far|summary|overview|recap)\b/i,
    reply: "Story So Far is up top: `/case/usa-v-mangione#story`.",
  },
  {
    test: /\b(pricing|plans?|cost|subscribe|subscription)\b/i,
    reply: "Plans are at `/pricing`.",
  },

  // ── Meta / social ───────────────────────────────────────────
  {
    test: /\b(thanks|thank you|appreciate|cheers)\b/i,
    reply: "Any time. I'm here if you want to go deeper.",
  },
  {
    test: /\b(who are you|what are you|your name)\b/i,
    reply:
      "I'm Sidebar — AI counsel inside LegalDrama.ai. I work the open case with you, from the record to the roster to the strategy.",
  },
  {
    test: /\b(help|what can you do|capabilities)\b/i,
    reply:
      "Ask me about the charges, the judge, the suppression motion, the evidence, the victim, or the defense strategy. I can also jump you around: `/case/usa-v-mangione#timeline`, `/case/usa-v-mangione#characters`, `/browse`, `/settings`.",
  },
]

const FALLBACK =
  "I'm running in rehearsal mode right now — the live AI counsel is offline while we finalize the demo, so I'm working from a curated script.\n\nTry one of the chips below, or ask about the charges, the judge, the suppression motion, the evidence, or the character roster. I can also route you: `/case/usa-v-mangione#timeline`, `/case/usa-v-mangione#characters`, or `/browse`."

function scriptedReply(message: string): string {
  for (const s of SCRIPTS) {
    if (s.test.test(message)) return s.reply
  }
  return FALLBACK
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve()
    const t = setTimeout(resolve, ms)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(t)
        resolve()
      },
      { once: true },
    )
  })
}

export function SidebarChat() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || streaming) return

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ])
    setInput("")
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    const full = scriptedReply(trimmed)

    // small "thinking" beat so it doesn't feel canned
    await sleep(300, controller.signal)
    if (controller.signal.aborted) {
      setStreaming(false)
      abortRef.current = null
      return
    }

    // reveal in small chunks, like a live stream
    const chunkSize = 8
    let i = 0
    while (i < full.length) {
      if (controller.signal.aborted) break
      i = Math.min(i + chunkSize, full.length)
      const partial = full.slice(0, i)
      setMessages((curr) => {
        const copy = [...curr]
        copy[copy.length - 1] = { role: "assistant", content: partial }
        return copy
      })
      await sleep(14, controller.signal)
    }

    setStreaming(false)
    abortRef.current = null
  }

  const handleQuickReply = (q: QuickReply) => {
    if (q.href) {
      router.push(q.href)
      setOpen(false)
      return
    }
    if (q.prompt) sendMessage(q.prompt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Sidebar — AI counsel"
          className={cn(
            "fixed bottom-6 right-6 z-[60]",
            "flex items-center gap-2 px-4 h-12",
            "border-[2.5px] border-[var(--border)]",
            "bg-[var(--red)] text-white",
            "font-mono text-xs font-bold uppercase tracking-widest",
            "shadow-[4px_4px_0px_var(--shadow-color)]",
            "hover:translate-x-[-1px] hover:translate-y-[-1px]",
            "hover:shadow-[5px_5px_0px_var(--shadow-color)]",
            "active:translate-x-[1px] active:translate-y-[1px]",
            "active:shadow-[2px_2px_0px_var(--shadow-color)]",
            "transition-all",
          )}
        >
          <Gavel size={16} />
          Sidebar
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-[60]",
            "w-[min(92vw,420px)] h-[min(80vh,600px)]",
            "flex flex-col",
            "border-[2.5px] border-[var(--border)]",
            "bg-[var(--card)]",
            "shadow-[6px_6px_0px_var(--shadow-color)]",
          )}
          role="dialog"
          aria-label="Sidebar chat"
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3",
              "border-b-[2.5px] border-[var(--border)]",
              "bg-[var(--surface)]",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-9 h-9 flex items-center justify-center",
                  "border-[2.5px] border-[var(--border)]",
                  "bg-[var(--red)] text-white",
                  "shadow-[2px_2px_0px_var(--shadow-color)]",
                )}
              >
                <Gavel size={16} />
              </div>
              <div className="leading-tight">
                <div className="font-sans text-sm font-black text-[var(--foreground)]">
                  Sidebar
                </div>
                <div className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                  AI counsel · approach the bench
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                abortRef.current?.abort()
                setOpen(false)
              }}
              aria-label="Close Sidebar"
              className={cn(
                "w-8 h-8 flex items-center justify-center",
                "border-2 border-[var(--border)]",
                "bg-[var(--background)] text-[var(--foreground)]",
                "hover:border-[var(--red)] hover:text-[var(--red)]",
                "transition-colors",
              )}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--background)]"
          >
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                onNavigate={(href) => {
                  router.push(href)
                  setOpen(false)
                }}
              />
            ))}
          </div>

          {/* Quick replies */}
          <div
            className={cn(
              "px-3 py-2 border-t-[2.5px] border-[var(--border)] bg-[var(--surface-alt)]",
              "flex flex-wrap gap-1.5",
            )}
          >
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                onClick={() => handleQuickReply(q)}
                disabled={streaming}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1",
                  "font-mono text-[10px] font-bold uppercase tracking-wider",
                  "border-2 border-[var(--border)] bg-[var(--card)]",
                  "text-[var(--foreground)]",
                  "hover:border-[var(--red)] hover:text-[var(--red)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors",
                )}
              >
                {q.href ? <ArrowUpRight size={10} /> : <Scale size={10} />}
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "flex items-end gap-2 p-3",
              "border-t-[2.5px] border-[var(--border)] bg-[var(--card)]",
            )}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={streaming}
              placeholder="Approach the bench…"
              className={cn(
                "flex-1 resize-none px-3 py-2",
                "font-serif text-sm leading-snug",
                "border-[2.5px] border-[var(--border)] bg-[var(--background)]",
                "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                "focus:outline-none focus:border-[var(--red)]",
                "disabled:opacity-60",
              )}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Send"
              className={cn(
                "h-10 w-10 flex items-center justify-center shrink-0",
                "border-[2.5px] border-[var(--border)]",
                "bg-[var(--red)] text-white",
                "shadow-[2px_2px_0px_var(--shadow-color)]",
                "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                "hover:shadow-[3px_3px_0px_var(--shadow-color)]",
                "active:translate-x-[1px] active:translate-y-[1px]",
                "active:shadow-none",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0",
                "transition-all",
              )}
            >
              {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function MessageBubble({
  role,
  content,
  streaming,
  onNavigate,
}: {
  role: Role
  content: string
  streaming: boolean
  onNavigate: (href: string) => void
}) {
  const isUser = role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] px-3 py-2",
          "border-[2.5px] border-[var(--border)]",
          "shadow-[2px_2px_0px_var(--shadow-color)]",
          isUser
            ? "bg-[var(--amber)] text-[var(--background)] font-sans font-semibold"
            : "bg-[var(--card)] text-[var(--foreground)] font-serif",
          "text-sm leading-relaxed whitespace-pre-wrap",
        )}
      >
        {renderContentWithPills(content, onNavigate)}
        {streaming && !content && (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--muted-foreground)]">
            <Loader2 size={12} className="animate-spin" />
            thinking
          </span>
        )}
        {streaming && content && <span className="inline-block w-2 h-4 bg-current ml-0.5 animate-pulse" />}
      </div>
    </div>
  )
}

function renderContentWithPills(
  text: string,
  onNavigate: (href: string) => void,
) {
  if (!text) return null
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const regex = new RegExp(PATH_PILL_REGEX.source, "g")
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const path = match[1]
    parts.push(
      <button
        key={`${match.index}-${path}`}
        onClick={() => onNavigate(path)}
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5",
          "font-mono text-[11px] font-bold",
          "border-2 border-[var(--border)] bg-[var(--background)]",
          "text-[var(--red)]",
          "hover:bg-[var(--red)] hover:text-white",
          "transition-colors",
        )}
      >
        <ArrowUpRight size={10} />
        {path}
      </button>,
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}
