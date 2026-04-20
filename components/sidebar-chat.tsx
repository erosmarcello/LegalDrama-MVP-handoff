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
  Brain,
  FileSearch,
  Scroll,
  Eye,
  Fingerprint,
  Sparkles,
  BookOpen,
  Compass,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ──────────────────────────────────────────────────────────────
 * Agentic "thinking" verbs — rotated while the AI is processing.
 * Paired with a contextual lucide icon. The copy is intentionally
 * present-tense, active, and noir — this is a legal-drama product
 * so every verb should feel like courthouse work, not chat.
 * ────────────────────────────────────────────────────────────── */
const THINKING_STATES: { verb: string; Icon: typeof Brain }[] = [
  { verb: "Reasoning",             Icon: Brain },
  { verb: "Combing the docket",    Icon: FileSearch },
  { verb: "Reading between lines", Icon: Eye },
  { verb: "Cross-referencing",     Icon: Fingerprint },
  { verb: "Consulting precedent",  Icon: Scroll },
  { verb: "Weighing the evidence", Icon: Scale },
  { verb: "Drafting the reply",    Icon: BookOpen },
  { verb: "Connecting the dots",   Icon: Compass },
  { verb: "Closing the argument",  Icon: Sparkles },
]

type Role = "user" | "assistant"
type ChatMessage = { role: Role; content: string }

type QuickReply = {
  label: string
  prompt?: string
  href?: string
}

type QuickReplyGroup = {
  heading: string
  items: QuickReply[]
}

const QUICK_REPLY_GROUPS: QuickReplyGroup[] = [
  {
    heading: "Navigate",
    items: [
      { label: "Story So Far", href: "/case/usa-v-mangione#story" },
      { label: "Timeline & Docket", href: "/case/usa-v-mangione#timeline" },
      { label: "Characters", href: "/case/usa-v-mangione#characters" },
      { label: "Browse", href: "/browse" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    heading: "Case Q&A",
    items: [
      {
        label: "Weak points",
        prompt:
          "What are the likely weak points in the government's case against Luigi Mangione?",
      },
      {
        label: "Female detectives?",
        prompt:
          "Were there any female detectives or agents involved in the Mangione investigation?",
      },
      {
        label: "Complementing character",
        prompt:
          "Suggest a defense-side character (archetype) that would complement the lead prosecutor in the Mangione case for a dramatization.",
      },
    ],
  },
  {
    heading: "Develop",
    items: [
      {
        label: "Truth of this story",
        prompt: "What is the truth of the Mangione story?",
      },
      {
        label: "Themes",
        prompt:
          "What are the central themes of this case and why should an audience care?",
      },
      {
        label: "City as character",
        prompt: "How would you write New York City as a character in this story?",
      },
      {
        label: "What's getting funded",
        prompt:
          "What kinds of true-crime and legal-drama themes are getting funded right now?",
      },
    ],
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
  // ── Develop / writers-room journeys ─────────────────────────
  {
    test: /\b(truth (of|to|in|behind)|what'?s the truth|real story|actual story|what really happened)\b/i,
    reply:
      "Strip the headlines and the truth is smaller and harder.\n\nA young man with elite-school polish and a back injury walked out of his life, traveled across state lines, and shot a stranger on a Midtown sidewalk because of what that stranger represented to him. The killing was personal in motive and impersonal in target — that contradiction is the story.\n\nEverything else — the manifesto, the McDonald's, the internet sainthood — is the country reacting to the act. Treat the act as the spine and the reaction as the chorus and the show writes itself.",
  },
  {
    test: /\b(themes?|why (should|would).*care|what'?s it about|deeper meaning|what does it mean|stakes for (the )?audience)\b/i,
    reply:
      "Three themes do the heavy lifting.\n\nFirst, **grievance as ideology** — the modern radicalization arc isn't a basement and a manifesto, it's a back surgery and a Reddit thread. That's new and it's terrifying.\n\nSecond, **healthcare as a moral injury** — the case sits on top of a public rage at insurers that the courtroom can't acknowledge but every viewer feels. Write around that pressure, never directly into it.\n\nThird, **the spectator economy** — a defendant becomes a folk hero in real time. The show is partly about us.\n\nAudiences care because all three themes are pointed at them. There's no comfortable distance.",
  },
  {
    test: /\b(p\.?o\.?v\.?|perspective|whose (story|point of view)|told from)\b/i,
    reply:
      "Default trap is the defendant's POV — feels prestige but makes the show about a single character's psychology, which the public record can't actually support.\n\nBetter: a **dual-track structure**. Track A is the lead defense attorney, post-arraignment forward — she has access, she has stakes, she carries the courtroom. Track B is the NYPD detective who ran the Midtown canvass — she has the city, the bodies, the pre-arrest investigation.\n\nThe two tracks meet at trial. The defendant is a force in the show, not the narrator. That keeps you honest about what's known.",
  },
  {
    test: /\b(backstory|past incident|origin|bruce wayne|formative|childhood|what made him|how did .* become)\b/i,
    reply:
      "Two real, public threads to pull, neither speculative.\n\nThe **back surgery** — chronic pain, opioid exposure, a body that stopped being reliable. That's a Bruce Wayne moment without the cape: the day the world stops feeling fixable. Stage it as a flashback, single scene, no dialogue.\n\nThe **family** — Maryland old money, Gilman School, Penn engineering. He wasn't the kid who slipped through the cracks; he was the kid the system was built for. The cost of that pedigree, and the silence inside it, is your second flashback.\n\nThose two together explain everything you need to explain without inventing a past.",
  },
  {
    test: /\b(antagonist|villain|opposing force|who'?s the bad guy)\b/i,
    reply:
      "The trap is casting the prosecutor or the FBI as the antagonist. They're not — they're doing the job.\n\nThe real antagonistic force in this story is **the system the defendant claims to be punishing**: insurance denial machines, prior-auth queues, the quiet bureaucracies that wear people down. You can't put that in a chair, so personify it — a UnitedHealthcare communications VP managing the post-shooting narrative is your in. Not a monster. A professional doing damage control on a death.\n\nThat character is the show's shadow antagonist. The defendant is the protagonist of his own delusion.",
  },
  {
    test: /\b(city as.*character|new york.*character|nyc.*character|setting as character|location.*character)\b/i,
    reply:
      "New York earns it here. The shooting happens on **a sidewalk in front of the Hilton at 6:45 a.m.** — not an alley, not a back room, the lobby of the city's business engine, in working light. That's a setting choice the show should never let you forget.\n\nLean into the contrasts: Midtown corporate sterility versus the messy hostel uptown where he stayed; the Altoona McDonald's that ended it versus the Manhattan courthouse where it'll end again. Use the **subway** as the only place every character — defendant, prosecutor, detective, victim — has been at some point.\n\nNew York isn't backdrop. It's the room the country is arguing in. Treat it that way.",
  },
  {
    test: /\b(interview|where to (dig|look)|sources?|research|reporters?|who to talk to|location.*scout|on the ground)\b/i,
    reply:
      "Three tiers, in order of payoff.\n\n**Court personnel and bar adjacent** — defense investigators on the team (not lead counsel; they don't talk), former S.D.N.Y. AUSAs who'll background, capital defense lawyers who can speak to why the death notice fell.\n\n**Reporters who own the beat** — the New York Times metro and federal-courts crew, NY1's courthouse regulars, ProPublica on the healthcare angle. They know what's not in the filings.\n\n**Locations** — the Hilton sidewalk, the M Social Hotel where he stayed, the Altoona McDonald's, the federal courthouse at 500 Pearl. Walk all four. The show lives in the geography.",
  },
  {
    test: /\b(what'?s (getting )?funded|trends?|market|greenlit|deadline|getting bought|what (are|sells))\b/i,
    reply:
      "Streamers are buying three flavors right now.\n\n**Limited-series true crime with a systemic angle** — Dahmer's afterlife proved the appetite, and recent buys lean toward stories where the crime is a symptom of something larger (insurance, opioids, immigration enforcement). Mangione lives here.\n\n**Defense-side legal drama** — Presumed Innocent and The Lincoln Lawyer reset the bar; networks want morally serious, courtroom-heavy, anti-procedural. Eight episodes, not twenty-two.\n\n**Real-time-adjacent** — shows about events the audience already has a take on, written so the audience has to question that take. The Staircase, American Crime Story, Painkiller. This case slots straight in.\n\nPitch the systemic-symptom angle first. That's the door.",
  },
  {
    test: /\b(find.*detective|real detective|nypd detective|case detective|lead detective)\b/i,
    reply:
      "The federal filings name the lead FBI case agent and the AUSAs; NYPD detectives on the Midtown shooting aren't named in the docket I'm working from.\n\nFor a real lookup, the press conference footage from December 2024 named two NYPD chiefs publicly — start there and follow the bylines in coverage from the Daily News and NY1, which had the most NYPD-source-driven reporting in the first two weeks.\n\nFor the show, write a composite: a Manhattan South Homicide detective, mid-career, who carried the canvass before the federal team took over. Mark her as a composite in your notes and you're clear of any real-person liability.",
  },

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
  const panelRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const closePanel = () => {
    abortRef.current?.abort()
    setOpen(false)
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      // don't steal focus on initial page load
      mountedRef.current = true
      return
    }
    if (open && textareaRef.current) {
      textareaRef.current.focus()
    } else if (!open && launcherRef.current) {
      // return focus to the launcher when the panel closes so keyboard users
      // don't lose their place in the tab order
      launcherRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  // ⌘K / Ctrl+K toggles the panel from anywhere in the app
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
      if (isToggle) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Escape closes the panel; Tab / Shift+Tab wraps inside it (focus trap)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closePanel()
        return
      }
      if (e.key !== "Tab") return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("aria-hidden"))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

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
          ref={launcherRef}
          onClick={() => setOpen(true)}
          aria-label="Open Sidebar — AI counsel (⌘K)"
          title="Sidebar — AI counsel (⌘K)"
          className={cn(
            "fixed bottom-6 right-6 z-[60]",
            "flex items-center gap-2 px-4 h-10",
            "border border-[var(--gold)]",
            "bg-[#0f0f0f] text-[var(--gold)]",
            "cinema-label text-[10px]",
            "hover:bg-[var(--gold)] hover:text-black",
            "transition-colors duration-200",
          )}
        >
          <Gavel size={16} />
          Sidebar
        </button>
      )}

      {/* Chat panel — fixed bottom-right, never leaves anchor. */}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            // ── Anchoring: fixed creates its own positioning context for
            //    the ::before gold rule; do NOT also add `relative` — it
            //    overrides `fixed` and the panel falls into document flow
            //    on the left side (the bug that shipped before).
            "fixed bottom-6 right-6 z-[60]",
            "w-[min(92vw,420px)] h-[min(80vh,600px)]",
            "flex flex-col",
            "bg-[#0f0f0f] text-white cinema-grain",
            "shadow-[0_30px_80px_rgba(0,0,0,0.7)]",
            "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[var(--gold)] before:z-[1]",
            // Noir pulsing border — thinking state pulses purple (active
            // reasoning), idle pulses gold (waiting). Driven by keyframes
            // defined in globals.css: sidebar-chat-pulse-{gold,purple}.
            "sidebar-chat-panel",
            streaming ? "sidebar-chat-panel-active" : "sidebar-chat-panel-idle",
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Sidebar — AI counsel"
        >
          {/* Header — cinema-noir bar */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3",
              "border-b border-[var(--border)]",
              "bg-black/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center",
                  "border border-[var(--gold)]",
                  "bg-transparent text-[var(--gold)]",
                )}
              >
                <Gavel size={14} />
              </div>
              <div className="leading-tight">
                <div className="cinema-label text-[9px] text-[var(--gold)]">
                  Chambers · AI Counsel
                </div>
                <div className="cinema-contract-italic text-[10px] text-white/60">
                  Approach the bench
                </div>
              </div>
            </div>
            <button
              onClick={closePanel}
              aria-label="Close Sidebar (Esc)"
              title="Close (Esc)"
              className={cn(
                "w-8 h-8 flex items-center justify-center",
                "border border-[var(--border)]",
                "bg-transparent text-white/60",
                "hover:border-[var(--red)] hover:text-[var(--red)]",
                "transition-colors",
              )}
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0a0a0a]"
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

          {/* Quick replies — grouped by intent */}
          <div
            className={cn(
              "px-3 pt-2 pb-2.5 border-t border-[var(--border)] bg-black/40",
              "space-y-1.5",
            )}
          >
            {QUICK_REPLY_GROUPS.map((group) => (
              <div key={group.heading}>
                <div
                  className={cn(
                    "cinema-label text-[9px]",
                    "text-[var(--gold)]",
                    "pl-0.5 mb-1",
                  )}
                >
                  {group.heading}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => handleQuickReply(q)}
                      disabled={streaming}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1",
                        "font-mono text-[11px] font-bold uppercase tracking-wider",
                        "border border-[var(--border)]",
                        q.href
                          ? "bg-[var(--surface)]"
                          : "bg-[var(--card)]",
                        "text-[var(--foreground)]",
                        "hover:border-[var(--purple)] hover:text-[var(--purple)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-colors",
                      )}
                    >
                      {q.href ? <ArrowUpRight size={10} /> : <Scale size={10} />}
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
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
                "border border-[var(--border)] bg-[var(--background)]",
                "text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]",
                "focus:outline-none focus:border-[var(--purple)]",
                "disabled:opacity-60",
              )}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              aria-label="Send"
              className={cn(
                "h-10 w-10 flex items-center justify-center shrink-0",
                "border border-[var(--border)]",
                "bg-[var(--purple)] text-white",
                "",
                "hover:translate-x-[-1px] hover:translate-y-[-1px]",
                "hover:",
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
          "border border-[var(--border)]",
          "",
          isUser
            ? // Amber is a saturated light fill in both themes, so text must stay
              // near-black for AA contrast (≈9.2:1 on #EF9F27).
              "bg-[var(--amber)] text-[#1C1810] font-sans font-semibold"
            : "bg-[var(--card)] text-[var(--foreground)] font-serif",
          "text-sm leading-relaxed whitespace-pre-wrap",
        )}
      >
        {renderContentWithPills(content, onNavigate)}
        {streaming && !content && <ThinkingIndicator />}
        {streaming && content && <span className="inline-block w-2 h-4 bg-current ml-0.5 animate-pulse" />}
      </div>
    </div>
  )
}

/**
 * Agentic thinking indicator — rotates through THINKING_STATES every
 * ~1.4s while the AI is processing. Each state is a verb + icon pair.
 * The icon pulses, the verb trails an animated ellipsis. Designed to
 * look like the agent is actually *doing* something, not just idling.
 */
function ThinkingIndicator() {
  const [idx, setIdx] = useState(0)

  // Randomize the starting verb so back-to-back queries don't always
  // open with "Reasoning". Feels more alive.
  useEffect(() => {
    setIdx(Math.floor(Math.random() * THINKING_STATES.length))
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % THINKING_STATES.length)
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const { verb, Icon } = THINKING_STATES[idx]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2",
        "font-mono text-[11px] tracking-wide",
        "text-[var(--gold)]",
      )}
      aria-live="polite"
      aria-label={`${verb} — processing`}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center w-5 h-5",
          "border border-[var(--gold)]/40 bg-black/30",
          "text-[var(--gold)]",
          "sidebar-chat-thinking-icon",
        )}
      >
        <Icon size={11} />
      </span>
      <span className="sidebar-chat-thinking-verb">{verb}</span>
      <span className="sidebar-chat-thinking-dots" aria-hidden>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </span>
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
          "text-[var(--purple)]",
          "hover:bg-[var(--purple)] hover:text-white",
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
