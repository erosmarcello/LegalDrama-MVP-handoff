"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  X, Upload, FolderOpen, Users, Play, Pause, Star,
  FileText, Zap, Flag, Calendar, MessageSquare, Clock,
  Check, Copy, Trash2, Plus, ChevronUp, ChevronDown,
  Sparkles, Volume2, Image as ImageIcon, Video, Archive,
  RefreshCw, Edit3, Save, Share2, Settings, Eye,
  Download, Mic, Film, Wand2, ExternalLink, MoreHorizontal,
  Layers, Grid3X3, List, Search, Filter,
  Flame, Scale, Target, Gavel, Box, ImagePlus,
  Shield, AlertTriangle as AlertTriangleIcon, BarChart3, Timer,
  FileSearch, TrendingUp, Activity, Hash,
  BookOpen, Library, Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { DRAMA_LEVELS, type DramaLevel } from "@/lib/case-data"

// Forward-ref import for Module 6 — kept as a structural type only so this
// file does not pull a runtime cycle with ingest-modal.tsx.
import type { IngestedSource } from "@/components/ingest-modal"

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "upload" | "organize" | "screenplay" | "collab"
  onOpenSettings?: () => void
  // Module 6 — Source Ingest. All three are optional so callers that
  // haven't wired the ingest flow yet still mount cleanly.
  ingestedSources?: IngestedSource[]
  onOpenIngest?: () => void
  onOpenSourceReport?: (s: IngestedSource) => void
}

// Case Evidence items with more detail
const CASE_EVIDENCE = [
  { id: 1, name: "Sealed Complaint (Dkt 1)", date: "12/18/24", type: "filing", tier: "T1", icon: FileText, color: "var(--red)", enabled: true },
  { id: 2, name: "Redacted Indictment (Dkt 22)", date: "04/17/25", type: "filing", tier: "T1", icon: Zap, color: "var(--yellow)", enabled: true },
  { id: 3, name: "Death Penalty Notice (Dkt 25)", date: "04/24/25", type: "notice", tier: "T1", icon: Flag, color: "var(--red)", enabled: true },
  { id: 4, name: "Motion to Dismiss (Dkt 51)", date: "09/20/25", type: "motion", tier: "T2", icon: FileText, color: "var(--muted-foreground)", enabled: true },
  { id: 5, name: "Suppression Ruling (Dkt 102)", date: "01/30/26", type: "order", tier: "T1", icon: Gavel, color: "var(--muted-foreground)", enabled: true },
  { id: 6, name: "Counts Dismissed (Dkt 103)", date: "01/30/26", type: "order", tier: "T1", icon: Gavel, color: "var(--muted-foreground)", enabled: false },
  { id: 7, name: "Scheduling Order (Dkt 105)", date: "02/03/26", type: "scheduling", tier: "T1", icon: Star, color: "var(--yellow)", enabled: true },
  { id: 8, name: "DP Dropped Letter (Dkt 113)", date: "02/27/26", type: "notice", tier: "T1", icon: Flag, color: "var(--green)", enabled: false },
]

// NOTE: The old table-style SECONDARY_EVIDENCE const (user uploads as a
// list of {name, tag, detail, icon}) has been retired in favor of
// USER_MOOD_ASSETS below, which shapes the same uploads as MoodAsset
// records so they can render in the mood-board grid alongside the
// case-derived mood board.

// Timeline events for Organize tab
const TIMELINE_EVENTS = [
  { date: "12/18/24", title: "Complaint Filed", lane: "factual", expanded: false },
  { date: "12/19/24", title: "Arrest", lane: "procedural", expanded: false },
  { date: "04/17/25", title: "Indictment", lane: "factual", expanded: true },
  { date: "04/24/25", title: "Death Penalty Sought", lane: "factual", expanded: true },
  { date: "01/30/26", title: "Suppression Denied", lane: "procedural", expanded: false },
  { date: "01/30/26", title: "Counts 3&4 Dismissed", lane: "factual", expanded: true },
  { date: "02/03/26", title: "Master Schedule", lane: "scheduling", expanded: true },
  { date: "10/13/26", title: "Trial Begins", lane: "scheduling", expanded: true },
]

// Docket entries
const DOCKET_ENTRIES = [
  { num: 1, title: "SEALED COMPLAINT — §§ 2261A, 924(j), 924(c)", date: "12/18/24" },
  { num: 0, title: "Arrest of defendant (on writ)", date: "12/19/24", indent: true },
  { num: 5, title: "Minute Entry: Initial Appearance, Detention Hearing", date: "12/19/24" },
  { num: 7, title: "Brady ORDER entered", date: "12/19/24" },
  { num: 22, title: "REDACTED INDICTMENT — 4 counts", date: "04/17/25" },
  { num: 25, title: "NOTICE: Death Penalty Sought", date: "04/24/25" },
  { num: 51, title: "MOTION TO DISMISS — AG Bondi exhibits", date: "09/20/25" },
  { num: 102, title: "OPINION & ORDER — Suppression DENIED", date: "01/30/26" },
  { num: 103, title: "OPINION & ORDER — Counts 3 & 4 DISMISSED", date: "01/30/26" },
  { num: 105, title: "SCHEDULING ORDER ★ — Master trial schedule", date: "02/03/26" },
]

// ═══════════════════════════════════════════════════════════════════
// MOOD BOARD ASSETS — modality-aware scene reference library
// ═══════════════════════════════════════════════════════════════════
// Each asset declares its modality so the card renderer can build the
// right UI (waveform for audio, play-overlay for video, page skeleton
// for docs, emoji + gradient for photo). Gradients mix two palette
// tokens so cards feel lit rather than flat.
type MoodModality = "photo" | "audio" | "video" | "doc"
type MoodAsset = {
  id: number
  modality: MoodModality
  title: string
  subtitle: string
  date: string
  /** Uppercase color-coded category label (e.g. CRIME SCENE, EVIDENCE) */
  tag: string
  tagColor: string
  /** Two colors for the card gradient — first is anchor, second is wash */
  gradient: [string, string]
  /** Photo only — emoji rendered large in the preview area */
  emoji?: string
  /** Audio only — mm:ss duration + a quoted transcript snippet */
  duration?: string
  quote?: string
  /** Video only — mm:ss duration shown bottom-right */
  pageCount?: never
  /** Doc only — page count displayed as "10pp" pill */
  pages?: number
  span?: "tall"
}

const MOOD_CATEGORIES: MoodAsset[] = [
  {
    id: 1, modality: "photo", title: "W. 54th St", subtitle: "Evidence markers.",
    date: "Dec 4, 2024", tag: "CRIME SCENE", tagColor: "var(--red)",
    gradient: ["rgba(220, 38, 38, 0.35)", "rgba(0, 0, 0, 0.9)"], emoji: "🔍",
  },
  {
    id: 2, modality: "photo", title: "9mm + silencer", subtitle: "Operable.",
    date: "Dec 9, 2024", tag: "EVIDENCE", tagColor: "var(--amber)",
    gradient: ["rgba(245, 158, 11, 0.28)", "rgba(0, 0, 0, 0.92)"], emoji: "📎",
  },
  {
    id: 3, modality: "audio", title: "911 call", subtitle: "'He's sitting right there.'",
    date: "Dec 9, 2024", tag: "CALL", tagColor: "var(--amber)",
    gradient: ["rgba(245, 158, 11, 0.22)", "rgba(0, 0, 0, 0.94)"],
    duration: "0:42", quote: "'He's sitting right there.'",
  },
  {
    id: 4, modality: "photo", title: "Shell casing 'DENY'", subtitle: "9mm inscribed.",
    date: "Dec 4, 2024", tag: "EVIDENCE", tagColor: "var(--amber)",
    gradient: ["rgba(168, 85, 247, 0.22)", "rgba(0, 0, 0, 0.94)"], emoji: "📎",
  },
  {
    id: 5, modality: "photo", title: "Booking photo", subtitle: "Altoona PD.",
    date: "Dec 9, 2024", tag: "ARREST", tagColor: "var(--pink)",
    gradient: ["rgba(236, 72, 153, 0.28)", "rgba(0, 0, 0, 0.94)"], emoji: "🚓",
  },
  {
    id: 6, modality: "audio", title: "Hostel clerk", subtitle: "'He did it real quick.'",
    date: "Dec 5, 2024", tag: "INTERVIEW", tagColor: "var(--green)",
    gradient: ["rgba(34, 197, 94, 0.18)", "rgba(0, 0, 0, 0.94)"],
    duration: "12:07", quote: "'He did it real quick.'",
  },
  {
    id: 7, modality: "video", title: "Shooting footage", subtitle: "11 seconds.",
    date: "Dec 4, 2024", tag: "SURVEILLANCE", tagColor: "var(--cyan)",
    gradient: ["rgba(6, 182, 212, 0.26)", "rgba(0, 0, 0, 0.94)"], duration: "0:11",
  },
  {
    id: 8, modality: "photo", title: "Surveillance", subtitle: "Hostel camera.",
    date: "Dec 4, 2024", tag: "SURVEILLANCE", tagColor: "var(--cyan)",
    gradient: ["rgba(29, 78, 216, 0.38)", "rgba(0, 0, 0, 0.94)"], emoji: "📹",
  },
  {
    id: 9, modality: "doc", title: "Complaint (10pp)", subtitle: "FBI affidavit.",
    date: "Dec 18, 2024", tag: "FILING", tagColor: "var(--red)",
    gradient: ["rgba(220, 38, 38, 0.18)", "rgba(0, 0, 0, 0.94)"], pages: 10,
  },
  {
    id: 10, modality: "doc", title: "Suppression (40pp)", subtitle: "Inventory search.",
    date: "Jan 30, 2026", tag: "MOTION", tagColor: "var(--purple)",
    gradient: ["rgba(168, 85, 247, 0.2)", "rgba(0, 0, 0, 0.94)"], pages: 40,
  },
  {
    id: 11, modality: "photo", title: "Manifesto pages", subtitle: "'It had to be done.'",
    date: "Dec 9, 2024", tag: "EVIDENCE", tagColor: "var(--amber)",
    gradient: ["rgba(245, 158, 11, 0.22)", "rgba(0, 0, 0, 0.94)"], emoji: "📄",
  },
  {
    id: 12, modality: "photo", title: "B. Thompson", subtitle: "Victim portrait.",
    date: "Archival", tag: "CHAR", tagColor: "var(--pink)",
    gradient: ["rgba(236, 72, 153, 0.22)", "rgba(0, 0, 0, 0.94)"], emoji: "🕯️",
  },
  {
    id: 13, modality: "video", title: "Courthouse exit", subtitle: "Press gauntlet.",
    date: "Feb 27, 2026", tag: "PRESS", tagColor: "var(--orange)",
    gradient: ["rgba(251, 146, 60, 0.28)", "rgba(0, 0, 0, 0.94)"], duration: "2:48",
  },
  {
    id: 14, modality: "audio", title: "Voir dire", subtitle: "'Have you followed...?'",
    date: "Oct 10, 2026", tag: "PROCEEDING", tagColor: "var(--purple)",
    gradient: ["rgba(168, 85, 247, 0.2)", "rgba(0, 0, 0, 0.94)"],
    duration: "34:12", quote: "'Have you followed this case online?'",
  },
  {
    id: 15, modality: "doc", title: "Jury questionnaire (62pp)", subtitle: "Vetting matrix.",
    date: "Sep 2026", tag: "FILING", tagColor: "var(--cyan)",
    gradient: ["rgba(6, 182, 212, 0.2)", "rgba(0, 0, 0, 0.94)"], pages: 62,
  },
]

// ═══════════════════════════════════════════════════════════════════
// USER MOOD BOARD — writer/producer-uploaded reference material
// ═══════════════════════════════════════════════════════════════════
// Same MoodAsset shape as MOOD_CATEGORIES so the existing MoodAssetCard
// renderer can display these. These are NOT case-sourced — they're the
// writer's reference scrapbook: location scouts, tonal refs, voice
// memos, depo transcripts, courtroom sketches, email archives.
// Each item carries an `enabled` flag so toggling from/out of the
// generated script still works.
type UserMoodAsset = MoodAsset & { enabled: boolean }
const USER_MOOD_ASSETS: UserMoodAsset[] = [
  {
    id: 101, modality: "photo", title: "Courtroom sketches", subtitle: "6 illustrations · Vincent R.",
    date: "Apr 6, 2026", tag: "SKETCH", tagColor: "var(--orange)",
    gradient: ["rgba(251, 146, 60, 0.32)", "rgba(0, 0, 0, 0.94)"], emoji: "✒️",
    enabled: true,
  },
  {
    id: 102, modality: "doc", title: "Smith Deposition (47pp)", subtitle: "Witness prep transcript.",
    date: "Mar 18, 2025", tag: "TRANSCRIPT", tagColor: "var(--purple)",
    gradient: ["rgba(168, 85, 247, 0.22)", "rgba(0, 0, 0, 0.94)"], pages: 47,
    enabled: true,
  },
  {
    id: 103, modality: "doc", title: "Opposition Emails", subtitle: "Prosecutor correspondence — 312 msgs.",
    date: "ongoing", tag: "ARCHIVE", tagColor: "var(--cyan)",
    gradient: ["rgba(6, 182, 212, 0.24)", "rgba(0, 0, 0, 0.94)"], pages: 312,
    enabled: false,
  },
  {
    id: 104, modality: "video", title: "Lobby camera", subtitle: "Building security footage.",
    date: "Dec 9, 2024", tag: "FOOTAGE", tagColor: "var(--muted-foreground)",
    gradient: ["rgba(100, 116, 139, 0.28)", "rgba(0, 0, 0, 0.94)"], duration: "4:23",
    enabled: false,
  },
  {
    id: 105, modality: "photo", title: "W. 54th St scout", subtitle: "Location walk-through — dawn.",
    date: "Feb 12, 2026", tag: "SCOUT", tagColor: "var(--cyan)",
    gradient: ["rgba(29, 78, 216, 0.34)", "rgba(0, 0, 0, 0.94)"], emoji: "📍",
    enabled: true,
  },
  {
    id: 106, modality: "audio", title: "Voice memo — arc notes", subtitle: "\"LM's turn after Dkt 102.\"",
    date: "Mar 3, 2026", tag: "NOTE", tagColor: "var(--green)",
    gradient: ["rgba(34, 197, 94, 0.2)", "rgba(0, 0, 0, 0.94)"],
    duration: "3:12", quote: "\"LM's arc needs a turn after Dkt 102.\"",
    enabled: true,
  },
  {
    id: 107, modality: "video", title: "Zodiac — tonal ref", subtitle: "Palette study for act II.",
    date: "reference", tag: "TONAL REF", tagColor: "var(--yellow)",
    gradient: ["rgba(234, 179, 8, 0.22)", "rgba(0, 0, 0, 0.94)"], duration: "2:11",
    enabled: true,
  },
  {
    id: 108, modality: "photo", title: "Mood board — cold open", subtitle: "Grayscale · rain · red only.",
    date: "Apr 1, 2026", tag: "BOARD", tagColor: "var(--pink)",
    gradient: ["rgba(236, 72, 153, 0.28)", "rgba(0, 0, 0, 0.94)"], emoji: "🎬",
    enabled: true,
  },
  // ── Corpus / ground-truth seeds ────────────────────────────────────
  // Books + long-form text chunked, embedded, and cited back when the
  // model writes. Rendered as doc cards with the brass "CORPUS" tag so
  // the mood board clearly separates reference material from exhibits.
  {
    id: 109, modality: "doc", title: "Federal Rules of Evidence (2024 ed.)",
    subtitle: "Full annotated text — procedural ground truth.",
    date: "reference", tag: "CORPUS", tagColor: "var(--gold)",
    gradient: ["rgba(179, 146, 73, 0.26)", "rgba(0, 0, 0, 0.94)"], pages: 412,
    enabled: true,
  },
  {
    id: 110, modality: "doc", title: "Mangione manifesto — full",
    subtitle: "Three-page handwritten + typed transcript.",
    date: "Dec 9, 2024", tag: "CORPUS", tagColor: "var(--gold)",
    gradient: ["rgba(179, 146, 73, 0.2)", "rgba(0, 0, 0, 0.94)"], pages: 3,
    enabled: true,
  },
]

// Legal Intelligence — features that make lawyers say "whoa"
const LEGAL_INTELLIGENCE = [
  { id: "strength", label: "Case Strength", value: 72, unit: "%", color: "var(--green)", trend: "+3", desc: "AI-estimated prosecution strength" },
  { id: "deadline", label: "Next Deadline", value: "Apr 25", unit: "", color: "var(--red)", trend: "17d", desc: "Mot. in Limine responses due" },
  { id: "judge", label: "Judge Garnett", value: "64%", unit: "gov", color: "var(--cyan)", trend: "±4", desc: "Historical govt win rate" },
  { id: "motions", label: "Suppression Rate", value: "23%", unit: "grant", color: "var(--orange)", trend: "S.D.N.Y.", desc: "District average for this motion type" },
]

const FRCP_QUICK_REF = [
  { rule: "Rule 12(b)", title: "Motion to Dismiss", deadline: "21 days after service", active: true },
  { rule: "Rule 16", title: "Scheduling Conference", deadline: "Per court order", active: true },
  { rule: "Rule 29", title: "Stipulation for Discovery", deadline: "By agreement", active: false },
  { rule: "Rule 33", title: "Interrogatories", deadline: "30 days to respond", active: false },
  { rule: "Rule 41", title: "Search & Seizure", deadline: "Suppression: pretrial", active: true },
  { rule: "Rule 404(b)", title: "Other Acts Evidence", deadline: "Reasonable notice", active: true },
]

// Team members
const TEAM_MEMBERS = [
  { id: 1, name: "Raj A.", role: "Admin", online: true, color: "var(--green)" },
  { id: 2, name: "Eros I.", role: "Admin", online: true, color: "var(--purple)" },
  { id: 3, name: "Apoorv S.", role: "Collaborator", online: false, color: "var(--muted-foreground)" },
]

// Activity log
const ACTIVITY_LOG = [
  { time: "2 min ago", user: "Eros I.", action: "uploaded", target: "Courtroom Sketch Series", color: "var(--cyan)" },
  { time: "15 min ago", user: "Raj A.", action: "toggled bypassed", target: "Surveillance Video.mp4", color: "var(--yellow)" },
  { time: "1 hr ago", user: "Raj A.", action: "added to timeline", target: "Death Penalty Dropped", color: "var(--green)" },
  { time: "3 hrs ago", user: "Apoorv S.", action: "connected", target: "PACER account", color: "var(--purple)" },
  { time: "Yesterday", user: "Eros I.", action: "classified as T1", target: "Sealed Complaint", color: "var(--orange)" },
]

// AI Auto-labeling capabilities
const AI_CAPABILITIES = [
  { icon: Video, label: "Video → Scene detection", color: "var(--purple)" },
  { icon: Mic, label: "Audio → Transcription + summary", color: "var(--cyan)" },
  { icon: ImageIcon, label: "Photos → Descriptions + scene rewrites", color: "var(--pink)" },
  { icon: FileText, label: "Text → Classification + importance", color: "var(--green)" },
  { icon: ImagePlus, label: "Images → Character profiles", color: "var(--yellow)" },
]

// Quick Actions
const QUICK_ACTIONS = [
  { icon: Sparkles, label: "AI Summarize", color: "var(--red)" },
  { icon: Film, label: "Generate Script", color: "var(--purple)" },
  { icon: Volume2, label: "Audio Summary", color: "var(--cyan)" },
  { icon: Download, label: "Export Timeline", color: "var(--green)" },
  { icon: Users, label: "View Characters", color: "var(--pink)" },
  { icon: Wand2, label: "Scene Rewrite", color: "var(--orange)" },
]

// Lane configuration
const LANES = {
  factual: { color: "var(--red)", label: "FACTUAL" },
  procedural: { color: "var(--green)", label: "PROCEDURAL" },
  scheduling: { color: "var(--yellow)", label: "SCHEDULING" },
}

export function ContentModal({
  isOpen, onClose, initialTab = "upload", onOpenSettings,
  ingestedSources = [], onOpenIngest, onOpenSourceReport,
}: ContentModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "organize" | "screenplay" | "collab">(initialTab)
  // Dramatization axis — 5 brutalist stops (Court Record → Mythic), not a 0-100 slider.
  const [dramaLevel, setDramaLevel] = useState<DramaLevel>(2)
  const [caseEvidence, setCaseEvidence] = useState(CASE_EVIDENCE)
  // secondaryEvidence = user-uploaded reference material, rendered as a
  // mood board (grid of MoodAssetCards) rather than the old table. Same
  // enable/disable semantics — toggling a card flips its `enabled` flag
  // which drives enabledCount and the generated-script pipeline.
  const [secondaryEvidence, setSecondaryEvidence] = useState<UserMoodAsset[]>(USER_MOOD_ASSETS)
  const [isDragging, setIsDragging] = useState(false)
  // Corpus dropzone has its own drag state so the UI can glow aged-brass
  // instead of purple while a book is being dragged. Hook-order rule: must
  // live alongside the other useState declarations, never past the
  // `if (!isOpen) return null` below.
  const [isDraggingCorpus, setIsDraggingCorpus] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Collaborator")
  // Organize tab — 3-way evidence category filter (Case / User / All), defaults to All.
  // The Upload pane is now single-purpose (uploading files only); this toggle
  // lives in Organize, where evidence populates after upload / from the docket.
  const [evidenceView, setEvidenceView] = useState<"case" | "user" | "all">("all")
  const [visibleLanes, setVisibleLanes] = useState(new Set(["factual", "procedural", "scheduling"]))

  // Screenplay tab state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editableScript, setEditableScript] = useState("")
  const [savedScripts, setSavedScripts] = useState<{id: string, name: string, content: string, dramaLevel: DramaLevel, createdAt: Date}[]>([])
  const [copySuccess, setCopySuccess] = useState(false)

  // Screenplay production controls — these parameterize the generation
  // request beyond just drama level. Length determines pacing (runtime
  // target), POV picks the narrative anchor, format controls export /
  // typesetting (industry-standard FDX vs plaintext Fountain vs PDF).
  const [scriptLength, setScriptLength] = useState<"cold-open" | "teaser" | "half-hour" | "hour" | "pilot" | "feature">("hour")
  const [scriptPOV, setScriptPOV] = useState<"prosecution" | "defense" | "defendant" | "omniscient" | "press">("omniscient")
  const [scriptFormat, setScriptFormat] = useState<"screenplay" | "teleplay" | "stage" | "treatment">("screenplay")
  const [scriptTitle, setScriptTitle] = useState("THE DENIED")
  
  // Upload tab state
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  
  // Collab tab state
  const [teamMembers, setTeamMembers] = useState(TEAM_MEMBERS)
  const [activityLog, setActivityLog] = useState(ACTIVITY_LOG)
  const [inviteSending, setInviteSending] = useState(false)
  
  // Count enabled assets
  const enabledCount = [...caseEvidence, ...secondaryEvidence].filter(a => a.enabled).length
  const totalCount = caseEvidence.length + secondaryEvidence.length
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])
  
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])
  
  if (!isOpen) return null
  
  const toggleAsset = (id: number, isCase: boolean) => {
    if (isCase) {
      setCaseEvidence(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    } else {
      setSecondaryEvidence(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a))
    }
  }

  const toggleLane = (lane: string) => {
    setVisibleLanes(prev => {
      const next = new Set(prev)
      if (next.has(lane)) {
        next.delete(lane)
      } else {
        next.add(lane)
      }
      return next
    })
  }

  // ===== SCREENPLAY TAB HANDLERS =====
  
  const handleGenerateScript = async () => {
    setIsGenerating(true)
    setGeneratedScript(null)
    
    // Simulate AI generation with streaming effect
    const enabledAssets = [...caseEvidence, ...secondaryEvidence].filter(a => a.enabled)
    const assetNames = enabledAssets.map(a => a.name).join(", ")
    
    // Mock script keyed by DramaLevel (0 = Court Record, 4 = Mythic).
    const scripts: Record<DramaLevel, string> = {
      0: `COVER PAGE

UNITED STATES v. LUIGI MANGIONE
Docket 1:25-cr-00176-MMG
Southern District of New York
Before: Hon. Margaret M. Garnett

PROCEDURAL HISTORY

On December 9, 2024, the defendant was arrested in Altoona, Pennsylvania, in connection with the December 4, 2024 shooting of Brian Thompson outside the Hilton Midtown in New York, New York.

The grand jury returned a four-count indictment charging: (i) interstate stalking resulting in death; (ii) murder through the use of a firearm; (iii) discharging a firearm in furtherance of a crime of violence; and (iv) related firearms counts.

The defendant pleaded not guilty. Two counts were subsequently dismissed. The Government withdrew its notice of intent to seek the death penalty on February 27, 2026.

Based on: ${assetNames}`,

      1: `FADE IN:

INT. MANHATTAN FEDERAL COURTHOUSE - DAY

TITLE CARD: "December 4, 2024 - New York City"

The camera pans across the exterior of 500 Pearl Street. News vans line the street.

NARRATOR (V.O.)
On December 4, 2024, at approximately 6:45 AM, Brian Thompson, CEO of UnitedHealthcare, was shot outside the Hilton Midtown Manhattan.

CUT TO:

INT. COURTROOM 110 - DAY

Judge MARGARET M. GARNETT presides. The defendant, LUIGI MANGIONE, 26, sits at the defense table.

PROSECUTOR
Your Honor, the United States charges the defendant with four counts...

Based on: ${assetNames}`,

      2: `FADE IN:

EXT. HILTON MIDTOWN MANHATTAN - DAWN

TITLE CARD: "Based on True Events"

The glass doors reflect the first light of morning. A figure in a hoodie waits in the shadows.

NARRATOR (V.O.)
They called it the shot heard around corporate America. A single act that would expose fault lines in the American healthcare system.

The figure raises something metallic. Three shots. Silence.

CUT TO:

INT. ALTOONA, PENNSYLVANIA - MCDONALD'S - DAY (5 DAYS LATER)

A young man sits alone, laptop open. His face is calm, almost serene. This is LUIGI MANGIONE.

LUIGI (V.O.)
I wrote it all down. Every reason. Every justification. I knew they wouldn't understand at first.

Based on: ${assetNames}`,
      
      3: `FADE IN:

TITLE CARD: "A ROOM WHERE A CONSTITUENCY WAS WAITING"

INT. CABLE NEWS GREEN ROOM - NIGHT

Monitors loop the McDonald's arrest footage. A BOOKING AGENT scrolls a feed of letters — some pleading, some adoring, all unruly.

BOOKING AGENT
Every panel we book makes him bigger. Every panel we don't makes him a martyr.

CUT TO:

INT. COURTROOM 110 - DAY

Jury voir dire. The PROSECUTOR scans a questionnaire longer than the indictment.

PROSECUTOR (V.O.)
The people's case is not that he is guilty. The people's case is that sympathy is not a defense.

The gallery is full. Some wear black. Some wear green. Nobody wears neutral.

Based on: ${assetNames}`,

      4: `FADE IN:

BLACK SCREEN

The sound of a heartbeat. Slow. Steady. Then—three gunshots.

TITLE: "DENIAL"

INT. IVY LEAGUE LECTURE HALL - FLASHBACK - DAY

A younger LUIGI MANGIONE, brilliant and driven, sits in the front row. His back is straight, but his eyes are distant.

PROFESSOR (O.S.)
The Hippocratic oath states "first, do no harm." But what happens when the system itself becomes the harm?

Luigi's pen stops moving. Something shifts in his expression.

LUIGI (V.O.)
I was twenty-two when I understood that the American Dream had fine print. And I was twenty-six when I decided to read it aloud.

SMASH CUT TO:

EXT. NEW YORK CITY - AERIAL - DAWN

The city that never sleeps is about to wake up screaming.

Based on: ${assetNames}`,
    }

    const script = scripts[dramaLevel]

    // Simulate streaming generation
    let currentText = ""
    const words = script.split(" ")
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30))
      currentText += (i === 0 ? "" : " ") + words[i]
      setGeneratedScript(currentText)
    }
    
    setIsGenerating(false)
    setEditableScript(script)
    
    // Log activity
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "generated script",
      target: `${dramLabel} (L${dramaLevel})`,
      color: "var(--pink)"
    }, ...prev])
  }
  
  const handleEditScript = () => {
    setIsEditing(true)
    if (generatedScript) {
      setEditableScript(generatedScript)
    }
  }
  
  const handleSaveScript = () => {
    if (!generatedScript && !editableScript) return
    
    const newScript = {
      id: Date.now().toString(),
      name: `${dramLabel} Script - ${new Date().toLocaleDateString()}`,
      content: isEditing ? editableScript : (generatedScript || ""),
      dramaLevel,
      createdAt: new Date()
    }
    
    setSavedScripts(prev => [newScript, ...prev])
    setIsEditing(false)
    
    // Log activity
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "saved script",
      target: newScript.name,
      color: "var(--cyan)"
    }, ...prev])
  }
  
  const handleRegenerateScript = () => {
    setGeneratedScript(null)
    setEditableScript("")
    setIsEditing(false)
    handleGenerateScript()
  }
  
  const handleCopyScript = async () => {
    const textToCopy = isEditing ? editableScript : generatedScript
    if (!textToCopy) return
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }
  
  const handleShareScript = () => {
    // TODO: Integrate with share modal
    const textToShare = isEditing ? editableScript : generatedScript
    if (!textToShare) return
    
    // For now, copy a shareable summary
    const shareText = `LegalDrama.ai Script (${dramLabel} · L${dramaLevel})\n\n${textToShare.slice(0, 500)}...`
    navigator.clipboard.writeText(shareText)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // ===== UPLOAD TAB HANDLERS =====
  
  // Extensions we treat as "book / large text corpus" — these get the
  // corpus tag + aged-brass ground-truth treatment automatically. The
  // corpus dropzone additionally force-tags *anything* dropped on it
  // (so a 900-page PDF book gets tagged corpus even if the primary
  // dropzone would have bucketed it as "documents").
  const CORPUS_EXTENSIONS = [
    ".epub", ".txt", ".md", ".markdown",
    ".rtf", ".mobi", ".azw3", ".fb2",
    ".djvu", ".tex",
  ]

  const isCorpusFilename = (name: string) => {
    const lower = name.toLowerCase()
    return CORPUS_EXTENSIONS.some(ext => lower.endsWith(ext))
  }

  const handleFileUpload = (
    files: FileList | null,
    opts: { forceCorpus?: boolean } = {},
  ) => {
    if (!files) return

    const fileArray = Array.from(files)
    setUploadQueue(prev => [...prev, ...fileArray])

    // Simulate upload progress for each file
    fileArray.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`
      let progress = 0

      // Corpus = ground-truth reference material (books, published
      // opinions, long-form briefs, scholarly text). Tagged gold so the
      // mood board + evidence list both show it as a distinct tier.
      const isCorpus = opts.forceCorpus || isCorpusFilename(file.name)

      const interval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          // Add to secondary evidence when complete
          const newEvidence = {
            id: Date.now() + index,
            name: file.name,
            tag: isCorpus ? "corpus"
              : file.type.startsWith("video") ? "video"
              : file.type.startsWith("audio") ? "audio"
              : file.type.startsWith("image") ? "photos"
              : "documents",
            detail: isCorpus
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ground truth`
              : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            icon: isCorpus ? BookOpen
              : file.type.startsWith("video") ? Video
              : file.type.startsWith("image") ? ImageIcon
              : file.type.startsWith("audio") ? Mic
              : FileText,
            color: isCorpus ? "var(--gold)" : "var(--cyan)",
            enabled: true
          }

          // All manual uploads land in the user-evidence bucket; Case Evidence
          // is sourced from the docket and not user-populated. Corpus items
          // live in the same bucket but carry the gold tag so the grid shows
          // them as reference/ground-truth rather than case exhibits.
          setSecondaryEvidence(prev => [...prev, newEvidence])

          // Log activity
          setActivityLog(prev => [{
            time: "Just now",
            user: "You",
            action: isCorpus ? "added to corpus" : "uploaded",
            target: file.name,
            color: isCorpus ? "var(--gold)" : "var(--cyan)"
          }, ...prev])

          // Remove from progress tracking
          setTimeout(() => {
            setUploadProgress(prev => {
              const next = {...prev}
              delete next[fileId]
              return next
            })
          }, 500)
        }
        setUploadProgress(prev => ({...prev, [fileId]: progress}))
      }, 200)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  // Corpus dropzone has its own drag handlers so the UI can glow aged-brass
  // instead of purple while a book is being dragged. (The matching useState
  // lives up with the other hooks so the early-return doesn't skip it.)
  const handleCorpusDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingCorpus(true)
  }
  const handleCorpusDragLeave = () => {
    setIsDraggingCorpus(false)
  }
  const handleCorpusDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingCorpus(false)
    handleFileUpload(e.dataTransfer.files, { forceCorpus: true })
  }

  // ===== COLLAB TAB HANDLERS =====
  
  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return
    
    setInviteSending(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split("@")[0],
      role: inviteRole,
      online: false,
      color: "var(--cyan)"
    }
    
    setTeamMembers(prev => [...prev, newMember])
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "invited",
      target: inviteEmail,
      color: "var(--green)"
    }, ...prev])
    
    setInviteEmail("")
    setInviteSending(false)
  }
  
  const handleRemoveMember = (memberId: number) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    setTeamMembers(prev => prev.filter(m => m.id !== memberId))
    setActivityLog(prev => [{
      time: "Just now",
      user: "You",
      action: "removed",
      target: member.name,
      color: "var(--red)"
    }, ...prev])
  }
  
  const handleExportTimeline = () => {
    const timelineData = TIMELINE_EVENTS.map(e => ({
      date: e.date,
      title: e.title,
      lane: e.lane
    }))
    
    const csv = [
      "Date,Title,Lane",
      ...timelineData.map(e => `${e.date},"${e.title}",${e.lane}`)
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "legaldrama-timeline.csv"
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleExportDocket = () => {
    const docketData = DOCKET_ENTRIES.map(e => ({
      number: e.num,
      title: e.title,
      date: e.date
    }))
    
    const csv = [
      "Docket #,Title,Date",
      ...docketData.map(e => `${e.number},"${e.title}",${e.date}`)
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "legaldrama-docket.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ===== QUICK ACTIONS HANDLERS =====
  
  const handleQuickAction = async (action: string) => {
    switch (action) {
      case "AI Summarize":
        // TODO: Integrate with AI summarization
        setActivityLog(prev => [{
          time: "Just now",
          user: "AI",
          action: "summarizing",
          target: "case materials",
          color: "var(--red)"
        }, ...prev])
        break
      case "Generate Script":
        setActiveTab("screenplay")
        handleGenerateScript()
        break
      case "Audio Summary":
        // TODO: Integrate with TTS
        break
      case "Export Timeline":
        handleExportTimeline()
        break
      case "View Characters":
        // TODO: Integrate with character profiles
        break
      case "Scene Rewrite":
        setActiveTab("screenplay")
        break
    }
  }
  
  const tabs = [
    { id: "upload", label: "UPLOAD", icon: Upload },
    { id: "organize", label: "ORGANIZE", icon: FolderOpen },
    { id: "screenplay", label: "SCREENPLAY", icon: Film },
    { id: "collab", label: "COLLAB", icon: Users },
  ] as const
  
  // Dramatization labels, colors, and treatment text — one per drama stop.
  const DRAMA_TREATMENTS: Record<DramaLevel, string> = {
    0: "On December 4, 2024, Brian Thompson was shot outside the Hilton Midtown. Luigi Mangione was arrested December 9 in Altoona, PA and charged in a four-count federal indictment. Two counts were later dismissed; the death penalty notice was withdrawn on February 27, 2026.",
    1: "The killing of a healthcare CEO sends shockwaves through Midtown. Investigators piece together a manifesto, a ghost gun, and a portrait of calculated rage. The docket thickens: Sealed Complaint, redacted indictment, a suppression fight over what deputies found in a backpack.",
    2: "A five-day manhunt grips the nation. In a Pennsylvania McDonald's, a patron recognizes the face from the wanted poster. The case tightens like a vice — cameras on a sidewalk, a fingerprint on a water bottle, a courtroom waiting in New York.",
    3: "What if the grievance had a constituency? A young graduate becomes a reluctant folk hero; the prosecution finds itself arguing against sympathy as much as evidence. The jury pool is the nation; voir dire is triage.",
    4: "A young graduate plans an act that will force the nation to confront corporate indifference. A manhunt, a trial, a reckoning — staged in the grammar of American myth: the shooter, the CEO, the chorus.",
  }
  const dramaMeta = DRAMA_LEVELS[dramaLevel]
  const dramLabel = dramaMeta.label
  const dramColor = dramaMeta.color
  const dramText = DRAMA_TREATMENTS[dramaLevel]
  
  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" style={{ animationDuration: '0.2s' }}>
      {/* Full-screen backdrop — deep black + cinema grain */}
      <div
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--background)_95%,transparent)] cinema-grain"
        onClick={onClose}
      />

      {/* Full-screen modal container */}
      <div className="relative h-full flex flex-col animate-enter-up bg-[var(--background)] text-[var(--foreground)]" style={{ animationDuration: '0.35s' }}>
        {/* Top Nav Bar — cinema masthead */}
        <div className="relative z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-5 h-14">
            {/* Logo */}
            <div className="flex items-baseline gap-1">
              <span className="cinema-title text-[22px] text-[var(--foreground)]">legal</span>
              <span className="cinema-title text-[22px] text-[var(--red)]">drama</span>
              <span className="cinema-label text-[10px] text-[var(--gold)] ml-1">.AI</span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                onClick={() => { onOpenSettings?.(); onClose(); }}
                className={cn(
                  "px-3 h-8 flex items-center gap-2",
                  "border border-[var(--border)] text-[var(--foreground)]/60",
                  "cinema-label text-[10px]",
                  "hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cursor-pointer",
                )}
              >
                <Settings size={11} />
                Settings
              </Link>

              <div className="w-px h-6 bg-[var(--border)]" />

              <button className={cn(
                "px-3 h-8 flex items-center gap-2",
                "border border-[var(--gold)] text-[var(--gold)]",
                "cinema-label text-[10px] bg-transparent",
              )}>
                <Layers size={11} />
                Mission Control
              </button>
            </div>
          </div>
        </div>

        {/* Case Header Bar — cinema marquee */}
        <div className="relative z-10 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-5 h-12">
            <div className="flex items-center gap-4">
              <h1 className="cinema-title text-[20px] text-[var(--foreground)] tracking-wider">
                USA <span className="text-[var(--red)]">v.</span> MANGIONE
              </h1>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 border border-[var(--border)] cinema-label text-[9px] text-[var(--foreground)]/70">
                  1:25-cr-00176-MMG
                </span>
                <span className="px-2 py-0.5 border border-[var(--gold)] text-[var(--gold)] cinema-label text-[9px]">
                  S.D.N.Y.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="cinema-pulse-dot" style={{ backgroundColor: "var(--gold)" }} />
                <span className="cinema-contract text-[10px] text-[var(--foreground)]/60">
                  Motion to Continue pending · Trial <span className="text-[var(--red)]">Oct 13 &apos;26</span>
                </span>
              </div>
              <div className="px-3 py-1 border border-[var(--border)] cinema-label text-[9px] text-[var(--foreground)]/70">
                {enabledCount}/{totalCount} sources active
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div className="relative z-10 grid grid-cols-4 bg-card border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-4",
                "font-mono text-sm font-bold transition-all",
                "border-b-3 -mb-px",
                activeTab === tab.id
                  ? tab.id === "upload" 
                    ? "border-b-[3px] border-purple bg-purple/10 text-purple"
                    : tab.id === "organize"
                    ? "border-b-[3px] border-cyan bg-cyan/10 text-cyan"
                    : tab.id === "screenplay"
                    ? "border-b-[3px] border-pink bg-pink/10 text-pink"
                    : "border-b-[3px] border-green bg-green/10 text-green"
                  : "border-b-[3px] border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-alt"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden bg-background">
          {/* CENTER - Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            {/* ═════════════════════════════════════════════════════════
                UPLOAD TAB — single-purpose: just upload files.
                Categorization (Case Evidence / User Evidence / All) and
                the mood board live in the Organize tab. All uploads here
                flow into the "User Evidence" bucket; Case Evidence is
                docket-sourced and populated automatically from PACER.
                ═════════════════════════════════════════════════════════ */}
            {activeTab === "upload" && (
              <div className="space-y-6">
                {/* Upload Evidence Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload size={16} className="text-purple" />
                    <span className="font-mono text-xs font-bold text-purple tracking-wider">UPLOAD EVIDENCE</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("organize")}
                    className={cn(
                      "px-3 py-1.5 flex items-center gap-2",
                      "border border-border text-muted-foreground",
                      "font-mono text-[10px] font-bold tracking-wider",
                      "hover:border-cyan hover:text-cyan transition-colors"
                    )}
                    title="Jump to Organize to browse / categorize evidence"
                  >
                    <FolderOpen size={12} />
                    BROWSE EVIDENCE
                    <ChevronDown size={10} className="-rotate-90" />
                  </button>
                </div>

                {/* Subheader explainer */}
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
                  Drop files, link a drive, or paste a URL. Everything you upload here lands in
                  <span className="text-purple font-bold"> User Evidence</span>. Docket filings
                  populate <span className="text-red font-bold">Case Evidence</span> automatically
                  from PACER. To browse, classify, or toggle sources, jump to
                  <span className="text-cyan font-bold"> Organize</span>.
                </p>

                {/* Primary Dropzone — simplified, single-mode */}
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed px-8 py-10 text-center transition-all cursor-pointer block",
                    isDragging
                      ? "border-purple bg-purple/10"
                      : "border-border hover:border-purple/60"
                  )}
                >
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.docx,.doc,.mp4,.m4a,.mp3,.jpg,.jpeg,.png,.zip,.epub,.txt,.md,.markdown,.rtf,.mobi,.azw3,.fb2,.djvu,.tex"
                  />
                  <div className="flex items-center justify-center gap-5">
                    <div className="w-14 h-14 bg-surface-alt flex items-center justify-center shrink-0 border border-purple/30">
                      <Upload size={26} className="text-purple" />
                    </div>
                    <div className="text-left">
                      <p className="font-sans text-base font-bold text-purple">
                        Drop files to upload, or click to browse
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground mt-1">
                        PDF · DOCX · EPUB · TXT · MD · RTF · MP4 · MP3 · JPG · PNG · ZIP — up to 100MB per file
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        Multi-file supported. Uploads land in <span className="text-purple font-bold">User Evidence</span>.
                        Books &amp; long-form text auto-route to <span className="text-[var(--gold)] font-bold">Corpus</span>.
                      </p>
                    </div>
                  </div>
                </label>

                {/* ═══════════════════════════════════════════════════════
                    CORPUS / GROUND-TRUTH LIBRARY — dedicated dropzone for
                    books, published opinions, long-form briefs, scholarly
                    text, trial transcripts, etc. Anything dropped here is
                    force-tagged as corpus (gold) regardless of extension,
                    so a 900-page PDF book gets routed to the ground-truth
                    tier rather than generic "documents." These feed the
                    retrieval layer for scene generation + legal reasoning.
                    ═══════════════════════════════════════════════════════ */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Library size={14} className="text-[var(--gold)]" />
                    <span className="font-mono text-[10px] font-bold text-[var(--gold)] tracking-wider">
                      CORPUS · GROUND-TRUTH LIBRARY
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      — books, treatises, long-form text for retrieval grounding
                    </span>
                  </div>
                  <label
                    onDragOver={handleCorpusDragOver}
                    onDragLeave={handleCorpusDragLeave}
                    onDrop={handleCorpusDrop}
                    className={cn(
                      "border-2 border-dashed px-6 py-7 transition-all cursor-pointer block",
                      isDraggingCorpus
                        ? "border-[var(--gold)] bg-[var(--gold)]/10"
                        : "border-[var(--gold)]/40 hover:border-[var(--gold)] bg-[var(--gold)]/[0.03]"
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, { forceCorpus: true })}
                      accept=".pdf,.epub,.txt,.md,.markdown,.rtf,.docx,.doc,.mobi,.azw3,.fb2,.djvu,.tex,.zip"
                    />
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[var(--gold)]/10 flex items-center justify-center shrink-0 border border-[var(--gold)]/40">
                        <BookOpen size={26} className="text-[var(--gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-base font-bold text-[var(--gold)]">
                          Drop books &amp; corpora for ground truth
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground mt-1">
                          EPUB · PDF · TXT · MD · RTF · MOBI · AZW3 · DJVU · TEX · ZIP — up to 500MB per file
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          Chunked, embedded, and indexed for retrieval. Feeds
                          <span className="text-[var(--gold)] font-bold"> scene generation</span>,
                          <span className="text-[var(--gold)] font-bold"> legal reasoning</span>,
                          and <span className="text-[var(--gold)] font-bold">character voice</span>.
                        </p>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-1 shrink-0 pr-1">
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--gold)]/80 tracking-wider">
                          <Brain size={10} /> RETRIEVAL-GROUND
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground tracking-wider">
                          <Hash size={10} /> CHUNK + EMBED
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground tracking-wider">
                          <FileSearch size={10} /> CITE-ABLE
                        </div>
                      </div>
                    </div>
                  </label>
                  {/* Examples — quick seeds so users see what belongs here */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-wider">
                      GOOD FITS →
                    </span>
                    {[
                      "Federal Rules of Evidence",
                      "Trial transcripts",
                      "Luigi Mangione manifesto",
                      "Healthcare-industry reporting",
                      "Crim-pro treatises",
                      "Judge Garnett's published opinions",
                    ].map(sample => (
                      <span
                        key={sample}
                        className="font-mono text-[9px] px-1.5 py-0.5 border border-[var(--gold)]/25 text-[var(--gold)]/70"
                      >
                        {sample}
                      </span>
                    ))}
                  </div>

                  {/* ═══════════════════════════════════════════════════
                      MODULE 6 — Source Ingest entry point. Different
                      verb than the corpus dropzone above: the dropzone
                      is for raw retrieval grounding ("dump these and
                      cite them later"); this button is for structured
                      narrative extraction ("read the book FOR me and
                      give me characters/themes/arcs/beats").
                      ═══════════════════════════════════════════════════ */}
                  {onOpenIngest && (
                    <div className="mt-3 flex items-center justify-between gap-3 px-3 py-2.5 border border-[var(--gold)]/30 bg-[var(--gold)]/[0.04]">
                      <div className="flex items-center gap-2 min-w-0">
                        <Brain size={14} className="text-[var(--gold)] shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] font-bold text-[var(--gold)] tracking-wider">
                            NARRATIVE EXTRACTION
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground truncate">
                            Have AI read a book or longform piece and break it into
                            characters, themes, arcs, beats, season scope.
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={onOpenIngest}
                        className="shrink-0 px-3 py-1.5 border-2 border-[var(--gold)] bg-[var(--gold)] text-[var(--background)] font-mono text-[10px] font-bold tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5"
                      >
                        <Plus size={12} />
                        INGEST SOURCE
                      </button>
                    </div>
                  )}
                </div>

                {/* ═════════════════════════════════════════════════════
                    SOURCE LIBRARY — renders one card per ingested source
                    so the user can revisit reports without re-uploading.
                    Hidden until at least one source has been ingested
                    (no empty-state noise on first load).
                    ═════════════════════════════════════════════════════ */}
                {ingestedSources.length > 0 && onOpenSourceReport && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Library size={14} className="text-[var(--gold)]" />
                      <span className="font-mono text-[10px] font-bold text-[var(--gold)] tracking-wider">
                        SOURCE LIBRARY
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        — {ingestedSources.length} ingested {ingestedSources.length === 1 ? "source" : "sources"}, click to revisit the report
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {ingestedSources.map(src => (
                        <button
                          key={src.id}
                          onClick={() => onOpenSourceReport(src)}
                          className={cn(
                            "flex items-start gap-3 p-3 text-left",
                            "border border-[var(--gold)]/30 bg-[var(--surface)]",
                            "hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all"
                          )}
                        >
                          <div className="w-9 h-9 shrink-0 bg-[var(--gold)]/10 border border-[var(--gold)]/40 flex items-center justify-center">
                            <BookOpen size={16} className="text-[var(--gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-sans text-[12px] font-bold text-[var(--foreground)] truncate">
                              {src.title}
                            </div>
                            <div className="font-mono text-[9px] text-muted-foreground truncate">
                              {src.author} · {src.type} → {src.format}
                            </div>
                            <div className="mt-1 flex items-center gap-2 font-mono text-[9px] text-[var(--gold)]/80">
                              <span>{src.report.characters.length} chars</span>
                              <span className="opacity-50">·</span>
                              <span>{src.report.beats.length} beats</span>
                              <span className="opacity-50">·</span>
                              <span>{src.report.seasonScope.seasons}×{src.report.seasonScope.episodes}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity size={12} className="text-purple" />
                      <span className="font-mono text-[10px] font-bold text-purple tracking-wider">
                        IN FLIGHT · {Object.keys(uploadProgress).length} file{Object.keys(uploadProgress).length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                      <div key={fileId} className="flex items-center gap-3 p-3 bg-surface border border-border">
                        <div className="w-8 h-8 bg-purple/20 flex items-center justify-center">
                          <FileText size={16} className="text-purple" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs">{fileId.split("-")[0]}</span>
                            <span className="font-mono text-xs text-muted-foreground">{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-border overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple to-pink transition-all duration-200"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ALTERNATE UPLOAD CHANNELS */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Google Drive */}
                  <button
                    className={cn(
                      "flex items-center gap-3 p-4",
                      "border-2 border-border bg-card",
                      "hover:border-cyan hover:bg-cyan/5 transition-all text-left"
                    )}
                  >
                    <div className="w-10 h-10 bg-cyan/20 flex items-center justify-center shrink-0">
                      <FolderOpen size={20} className="text-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold text-cyan">CONNECT GOOGLE DRIVE</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">
                        Pull folders of refs, scripts, transcripts
                      </div>
                    </div>
                    <ExternalLink size={12} className="text-muted-foreground shrink-0" />
                  </button>

                  {/* PACER */}
                  <button
                    className={cn(
                      "flex items-center gap-3 p-4",
                      "border-2 border-border bg-card",
                      "hover:border-red hover:bg-red/5 transition-all text-left"
                    )}
                  >
                    <div className="w-10 h-10 bg-red/20 flex items-center justify-center shrink-0">
                      <Scale size={20} className="text-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold text-red">LINK PACER DOCKET</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate">
                        Auto-sync filings into Case Evidence
                      </div>
                    </div>
                    <ExternalLink size={12} className="text-muted-foreground shrink-0" />
                  </button>
                </div>

                {/* AI Auto-Labeling */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-cyan" />
                    <span className="font-mono text-[10px] font-bold text-cyan tracking-wider">AI AUTO-LABELING</span>
                    <span className="font-mono text-[9px] text-muted-foreground">— runs on every file after upload</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AI_CAPABILITIES.map((cap, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2",
                          "border border-border bg-card",
                          "hover:border-current transition-colors"
                        )}
                        style={{ color: cap.color }}
                      >
                        <cap.icon size={14} />
                        <span className="font-mono text-[10px]">{cap.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips — guidance for uploaders */}
                <div className="border border-yellow/30 bg-yellow/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangleIcon size={14} className="text-yellow" />
                    <span className="font-mono text-[10px] font-bold text-yellow tracking-wider">UPLOADER TIPS</span>
                  </div>
                  <ul className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow shrink-0">→</span>
                      <span>
                        Text-based PDFs index best. For scans, run OCR first or upload images — our vision
                        models handle them, but they take longer.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow shrink-0">→</span>
                      <span>
                        Name files descriptively (<code className="text-cyan">"smith-depo-2025-09-12.pdf"</code>
                        beats <code className="text-cyan">"scan0021.pdf"</code>) — it helps the AI tag
                        and cross-reference them.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow shrink-0">→</span>
                      <span>
                        Group related exhibits into ZIPs. We'll unpack, classify, and line them up in the
                        <span className="text-cyan font-bold"> Organize </span> view.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow shrink-0">→</span>
                      <span>
                        Audio and video get transcribed + scene-detected automatically. Expect 1-2 min
                        per 10 min of runtime.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[var(--gold)] shrink-0">→</span>
                      <span>
                        Books and long-form text (EPUB, TXT, large PDFs) go to
                        <span className="text-[var(--gold)] font-bold"> Corpus / Ground Truth</span> —
                        we chunk by chapter &amp; section, embed them, and cite passages back when the
                        model writes. Great for treatises, published opinions, trial transcripts, and
                        subject-matter nonfiction tied to the case.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* ═════════════════════════════════════════════════════════
                ORGANIZE TAB — this is where uploaded/populated evidence
                lives. The 3-way filter (Case / User / All) controls what
                grids render below it. Timelines + Docket are always visible
                (they're case-wide context, not per-bucket).
                ═════════════════════════════════════════════════════════ */}
            {activeTab === "organize" && (
              <div className="space-y-6">
                {/* ═══ EVIDENCE CATEGORY TOGGLE — 3-way switch ═══ */}
                <div className="border border-border bg-surface-alt/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={14} className="text-cyan" />
                      <span className="font-mono text-xs font-bold text-cyan tracking-wider">EVIDENCE VIEW</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        — toggle what appears in the board below
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {enabledCount}/{totalCount} sources active
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all" as const, label: "ALL", icon: Layers, color: "var(--cyan)", count: totalCount, desc: "Everything, unified" },
                      { id: "case" as const, label: "CASE EVIDENCE", icon: Scale, color: "var(--red)", count: caseEvidence.length, desc: "Docket-sourced filings" },
                      { id: "user" as const, label: "USER EVIDENCE", icon: ImagePlus, color: "var(--purple)", count: secondaryEvidence.length, desc: "Your uploads & refs" },
                    ].map((opt) => {
                      const active = evidenceView === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setEvidenceView(opt.id)}
                          className={cn(
                            "flex items-start gap-3 p-3 text-left",
                            "border-2 transition-all",
                            active
                              ? "bg-current/10 shadow-[3px_3px_0_var(--shadow-color)]"
                              : "border-border hover:border-current/50 opacity-70 hover:opacity-100"
                          )}
                          style={{ color: opt.color, borderColor: active ? opt.color : undefined }}
                        >
                          <div
                            className="w-8 h-8 flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `color-mix(in srgb, ${opt.color} 20%, transparent)` }}
                          >
                            <opt.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold tracking-wider">{opt.label}</span>
                              <span
                                className="px-1.5 py-0.5 font-mono text-[9px] font-bold"
                                style={{ backgroundColor: active ? opt.color : "transparent", color: active ? "var(--background)" : opt.color, border: `1px solid ${opt.color}` }}
                              >
                                {opt.count}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* ═══ CASE EVIDENCE GRID — visible in "case" + "all" ═══ */}
                {(evidenceView === "case" || evidenceView === "all") && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Scale size={14} className="text-red" />
                        <span className="font-mono text-[10px] font-bold text-red tracking-wider">CASE EVIDENCE — FROM THE DOCKET</span>
                        <span className="px-1.5 py-0.5 bg-red/10 border border-red/30 font-mono text-[9px] font-bold text-red">{caseEvidence.length}</span>
                      </div>
                      <span className="font-mono text-[9px] text-muted-foreground">Auto-synced from PACER</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {caseEvidence.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleAsset(item.id, true)}
                          className={cn(
                            "flex items-start gap-3 p-3 text-left",
                            "border bg-card transition-all",
                            item.enabled
                              ? "border-current shadow-[inset_0_0_20px_-10px_currentColor]"
                              : "border-border opacity-50 hover:opacity-80"
                          )}
                          style={{ color: item.color }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-current/10">
                            <item.icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs font-bold text-foreground truncate">{item.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[9px] text-muted-foreground">{item.date}</span>
                              <span className="px-1 py-0.5 font-mono text-[8px] font-bold" style={{ backgroundColor: `color-mix(in srgb, ${item.color} 20%, transparent)`, color: item.color }}>
                                {item.tier}
                              </span>
                              <span className="font-mono text-[8px] text-muted-foreground uppercase">{item.type}</span>
                            </div>
                          </div>
                          <div className={cn("w-3 h-3 shrink-0 rounded-full border-2", item.enabled ? "bg-current border-current" : "border-muted-foreground")} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ═══ MOOD BOARD — modality-aware scene reference library ═══
                    Renders photo / audio / video / doc cards with distinct UI
                    per modality. Visible in "case" + "all" views. ═══ */}
                {(evidenceView === "case" || evidenceView === "all") && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Grid3X3 size={14} className="text-orange" />
                        <span className="font-mono text-[10px] font-bold text-orange tracking-wider">FROM CASE EVIDENCE</span>
                        <span className="px-1.5 py-0.5 bg-orange/10 border border-orange/30 font-mono text-[9px] font-bold text-orange">{MOOD_CATEGORIES.length} ITEMS</span>
                        <span className="font-mono text-[9px] text-muted-foreground">— scene reference library derived from the record</span>
                      </div>
                      {/* Modality legend */}
                      <div className="flex items-center gap-2">
                        <ModalityChip icon={ImageIcon} label="PHOTO" color="var(--red)" />
                        <ModalityChip icon={Volume2} label="AUDIO" color="var(--green)" />
                        <ModalityChip icon={Video} label="VIDEO" color="var(--cyan)" />
                        <ModalityChip icon={FileText} label="DOC" color="var(--purple)" />
                      </div>
                    </div>

                    {/* Masonry-ish 3-col grid. Photo/video tiles are square-ish;
                        audio + doc tiles are wider rows in the right column. */}
                    <div className="grid grid-cols-3 gap-3">
                      {MOOD_CATEGORIES.map((asset) => (
                        <MoodAssetCard key={asset.id} asset={asset} />
                      ))}
                      {/* Add-new tile */}
                      <button
                        onClick={() => setActiveTab("upload")}
                        className="border-2 border-dashed border-purple/40 flex flex-col items-center justify-center py-10 hover:border-purple hover:bg-purple/5 cursor-pointer transition-all"
                      >
                        <Plus size={18} className="text-purple mb-1" />
                        <span className="font-mono text-[10px] text-purple font-bold">Add item</span>
                        <span className="font-mono text-[8px] text-muted-foreground mt-0.5">photo · audio · video · doc</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══ USER EVIDENCE — visible in "user" + "all" ═══ */}
                {(evidenceView === "user" || evidenceView === "all") && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ImagePlus size={14} className="text-purple" />
                        <span className="font-mono text-[10px] font-bold text-purple tracking-wider">USER EVIDENCE — MOOD BOARD</span>
                        <span className="px-1.5 py-0.5 bg-purple/10 border border-purple/30 font-mono text-[9px] font-bold text-purple">{secondaryEvidence.length} ITEMS</span>
                        <span className="font-mono text-[9px] text-muted-foreground">— your uploads &amp; writer&apos;s reference scrapbook</span>
                      </div>
                      {/* Modality legend (mirrors the case mood-board header). */}
                      <div className="flex items-center gap-2">
                        <ModalityChip icon={ImageIcon} label="PHOTO" color="var(--red)" />
                        <ModalityChip icon={Volume2} label="AUDIO" color="var(--green)" />
                        <ModalityChip icon={Video} label="VIDEO" color="var(--cyan)" />
                        <ModalityChip icon={FileText} label="DOC" color="var(--purple)" />
                      </div>
                    </div>

                    {/* ═══ USER MOOD BOARD GRID ═══
                        Same MoodAssetCard renderer as the case-side mood board,
                        but each card is toggleable (click to include/exclude
                        from the generated script). Off-state cards dim +
                        desaturate so the active set is instantly readable. */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {secondaryEvidence.map((asset) => (
                        <MoodAssetCard
                          key={asset.id}
                          asset={asset}
                          enabled={asset.enabled}
                          onToggle={() => toggleAsset(asset.id, false)}
                        />
                      ))}
                      {/* Add-new tile — styled like the case-side add tile but
                          scoped to user uploads. Routes back to the Upload tab. */}
                      <button
                        onClick={() => setActiveTab("upload")}
                        className="border-2 border-dashed border-purple/40 flex flex-col items-center justify-center py-10 hover:border-purple hover:bg-purple/5 cursor-pointer transition-all"
                      >
                        <Plus size={18} className="text-purple mb-1" />
                        <span className="font-mono text-[10px] text-purple font-bold">Add reference</span>
                        <span className="font-mono text-[8px] text-muted-foreground mt-0.5">photo · audio · video · doc</span>
                      </button>
                    </div>

                    {/* User Evidence actions row */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("upload")}
                        className="px-4 py-2 flex items-center gap-2 bg-purple text-[var(--foreground)] font-mono text-xs font-bold hover:bg-purple/90 transition-colors"
                      >
                        <Upload size={14} />
                        Upload More
                      </button>
                      <button
                        onClick={() => handleQuickAction("AI Summarize")}
                        className="px-4 py-2 flex items-center gap-2 border-2 border-border font-mono text-xs font-bold hover:border-cyan hover:text-cyan transition-colors"
                      >
                        <Sparkles size={14} />
                        Analyze All
                      </button>
                      <button
                        className="px-4 py-2 flex items-center gap-2 border-2 border-border font-mono text-xs font-bold hover:border-green hover:text-green transition-colors"
                      >
                        <FolderOpen size={14} />
                        Connect Drive
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══ DOCKET — always visible (case-wide context) ═══ */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-purple" />
                    <span className="font-mono text-xs font-bold text-purple tracking-wider">CASE DOCKET</span>
                    <span className="px-1.5 py-0.5 bg-purple/20 text-purple font-mono text-[10px] font-bold">{DOCKET_ENTRIES.length}</span>
                  </div>
                  <div className="border border-border overflow-hidden">
                    {DOCKET_ENTRIES.map((entry, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3 border-b border-border last:border-0",
                          "hover:bg-surface-alt transition-colors cursor-pointer",
                          entry.indent && "pl-8"
                        )}
                      >
                        {entry.num > 0 && (
                          <span className={cn(
                            "w-8 text-right font-mono text-sm font-bold",
                            entry.num === 105 ? "text-yellow" : "text-purple"
                          )}>{entry.num}</span>
                        )}
                        {entry.num === 0 && <span className="w-8" />}
                        <span className="flex-1 font-mono text-sm">{entry.title}</span>
                        <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleQuickAction("AI Summarize")}
                      className="px-4 py-2 flex items-center gap-2 bg-red text-[var(--foreground)] font-mono text-xs font-bold hover:bg-red/90 transition-colors"
                    >
                      <Sparkles size={14} />
                      AI Summarize
                    </button>
                    <button
                      onClick={() => handleQuickAction("Generate Script")}
                      className="px-4 py-2 flex items-center gap-2 border-2 border-border font-mono text-xs font-bold hover:border-purple hover:text-purple transition-colors"
                    >
                      <Film size={14} />
                      Generate Treatment
                    </button>
                    <button
                      onClick={handleExportDocket}
                      className="px-4 py-2 flex items-center gap-2 border-2 border-border font-mono text-xs font-bold hover:border-green hover:text-green transition-colors"
                    >
                      <Download size={14} />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* ═══ TIMELINES — always visible (case-wide context) ═══ */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-cyan" />
                      <span className="font-mono text-xs font-bold text-cyan tracking-wider">TIMELINES</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {Object.entries(LANES).map(([key, lane]) => (
                        <button
                          key={key}
                          onClick={() => toggleLane(key)}
                          className={cn(
                            "px-3 py-1.5 flex items-center gap-2",
                            "font-mono text-[10px] font-bold border-2 transition-all",
                            visibleLanes.has(key)
                              ? "border-current bg-current/10"
                              : "border-border text-muted-foreground opacity-50"
                          )}
                          style={{ color: visibleLanes.has(key) ? lane.color : undefined }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lane.color }} />
                          {lane.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TIMELINE_EVENTS.filter(e => visibleLanes.has(e.lane)).map((event, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 flex items-center gap-2 border-2 bg-card cursor-pointer hover:shadow-md transition-all"
                        style={{ borderColor: LANES[event.lane as keyof typeof LANES].color, borderLeftWidth: '4px' }}
                      >
                        <span className="font-mono text-[10px] font-bold" style={{ color: LANES[event.lane as keyof typeof LANES].color }}>
                          {event.date}
                        </span>
                        <span className="font-mono text-[11px]">{event.title}</span>
                        <MoreHorizontal size={14} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══ LEGAL INTELLIGENCE — moved here from Upload ═══ */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Scale size={14} className="text-green" />
                    <span className="font-mono text-[10px] font-bold text-green tracking-wider">LEGAL INTELLIGENCE</span>
                    <span className="px-1.5 py-0.5 bg-green/10 border border-green/30 font-mono text-[8px] font-bold text-green animate-pulse">LIVE</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {LEGAL_INTELLIGENCE.map((metric) => (
                      <div key={metric.id} className="border-2 border-border bg-card p-3 hover:border-current transition-colors group cursor-default" style={{ borderLeftColor: metric.color, borderLeftWidth: '3px' }}>
                        <div className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</div>
                        <div className="flex items-end gap-1.5">
                          <span className="font-sans text-xl font-black" style={{ color: metric.color }}>{metric.value}</span>
                          <span className="font-mono text-[9px] text-muted-foreground mb-0.5">{metric.unit}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp size={8} style={{ color: metric.color }} />
                          <span className="font-mono text-[8px]" style={{ color: metric.color }}>{metric.trend}</span>
                        </div>
                        <div className="font-mono text-[7px] text-muted-foreground mt-1">{metric.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileSearch size={12} className="text-cyan" />
                      <span className="font-mono text-[9px] font-bold text-cyan tracking-wider">FED. R. CRIM. P. — APPLICABLE</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FRCP_QUICK_REF.map((rule, i) => (
                        <div
                          key={i}
                          className={cn(
                            "px-2 py-2 border bg-card cursor-pointer transition-all",
                            rule.active
                              ? "border-cyan/40 hover:border-cyan hover:bg-cyan/5"
                              : "border-border opacity-50 hover:opacity-80"
                          )}
                        >
                          <div className="font-mono text-[9px] font-bold text-cyan">{rule.rule}</div>
                          <div className="font-mono text-[8px] text-foreground truncate">{rule.title}</div>
                          <div className="font-mono text-[7px] text-muted-foreground mt-0.5">{rule.deadline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* SCREENPLAY TAB */}
            {activeTab === "screenplay" && (
              <div className="space-y-8">
                {/* Dramatization Engine Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink/30 to-purple/30 flex items-center justify-center">
                      <Wand2 size={20} className="text-pink" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-pink tracking-widest">DRAMATIZATION ENGINE</span>
                      <h3 className="font-sans text-xl font-black text-foreground">Dramatization Level</h3>
                    </div>
                  </div>
                  {savedScripts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{savedScripts.length} saved</span>
                      <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* ═══ DRAMATIZATION SCRUBBER — fluid horizontal slider ═══
                    Replaces the old stepped-box radio group. Uses a native
                    <input type="range"> styled as a gradient scrubber across
                    the 5 stops. Dragging the thumb feels continuous even
                    though the state snaps to integer DramaLevels on commit.
                    The gradient track bakes in the full palette journey so
                    users see what's coming before they get there. */}
                <DramaScrubber
                  value={dramaLevel}
                  onChange={setDramaLevel}
                  disabled={isGenerating}
                  assetsSelected={enabledCount}
                />

                {/* ═══ SCRIPT META HEADER — working title + stats strip ═══
                    Flagship chrome: users see their script's identity and
                    the shape of what they're building (pages, runtime,
                    scenes, characters) the moment they land on this tab. */}
                <div className="border border-border bg-gradient-to-br from-pink/5 via-transparent to-purple/5 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Film size={14} className="text-pink" />
                    <span className="font-mono text-[10px] font-bold text-pink tracking-widest">WORKING TITLE</span>
                    <input
                      type="text"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-pink/50 font-sans text-2xl font-black tracking-widest text-foreground outline-none transition-colors"
                      placeholder="UNTITLED"
                      disabled={isGenerating}
                    />
                    <span className="font-mono text-[9px] text-muted-foreground">
                      Drafted from <span className="text-red">USA v. Mangione</span>
                    </span>
                  </div>
                  {/* Stats strip */}
                  <div className="grid grid-cols-5 gap-2">
                    <ScriptStat label="PAGES" value={generatedScript ? Math.max(1, Math.ceil(generatedScript.length / 450)).toString() : "—"} color="var(--cyan)" icon={FileText} />
                    <ScriptStat label="RUNTIME" value={generatedScript ? `~${Math.max(1, Math.ceil(generatedScript.length / 450))} min` : "—"} color="var(--green)" icon={Clock} />
                    <ScriptStat label="SCENES" value={generatedScript ? (generatedScript.match(/^(INT\.|EXT\.)/gm)?.length || 1).toString() : "—"} color="var(--amber)" icon={Layers} />
                    <ScriptStat label="WORDS" value={generatedScript ? generatedScript.split(/\s+/).length.toLocaleString() : "—"} color="var(--purple)" icon={Hash} />
                    <ScriptStat label="DRAFT" value={savedScripts.length > 0 ? `v${savedScripts.length + 1}` : "v1"} color="var(--pink)" icon={Edit3} />
                  </div>
                </div>

                {/* ═══ PRODUCTION CONTROLS — POV · Length · Format ═══ */}
                <div className="grid grid-cols-3 gap-3">
                  {/* LENGTH */}
                  <div className="border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer size={12} className="text-cyan" />
                      <span className="font-mono text-[10px] font-bold text-cyan tracking-wider">LENGTH</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { id: "cold-open", label: "Cold Open", mins: "3m" },
                        { id: "teaser", label: "Teaser", mins: "8m" },
                        { id: "half-hour", label: "Half Hour", mins: "22m" },
                        { id: "hour", label: "Hour", mins: "42m" },
                        { id: "pilot", label: "Pilot", mins: "60m" },
                        { id: "feature", label: "Feature", mins: "110m" },
                      ] as const).map((opt) => {
                        const active = scriptLength === opt.id
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setScriptLength(opt.id)}
                            disabled={isGenerating}
                            className={cn(
                              "p-2 flex flex-col items-start gap-0.5 text-left transition-all border",
                              active
                                ? "border-cyan bg-cyan/10 text-cyan shadow-[2px_2px_0_var(--shadow-color)]"
                                : "border-border text-muted-foreground hover:border-cyan/40 hover:text-foreground"
                            )}
                          >
                            <span className="font-sans text-[11px] font-bold">{opt.label}</span>
                            <span className="font-mono text-[8px] opacity-70">{opt.mins}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* POINT OF VIEW */}
                  <div className="border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={12} className="text-purple" />
                      <span className="font-mono text-[10px] font-bold text-purple tracking-wider">POINT OF VIEW</span>
                    </div>
                    <div className="space-y-1.5">
                      {([
                        { id: "prosecution", label: "Prosecution", desc: "Gov't as protagonist", color: "var(--red)" },
                        { id: "defense", label: "Defense", desc: "Counsel's narrative arc", color: "var(--cyan)" },
                        { id: "defendant", label: "Defendant", desc: "Interior monologue", color: "var(--purple)" },
                        { id: "omniscient", label: "Omniscient", desc: "Birds-eye, impartial", color: "var(--amber)" },
                        { id: "press", label: "Press Gallery", desc: "Court reporter POV", color: "var(--orange)" },
                      ] as const).map((opt) => {
                        const active = scriptPOV === opt.id
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setScriptPOV(opt.id)}
                            disabled={isGenerating}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 text-left transition-all",
                              active ? "bg-current/10" : "hover:bg-surface-alt opacity-70 hover:opacity-100"
                            )}
                            style={{ color: active ? opt.color : "var(--muted-foreground)" }}
                          >
                            <div
                              className="w-2 h-2 rounded-full border"
                              style={{
                                backgroundColor: active ? opt.color : "transparent",
                                borderColor: opt.color,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-sans text-[11px] font-bold text-foreground">{opt.label}</div>
                              <div className="font-mono text-[8px] text-muted-foreground truncate">{opt.desc}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* FORMAT */}
                  <div className="border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={12} className="text-amber" />
                      <span className="font-mono text-[10px] font-bold text-amber tracking-wider">FORMAT</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {([
                        { id: "screenplay", label: "Screenplay", sub: "feature / film" },
                        { id: "teleplay", label: "Teleplay", sub: "TV / streaming" },
                        { id: "stage", label: "Stage Play", sub: "theatrical" },
                        { id: "treatment", label: "Treatment", sub: "prose outline" },
                      ] as const).map((opt) => {
                        const active = scriptFormat === opt.id
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setScriptFormat(opt.id)}
                            disabled={isGenerating}
                            className={cn(
                              "p-2 flex flex-col items-start gap-0.5 text-left transition-all border",
                              active
                                ? "border-amber bg-amber/10 text-amber shadow-[2px_2px_0_var(--shadow-color)]"
                                : "border-border text-muted-foreground hover:border-amber/40 hover:text-foreground"
                            )}
                          >
                            <span className="font-sans text-[11px] font-bold">{opt.label}</span>
                            <span className="font-mono text-[8px] opacity-70">{opt.sub}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="pt-3 border-t border-border">
                      <div className="font-mono text-[8px] font-bold text-muted-foreground tracking-wider mb-1.5">EXPORT AS</div>
                      <div className="flex flex-wrap gap-1">
                        {["PDF", "FDX", "Fountain", "DOCX", "TXT"].map((fmt) => (
                          <button
                            key={fmt}
                            disabled={!generatedScript || isGenerating}
                            className="px-2 py-0.5 border border-border font-mono text-[9px] font-bold text-muted-foreground hover:border-amber hover:text-amber transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={`Export as ${fmt}`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Preview OR Generated Script */}
                {!generatedScript && !isGenerating ? (
                  <div className="relative group">
                    <div 
                      className="absolute inset-0 rounded-xl opacity-50 blur-xl transition-opacity group-hover:opacity-70"
                      style={{ background: `linear-gradient(135deg, ${dramColor}20, transparent)` }}
                    />
                    <div className={cn(
                      "relative p-6 border-2 border-l-4 rounded-xl",
                      "bg-card/50 backdrop-blur-sm"
                    )}
                    style={{ borderLeftColor: dramColor }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Eye size={14} style={{ color: dramColor }} />
                        <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: dramColor }}>
                          TREATMENT PREVIEW
                        </span>
                      </div>
                      <p className="font-serif text-lg italic text-foreground/90 leading-relaxed">
                        {dramText}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="absolute inset-0 rounded-xl opacity-30 blur-xl"
                      style={{ background: `linear-gradient(135deg, ${dramColor}20, transparent)` }}
                    />
                    <div className={cn(
                      "relative border-2 border-l-4 rounded-xl",
                      "bg-card/80 backdrop-blur-sm",
                      isEditing && "ring-2 ring-pink/50"
                    )}
                    style={{ borderLeftColor: dramColor }}
                    >
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Film size={14} style={{ color: dramColor }} />
                          <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: dramColor }}>
                            {isGenerating ? "GENERATING SCRIPT..." : isEditing ? "EDITING SCRIPT" : "GENERATED SCRIPT"}
                          </span>
                          {isGenerating && (
                            <div className="w-4 h-4 border-2 border-pink border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                        {!isGenerating && (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {dramLabel} · L{dramaLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <textarea
                          value={editableScript}
                          onChange={(e) => setEditableScript(e.target.value)}
                          className="w-full h-64 p-6 bg-transparent font-mono text-sm text-foreground/90 leading-relaxed resize-none focus:outline-none"
                          placeholder="Edit your script here..."
                        />
                      ) : (
                        <div className="p-6 max-h-64 overflow-y-auto">
                          <pre className="font-mono text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {generatedScript}
                            {isGenerating && <span className="inline-block w-2 h-4 bg-pink animate-pulse ml-1" />}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleGenerateScript}
                      disabled={isGenerating}
                      className={cn(
                        "px-6 py-3 flex items-center gap-2",
                        "bg-gradient-to-r from-pink to-purple text-[var(--foreground)]",
                        "font-mono text-sm font-bold",
                        "rounded-lg shadow-lg shadow-pink/20",
                        "hover:shadow-xl hover:shadow-pink/30 hover:scale-[1.02]",
                        "active:scale-[0.98] transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      )}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate Script
                        </>
                      )}
                    </button>
                    <button 
                      onClick={isEditing ? () => setIsEditing(false) : handleEditScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg transition-all duration-200",
                        isEditing 
                          ? "border-pink text-pink bg-pink/10" 
                          : "border-border hover:border-pink hover:text-pink",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Edit3 size={16} />
                      {isEditing ? "Done" : "Edit"}
                    </button>
                    <button 
                      onClick={handleSaveScript}
                      disabled={(!generatedScript && !editableScript) || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-cyan hover:text-cyan",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button 
                      onClick={handleRegenerateScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-orange hover:text-orange",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} />
                      Regenerate
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleCopyScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg transition-all duration-200",
                        copySuccess 
                          ? "border-green text-green bg-green/10" 
                          : "border-border hover:border-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                      {copySuccess ? "Copied!" : "Copy"}
                    </button>
                    <button 
                      onClick={handleShareScript}
                      disabled={!generatedScript || isGenerating}
                      className={cn(
                        "px-4 py-3 flex items-center gap-2",
                        "border-2 border-border text-foreground",
                        "font-mono text-sm font-bold",
                        "rounded-lg hover:border-foreground",
                        "transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
                
                {/* Saved Scripts */}
                {savedScripts.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers size={14} className="text-cyan" />
                      <span className="font-mono text-[10px] font-bold text-cyan tracking-widest">SAVED SCRIPTS</span>
                    </div>
                    <div className="space-y-2">
                      {savedScripts.slice(0, 3).map((script) => (
                        <div 
                          key={script.id}
                          className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-cyan/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setGeneratedScript(script.content)
                            setEditableScript(script.content)
                            setDramaLevel(script.dramaLevel)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Film size={14} className="text-muted-foreground" />
                            <span className="font-mono text-sm">{script.name}</span>
                          </div>
                          <span
                            className="font-mono text-[10px] font-bold px-1.5 py-0.5"
                            style={{
                              color: DRAMA_LEVELS[script.dramaLevel].color,
                              border: `2px solid ${DRAMA_LEVELS[script.dramaLevel].color}`,
                            }}
                          >
                            {DRAMA_LEVELS[script.dramaLevel].short} · L{script.dramaLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* COLLAB TAB */}
            {activeTab === "collab" && (
              <div className="space-y-6">
                {/* Collaboration Header */}
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green" />
                  <span className="font-mono text-xs font-bold text-green tracking-wider">COLLABORATION</span>
                </div>
                
                {/* Invite Section */}
                <div className="border border-border  p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-purple" />
                    <span className="font-mono text-[10px] font-bold text-purple tracking-wider">INVITE TO CASE</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={cn(
                        "flex-1 px-4 py-3 bg-surface-alt",
                        "border border-border",
                        "font-mono text-sm placeholder:text-muted-foreground",
                        "",
                        "focus:outline-none focus:border-green"
                      )}
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className={cn(
                        "px-4 py-3 bg-surface-alt",
                        "border border-border",
                        "font-mono text-sm",
                        "",
                        "focus:outline-none focus:border-green"
                      )}
                    >
                      <option>Collaborator</option>
                      <option>Viewer</option>
                      <option>Admin</option>
                    </select>
                    <button 
                      onClick={handleInviteMember}
                      disabled={inviteSending || !inviteEmail.trim()}
                      className={cn(
                        "px-6 py-3",
                        "bg-green text-[var(--foreground)]",
                        "font-mono text-sm font-bold",
                        "",
                        "hover:bg-green/90 transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {inviteSending ? (
                        <div className="w-4 h-4 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "INVITE"
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Eye size={10} className="text-cyan" />
                      Viewer — Read only
                    </span>
                    <span className="flex items-center gap-1">
                      <Edit3 size={10} className="text-yellow" />
                      Collaborator — Add/edit evidence
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings size={10} className="text-green" />
                      Admin — Full control + sharing
                    </span>
                  </div>
                </div>
                
                {/* Team Section */}
                <div className="border border-border  p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={14} className="text-yellow" />
                    <span className="font-mono text-[10px] font-bold text-yellow tracking-wider">TEAM</span>
                  </div>
                  
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-surface-alt  group"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--foreground)] font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold">{member.name}</span>
                              {member.online && (
                                <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
                              )}
                            </div>
                            <span 
                              className={cn(
                                "px-2 py-0.5 text-[10px] font-mono font-bold rounded",
                                member.role === "Admin" ? "bg-green/20 text-green" : "bg-purple/20 text-purple"
                              )}
                            >
                              {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-muted-foreground hover:text-red opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Activity Log */}
                <div className="border border-border  p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-cyan" />
                    <span className="font-mono text-[10px] font-bold text-cyan tracking-wider">ACTIVITY LOG</span>
                  </div>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {activityLog.map((entry, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0">{entry.time}</span>
                        <div className="font-mono text-sm">
                          <span className="font-bold">{entry.user}</span>
                          {" "}
                          <span style={{ color: entry.color }}>{entry.action}</span>
                          {" "}
                          <span className="text-muted-foreground">{entry.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* RIGHT SIDEBAR - Quick Actions */}
          <div className="w-56 border-l border-border overflow-y-auto bg-card p-4">
            {/* Quick Actions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-yellow" />
                <span className="font-mono text-[10px] font-bold text-yellow tracking-wider">QUICK ACTIONS</span>
              </div>
              
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action.label)}
                    className={cn(
                      "quick-action-btn",
                      "w-full flex items-center gap-3 px-3 py-2.5",
                      "border border-border bg-card",
                      "",
                      "hover:border-current hover:shadow-[inset_0_0_20px_-10px_currentColor] transition-all",
                      "text-left group"
                    )}
                    style={{ color: action.color }}
                  >
                    <action.icon size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* ═══ LEGAL INTEL — RIGHT SIDEBAR ═══ */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-green" />
                <span className="font-mono text-[8px] font-bold text-green tracking-wider">CASE PULSE</span>
              </div>

              {/* Case Strength Meter */}
              <div className="mb-3 p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[8px] text-muted-foreground">STRENGTH</span>
                  <span className="font-mono text-[10px] font-bold text-green">72%</span>
                </div>
                <div className="h-2 bg-border overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red via-orange to-green" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[7px] text-muted-foreground">Weak</span>
                  <span className="font-mono text-[7px] text-muted-foreground">Strong</span>
                </div>
              </div>

              {/* Deadline Countdown */}
              <div className="mb-3 p-2.5 border border-red/30 bg-red/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer size={10} className="text-red" />
                  <span className="font-mono text-[8px] font-bold text-red">NEXT DEADLINE</span>
                </div>
                <div className="font-mono text-[11px] font-bold text-foreground">Mot. in Limine</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">Apr 25, 2026</span>
                  <span className="px-1.5 py-0.5 bg-red text-[var(--foreground)] font-mono text-[8px] font-bold">17 DAYS</span>
                </div>
              </div>

              {/* Judge Analytics Mini */}
              <div className="mb-3 p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Gavel size={10} className="text-cyan" />
                  <span className="font-mono text-[8px] font-bold text-cyan">JUDGE GENTRY</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Govt win rate</span>
                    <span className="font-mono text-[9px] font-bold text-cyan">64%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Avg. sentence</span>
                    <span className="font-mono text-[9px] font-bold text-orange">+12% above guideline</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] text-muted-foreground">Suppress. denied</span>
                    <span className="font-mono text-[9px] font-bold text-red">78%</span>
                  </div>
                </div>
              </div>

              {/* Shepardize Signal */}
              <div className="p-2.5 bg-surface-alt border border-border">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity size={10} className="text-purple" />
                  <span className="font-mono text-[8px] font-bold text-purple">CITE CHECK</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green" />
                    <span className="font-mono text-[8px]">12 valid citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange" />
                    <span className="font-mono text-[8px]">3 questioned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red" />
                    <span className="font-mono text-[8px]">1 overruled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Close button floating */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-20 right-4 z-20",
            "px-4 py-2 flex items-center gap-2",
            "bg-red text-[var(--foreground)]",
            "font-mono text-xs font-bold",
            "",
            "hover:bg-red/90 transition-colors shadow-lg"
          )}
        >
          <X size={14} />
          CLOSE
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SCRIPT META STAT — tiny dashboard tile for the screenplay header
// ═══════════════════════════════════════════════════════════════════
// Five of these line up above the production controls to give the writer
// a live read on their draft: page count, estimated runtime, scene count,
// word count, and draft version. Each tile carries its own accent color
// on the left border + icon so the strip reads as a dashboard, not just
// five identical chips.
//
// Values are derived, not stored — pages = ceil(chars / 450), runtime is
// pages→minutes at industry parity, scenes counts INT./EXT. slug lines,
// words is a whitespace split, draft counts saved script versions.

function ScriptStat({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  color: string
  icon: typeof FileText
}) {
  return (
    <div
      className="relative border border-border bg-card/60 px-3 py-2.5 overflow-hidden group hover:bg-card transition-colors"
      style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
    >
      {/* faint color wash on hover so the whole tile glows with its accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity pointer-events-none"
        style={{ background: color }}
      />
      <div className="relative flex items-center gap-1.5 mb-1">
        <Icon size={10} style={{ color }} />
        <span className="font-mono text-[8px] text-muted-foreground tracking-[0.14em] uppercase">
          {label}
        </span>
      </div>
      <div
        className="relative font-sans text-lg font-black leading-none tabular-nums"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DRAMATIZATION SCRUBBER — fluid horizontal slider
// ═══════════════════════════════════════════════════════════════════
// The old stepped-box UI made the most-used control feel like a radio
// quiz. This version gives it a proper scrubber: gradient track painted
// across the 5 stops, a colored thumb that glides, tick marks beneath,
// and a live "now set to" badge with the current label/color.
//
// Under the hood the state still snaps to integer DramaLevels (the whole
// rest of the app reads discrete levels 0..4), but the UX feels fluid
// because the slider accepts continuous input and only quantizes on
// commit.

function DramaScrubber({
  value,
  onChange,
  disabled,
  assetsSelected,
}: {
  value: DramaLevel
  onChange: (v: DramaLevel) => void
  disabled?: boolean
  assetsSelected: number
}) {
  const max = DRAMA_LEVELS.length - 1
  const active = DRAMA_LEVELS[value]
  // Percent position of the thumb (0..100) for painting progress + label
  const pct = (value / max) * 100

  // Build a single CSS gradient that traverses every drama color in order
  const gradientStops = DRAMA_LEVELS
    .map((dl, i) => `${dl.color} ${(i / max) * 100}%`)
    .join(", ")

  return (
    <div className="space-y-4">
      {/* Header row — current label + drama lab counter */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className="font-sans text-2xl font-black tracking-tight transition-colors duration-300"
            style={{ color: active.color }}
          >
            {active.label}
          </span>
          <span
            className="font-mono text-[11px] font-bold tracking-widest"
            style={{ color: active.color, opacity: 0.7 }}
          >
            · L{value} / L{max}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>{assetsSelected} drama lab items</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>{active.short}</span>
        </div>
      </div>

      {/* Scrubber track container */}
      <div className="relative select-none">
        {/* Gradient-painted track — visible part users see */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${gradientStops})`,
            boxShadow: `inset 0 0 0 1px var(--border), 0 0 18px -6px ${active.color}`,
            opacity: disabled ? 0.4 : 1,
          }}
          aria-hidden
        >
          {/* Dim veil past the thumb so "unreached" levels feel quieter */}
          <div
            className="absolute top-0 bottom-0 right-0 bg-[color-mix(in_srgb,var(--background)_55%,transparent)]"
            style={{ left: `${pct}%` }}
          />
        </div>

        {/* Native range input — sits on top, invisible track, custom thumb */}
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value) as DramaLevel)}
          aria-label="Dramatization level"
          aria-valuetext={active.label}
          className={cn(
            "relative w-full h-10 bg-transparent appearance-none cursor-pointer z-10",
            "focus:outline-none",
            disabled && "cursor-not-allowed",
            // webkit thumb
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[var(--foreground)]",
            "[&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.6)]",
            "[&::-webkit-slider-thumb]:transition-transform",
            "[&::-webkit-slider-thumb]:cursor-grab",
            "active:[&::-webkit-slider-thumb]:cursor-grabbing",
            "active:[&::-webkit-slider-thumb]:scale-110",
            // firefox thumb
            "[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-[var(--foreground)]",
            "[&::-moz-range-thumb]:shadow-[0_4px_12px_rgba(0,0,0,0.6)]",
            "[&::-moz-range-thumb]:cursor-grab",
            "active:[&::-moz-range-thumb]:cursor-grabbing"
          )}
          style={
            {
              // Color the custom thumb via CSS custom properties applied inline
              // so the transition tracks the active level's color.
              ["--thumb-bg" as string]: active.color,
            } as React.CSSProperties
          }
        />
        {/* Style override: inject thumb background color (can't be done via arbitrary TW variants cleanly) */}
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            background-color: var(--thumb-bg);
          }
          input[type="range"]::-moz-range-thumb {
            background-color: var(--thumb-bg);
          }
        `}</style>

        {/* Tick marks under the track — one per stop with label */}
        <div className="mt-3 flex items-start justify-between px-0">
          {DRAMA_LEVELS.map((dl) => {
            const isActive = dl.id === value
            const isPast = dl.id < value
            return (
              <button
                key={dl.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(dl.id)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 cursor-pointer",
                  "transition-all duration-200",
                  "disabled:cursor-not-allowed",
                  isActive ? "scale-[1.05]" : "hover:scale-[1.03]"
                )}
                style={{ width: `${100 / DRAMA_LEVELS.length}%` }}
                aria-label={`Jump to ${dl.label}`}
              >
                <div
                  className="w-[2px] h-2 transition-all"
                  style={{
                    backgroundColor: isActive || isPast ? dl.color : "var(--border)",
                    opacity: isActive ? 1 : 0.6,
                  }}
                />
                <span
                  className={cn(
                    "font-mono text-[9px] font-bold tracking-widest uppercase transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  style={{ color: isActive ? dl.color : undefined }}
                >
                  {dl.label}
                </span>
                <span
                  className="font-mono text-[8px] tabular-nums"
                  style={{
                    color: isActive ? dl.color : "var(--muted-foreground)",
                    opacity: isActive ? 0.9 : 0.5,
                  }}
                >
                  L{dl.id}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MOOD BOARD — modality-aware card renderer
// ═══════════════════════════════════════════════════════════════════
// Four distinct card layouts keyed by asset.modality:
//   • photo  — large emoji on a colored gradient + color-coded tag label
//   • audio  — play button + animated waveform + duration + transcript quote
//   • video  — gradient + centered play overlay + duration pill bottom-right
//   • doc    — folder icon + skeleton "page lines" + page-count pill
// All cards share: rounded border, gradient backplate, title/subtitle/date
// footer. Color comes from the asset's own `tagColor` so each card lights
// itself. Hover lifts the card + brightens the border.

function ModalityChip({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Upload
  label: string
  color: string
}) {
  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 border"
      style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      <Icon size={9} />
      <span className="font-mono text-[8px] font-bold tracking-wider">{label}</span>
    </div>
  )
}

function MoodAssetCard({
  asset,
  enabled,
  onToggle,
}: {
  asset: typeof MOOD_CATEGORIES[number]
  /** Optional — when provided, card renders a toggle dot + dims when off. */
  enabled?: boolean
  /** Fires when the toggle dot is clicked (user mood board only). */
  onToggle?: () => void
}) {
  const [from, to] = asset.gradient
  const gradient = `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
  const isToggleable = typeof enabled === "boolean"
  const isOff = isToggleable && !enabled

  return (
    <div
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "border border-[var(--border)]",
        "transition-all duration-300",
        "hover:border-current hover:-translate-y-0.5",
        "hover:shadow-[0_12px_32px_-10px_currentColor]",
        isOff && "opacity-45 hover:opacity-75 grayscale-[0.4]"
      )}
      style={{ color: asset.tagColor }}
      onClick={onToggle}
    >
      {/* ═══ TOP PREVIEW AREA — modality-specific ═══ */}
      {asset.modality === "photo" && <PhotoPreview asset={asset} gradient={gradient} />}
      {asset.modality === "audio" && <AudioPreview asset={asset} gradient={gradient} />}
      {asset.modality === "video" && <VideoPreview asset={asset} gradient={gradient} />}
      {asset.modality === "doc" && <DocPreview asset={asset} gradient={gradient} />}

      {/* Toggle dot — only when the card is controllable (user mood board).
          Pin to the top-right corner, above the modality preview. */}
      {isToggleable && (
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              "block w-3 h-3 rounded-full border-2 transition-all",
              enabled
                ? "bg-current border-current shadow-[0_0_10px_currentColor]"
                : "bg-transparent border-[var(--muted-foreground)]"
            )}
            aria-label={enabled ? "Included in script" : "Excluded from script"}
          />
        </div>
      )}

      {/* ═══ BOTTOM META — shared across all modalities ═══ */}
      <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="flex items-baseline justify-between gap-2">
          <div className="font-sans text-[14px] font-bold text-[var(--foreground)] truncate">{asset.title}</div>
        </div>
        <div className="font-sans text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
          {asset.subtitle}
        </div>
        <div className="font-mono text-[9px] text-[var(--muted-foreground)]/70 mt-1.5 tracking-wider">
          {asset.date}
        </div>
      </div>
    </div>
  )
}

/* ───── PHOTO — big emoji on gradient, colored tag label ───── */
function PhotoPreview({
  asset,
  gradient,
}: {
  asset: typeof MOOD_CATEGORIES[number]
  gradient: string
}) {
  return (
    <div
      className="relative h-[180px] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* subtle film grain overlay */}
      <div className="absolute inset-0 cinema-grain opacity-40" />
      <div className="relative text-5xl leading-none mb-2 transition-transform group-hover:scale-110 duration-500">
        {asset.emoji}
      </div>
      <div
        className="relative font-mono text-[10px] font-bold tracking-[0.2em]"
        style={{ color: asset.tagColor }}
      >
        {asset.tag}
      </div>
    </div>
  )
}

/* ───── AUDIO — play button + waveform + duration + quote ───── */
function AudioPreview({
  asset,
  gradient,
}: {
  asset: typeof MOOD_CATEGORIES[number]
  gradient: string
}) {
  // Stable pseudo-random bar heights keyed by asset id so the waveform
  // looks authored, not jittery across re-renders.
  const bars = Array.from({ length: 36 }, (_, i) => {
    const seed = (asset.id * 7 + i * 13) % 100
    return 0.25 + (seed / 100) * 0.75
  })

  return (
    <div
      className="relative p-4 flex items-center gap-3 min-h-[108px]"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 cinema-grain opacity-30" />
      {/* Play button */}
      <button
        className={cn(
          "relative w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          "border-2 transition-all",
          "hover:scale-110"
        )}
        style={{
          color: asset.tagColor,
          borderColor: asset.tagColor,
          backgroundColor: `color-mix(in srgb, ${asset.tagColor} 12%, transparent)`,
        }}
        aria-label={`Play ${asset.title}`}
      >
        <Play size={14} fill="currentColor" className="ml-0.5" />
      </button>

      {/* Waveform */}
      <div className="relative flex-1 flex items-center gap-[2px] h-8 min-w-0">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] transition-opacity group-hover:opacity-100"
            style={{
              height: `${h * 100}%`,
              minHeight: "4px",
              backgroundColor: asset.tagColor,
              opacity: 0.55 + (i / bars.length) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Duration */}
      <div className="relative shrink-0 font-mono text-[11px] font-bold text-[var(--foreground)]/90 tabular-nums">
        {asset.duration}
      </div>
    </div>
  )
}

/* ───── VIDEO — gradient + centered play overlay + duration pill ───── */
function VideoPreview({
  asset,
  gradient,
}: {
  asset: typeof MOOD_CATEGORIES[number]
  gradient: string
}) {
  return (
    <div
      className="relative h-[180px] flex items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 cinema-grain opacity-40" />
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* Play overlay */}
      <button
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center",
          "border-2 transition-all group-hover:scale-110",
          "bg-[color-mix(in_srgb,var(--background)_40%,transparent)] backdrop-blur-sm"
        )}
        style={{ borderColor: "rgba(255,255,255,0.6)" }}
        aria-label={`Play ${asset.title}`}
      >
        <Play size={20} fill="white" className="text-[var(--foreground)] ml-0.5" />
      </button>

      {/* Duration pill, bottom-right */}
      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] backdrop-blur-sm font-mono text-[11px] font-bold text-[var(--foreground)] tabular-nums">
        {asset.duration}
      </div>

      {/* Tag chip, top-left */}
      <div
        className="absolute top-2 left-2 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider bg-[color-mix(in_srgb,var(--background)_60%,transparent)] backdrop-blur-sm"
        style={{ color: asset.tagColor }}
      >
        {asset.tag}
      </div>
    </div>
  )
}

/* ───── DOC — folder icon + skeleton page lines + page pill ───── */
function DocPreview({
  asset,
  gradient,
}: {
  asset: typeof MOOD_CATEGORIES[number]
  gradient: string
}) {
  return (
    <div
      className="relative p-4 flex items-start gap-3 min-h-[108px]"
      style={{ background: gradient }}
    >
      <div className="absolute inset-0 cinema-grain opacity-30" />
      {/* Doc icon */}
      <div
        className="relative w-9 h-11 flex items-center justify-center shrink-0 rounded-sm"
        style={{
          backgroundColor: `color-mix(in srgb, ${asset.tagColor} 18%, transparent)`,
          border: `1px solid ${asset.tagColor}`,
        }}
      >
        <FileText size={16} style={{ color: asset.tagColor }} />
      </div>

      {/* Skeleton page lines */}
      <div className="relative flex-1 space-y-1.5 mt-1 min-w-0">
        <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${asset.tagColor} 35%, transparent)` }} />
        <div className="h-1.5 w-11/12 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${asset.tagColor} 25%, transparent)` }} />
        <div className="h-1.5 w-10/12 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${asset.tagColor} 25%, transparent)` }} />
        <div className="h-1.5 w-8/12 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${asset.tagColor} 18%, transparent)` }} />
      </div>

      {/* Page count pill, bottom-left under icon */}
      {asset.pages !== undefined && (
        <div
          className="absolute bottom-2 left-3 px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums"
          style={{
            color: asset.tagColor,
            backgroundColor: `color-mix(in srgb, ${asset.tagColor} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${asset.tagColor} 40%, transparent)`,
          }}
        >
          {asset.pages}pp
        </div>
      )}

      {/* Tag label, top-right */}
      <div
        className="absolute top-3 right-3 font-mono text-[9px] font-bold tracking-wider"
        style={{ color: asset.tagColor }}
      >
        {asset.tag}
      </div>
    </div>
  )
}
