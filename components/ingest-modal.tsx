"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MODULE 6 — SOURCE INGEST
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tester-driven feature (Josef, working writer):
 *   "Upload a book / PDF, scan it, break down characters, themes, arcs,
 *    plot points, season scope. Don't make me read 400 pages cold."
 *
 * The output of this modal is meant to feed Modules 1-5 (Truth/Themes,
 * Perspective, Setting/Trope, Characters, Ask-the-Case). Those state
 * primitives don't ship in this codebase yet — when they do, swap the
 * `onApply*` callbacks below from toasts into setters. Until then,
 * each "Apply" button surfaces a toast as visible feedback so the
 * extraction report still feels live and clickable.
 *
 * No real PDF parsing happens here. We route by filename heuristic:
 *   - filename matches /luigi|mangione|unitedhealth/i  → MANGIONE_REPORT
 *   - everything else                                  → GENERIC_REPORT
 *     (with [detected from source] placeholders so the UI reads
 *     realistically without fabricating facts)
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react"
import {
  X, Upload, BookOpen, FileText, Sparkles,
  User, Target, Compass, Quote, Layers, Calendar,
  Eye, Zap, Plus, Check, ArrowRight, Loader2,
  Library, Film, Tv, Newspaper, ScrollText,
  Drama, Heart, Skull, Brain
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/legal-ui"

// ─── Types ─────────────────────────────────────────────────────────────

export type SourceType = "Novel" | "Memoir" | "Nonfiction" | "Longform Journalism" | "Screenplay"
export type TargetFormat = "Feature Film" | "Limited Series" | "Ongoing Series" | "Documentary"

export interface ExtractedCharacter {
  name: string
  role: string
  description: string
  function: "Protagonist" | "Antagonist" | "Mentor" | "Foil" | "Catalyst"
  arc: { want: string; need: string; flaw: string; transformation: string }
}

export interface ExtractedBeat {
  timestamp: string
  description: string
  type: "Inciting" | "Rising" | "Midpoint" | "Climax" | "Resolution" | "Setup"
}

export interface ExtractionReport {
  logline: string
  truth: string
  themes: string[]
  characters: ExtractedCharacter[]
  beats: ExtractedBeat[]
  seasonScope: { seasons: number; episodes: number; rationale: string }
  pov: { narrator: string; voice: string; matchedCharacter?: string }
  inciting: { incident: string; tags: string[] }
}

export interface IngestedSource {
  id: string
  title: string
  author: string
  type: SourceType
  format: TargetFormat
  filename: string
  ingestedAt: string
  report: ExtractionReport
}

interface IngestModalProps {
  isOpen: boolean
  onClose: () => void
  ingestedSources: IngestedSource[]
  setIngestedSources: (s: IngestedSource[]) => void
  // when set, modal opens directly into report view for this source
  activeReport: IngestedSource | null
  setActiveReport: (s: IngestedSource | null) => void
}

// ─── Hardcoded report pool ─────────────────────────────────────────────
//
// Real extraction would be an LLM call. For the demo we return one of
// two prebuilt reports based on filename. The Mangione report is shaped
// to resemble what a v8 extraction pass would produce on a fictionalized
// book version of the case; the generic report is structurally complete
// but uses [detected from source] placeholders so we don't fabricate
// specifics about an unknown upload.

const MANGIONE_REPORT: ExtractionReport = {
  logline:
    "A scion of comfort weaponizes his own clarity to indict an industry that profits from suffering — and forces a country to argue with him through its courts.",
  truth:
    "Healthcare denial as systemic violence — and what it costs the conscience to answer it in kind.",
  themes: [
    "Class & Conscience",
    "Systemic Violence vs. Individual Violence",
    "The Limits of Reasoned Argument",
    "Public Spectacle as Argument",
    "Medical Authority & Bureaucratic Cruelty",
    "Family Inheritance & the Refusal of It",
  ],
  characters: [
    {
      name: "Luigi Mangione",
      role: "Defendant",
      description:
        "A 26-year-old of inherited privilege who diagnoses an industry the way a coder reads broken software — and then writes to the disk.",
      function: "Protagonist",
      arc: {
        want: "To make a denial too loud to dismiss.",
        need: "To accept that being correct does not make one righteous.",
        flaw: "Confuses lucidity with permission.",
        transformation:
          "From private notebooks to public docket — the act renders him both fully visible and fully unknowable.",
      },
    },
    {
      name: "Brian Thompson",
      role: "Victim · UnitedHealth CEO",
      description:
        "Senior executive at the country's largest health insurer, framed in the source as the human face of an actuarial machine.",
      function: "Antagonist",
      arc: {
        want: "To preside over a profitable quarter.",
        need: "Never granted on-page interiority — by design.",
        flaw: "Mistakes statistical insulation for personal safety.",
        transformation:
          "His absence after Act One becomes the central argument every other character is forced to answer.",
      },
    },
    {
      name: "Karen Friedman Agnifilo",
      role: "Defense Counsel",
      description:
        "Former Manhattan chief assistant DA turned defense lead — argues the prosecution is itself a political performance.",
      function: "Mentor",
      arc: {
        want: "To save her client's life.",
        need: "To accept that the case is not really about her client.",
        flaw: "Believes in the system she critiques.",
        transformation:
          "Her closing reframes the trial as the country examining its own reflection.",
      },
    },
    {
      name: "Joseph Kenny",
      role: "NYPD Chief of Detectives",
      description:
        "Procedural counterweight — the one character who treats the case as a case, not a referendum.",
      function: "Foil",
      arc: {
        want: "To close the file cleanly.",
        need: "To recognize the ground has shifted under his profession.",
        flaw: "Trusts the chain of custody more than the country it serves.",
        transformation:
          "His Altoona testimony becomes the calmest, most damning passage in the source.",
      },
    },
    {
      name: "The Crowd",
      role: "Public Conscience",
      description:
        "An emergent character — donors, court watchers, social-media chorus — whose attention warps every legal motion.",
      function: "Catalyst",
      arc: {
        want: "To turn a defendant into a verdict on themselves.",
        need: "To survive what they make of him.",
        flaw: "Confuses sympathy with policy.",
        transformation:
          "Becomes louder than the gavel; the source's final image is theirs.",
      },
    },
  ],
  beats: [
    { timestamp: "Ch. 1 · p. 3", description: "Cold open: a denial letter on a kitchen table.", type: "Setup" },
    { timestamp: "Ch. 3 · p. 41", description: "The defendant's mother is denied coverage for a back surgery.", type: "Setup" },
    { timestamp: "Ch. 7 · p. 88", description: "Hilton lobby. Six seconds. The act.", type: "Inciting" },
    { timestamp: "Ch. 9 · p. 112", description: "Five-day manhunt; the country watches itself look.", type: "Rising" },
    { timestamp: "Ch. 11 · p. 144", description: "Altoona McDonald's — the defendant is recognized while reading.", type: "Rising" },
    { timestamp: "Ch. 14 · p. 188", description: "Initial appearance; the manifesto enters the record.", type: "Midpoint" },
    { timestamp: "Ch. 18 · p. 232", description: "Death-penalty notice filed; the defense answers in writing.", type: "Rising" },
    { timestamp: "Ch. 22 · p. 281", description: "Suppression hearing reveals the contents of the notebook.", type: "Rising" },
    { timestamp: "Ch. 26 · p. 322", description: "Two counts dismissed; the government recalibrates.", type: "Climax" },
    { timestamp: "Ch. 28 · p. 351", description: "Death-penalty notice withdrawn; the case becomes about evidence again.", type: "Climax" },
    { timestamp: "Ch. 30 · p. 378", description: "Closing: the verdict is delivered to a country, not a courtroom.", type: "Resolution" },
  ],
  seasonScope: {
    seasons: 1,
    episodes: 8,
    rationale:
      "400+ page nonfiction source with linear procedural arc and one center of gravity → 1 season × 8 episodes. Pilot covers the act + manhunt; finale covers the verdict and its aftermath.",
  },
  pov: {
    narrator: "Close-third, cycling between defendant + counsel + chief of detectives",
    voice:
      "Restrained, declarative, courtroom-cadenced. The narrator never argues for the defendant — only catalogs what cannot be unsaid.",
    matchedCharacter: "Luigi Mangione",
  },
  inciting: {
    incident:
      "Defendant's mother is denied a covered back surgery; the family pays out of pocket; the recovery does not hold. He stops writing in his notebook for sixteen months.",
    tags: ["pre-docket", "family", "medical denial", "silence as evidence"],
  },
}

const GENERIC_REPORT: ExtractionReport = {
  logline:
    "[Detected from source] A central figure confronts a system that does not see them — and the source asks what kind of answer that warrants.",
  truth: "[Detected from source] The truth this source argues for, in one sentence.",
  themes: [
    "[Theme 1]",
    "[Theme 2]",
    "[Theme 3]",
    "[Theme 4]",
  ],
  characters: [
    {
      name: "[Protagonist]",
      role: "Lead",
      description: "[Detected from source] Two-line description of the protagonist's situation at the open of the source.",
      function: "Protagonist",
      arc: { want: "[Want]", need: "[Need]", flaw: "[Flaw]", transformation: "[Transformation]" },
    },
    {
      name: "[Antagonist]",
      role: "Opposition",
      description: "[Detected from source] Description of the source of opposition, person or system.",
      function: "Antagonist",
      arc: { want: "[Want]", need: "[Need]", flaw: "[Flaw]", transformation: "[Transformation]" },
    },
    {
      name: "[Mentor / Confidant]",
      role: "Counsel",
      description: "[Detected from source] Description of the figure who shapes the protagonist's understanding.",
      function: "Mentor",
      arc: { want: "[Want]", need: "[Need]", flaw: "[Flaw]", transformation: "[Transformation]" },
    },
  ],
  beats: [
    { timestamp: "Ch. 1", description: "[Detected] Opening situation — what's broken at rest.", type: "Setup" },
    { timestamp: "Ch. 3", description: "[Detected] First disturbance.", type: "Setup" },
    { timestamp: "Ch. 5", description: "[Detected] Inciting choice — the door closes behind the protagonist.", type: "Inciting" },
    { timestamp: "Ch. 8", description: "[Detected] Stakes raise; consequences arrive.", type: "Rising" },
    { timestamp: "Ch. 12", description: "[Detected] Midpoint pivot — the protagonist learns something they cannot un-learn.", type: "Midpoint" },
    { timestamp: "Ch. 16", description: "[Detected] Lowest point.", type: "Rising" },
    { timestamp: "Ch. 20", description: "[Detected] Climactic confrontation.", type: "Climax" },
    { timestamp: "Ch. 24", description: "[Detected] Aftermath — what the source leaves the reader with.", type: "Resolution" },
  ],
  seasonScope: {
    seasons: 1,
    episodes: 6,
    rationale: "[Detected from source length + chosen target format]",
  },
  pov: {
    narrator: "[Detected POV mode]",
    voice: "[Detected voice register and cadence]",
    matchedCharacter: undefined,
  },
  inciting: {
    incident: "[Detected from source] The pre-narrative event that forms the protagonist before the page-one situation.",
    tags: ["[tag]", "[tag]", "[tag]"],
  },
}

function buildReport(filename: string, title: string): ExtractionReport {
  const haystack = (filename + " " + title).toLowerCase()
  if (/luigi|mangione|unitedhealth|thompson|brian/.test(haystack)) {
    return MANGIONE_REPORT
  }
  return GENERIC_REPORT
}

// ─── Component ─────────────────────────────────────────────────────────

const PROCESSING_PHASES = [
  "Parsing structure...",
  "Extracting characters...",
  "Mapping arcs...",
  "Detecting themes...",
  "Scoping seasons...",
] as const

const SOURCE_TYPES: { key: SourceType; icon: typeof BookOpen }[] = [
  { key: "Novel", icon: BookOpen },
  { key: "Memoir", icon: ScrollText },
  { key: "Nonfiction", icon: Library },
  { key: "Longform Journalism", icon: Newspaper },
  { key: "Screenplay", icon: Film },
]

const TARGET_FORMATS: { key: TargetFormat; icon: typeof Film }[] = [
  { key: "Feature Film", icon: Film },
  { key: "Limited Series", icon: Tv },
  { key: "Ongoing Series", icon: Tv },
  { key: "Documentary", icon: Eye },
]

export function IngestModal({
  isOpen,
  onClose,
  ingestedSources,
  setIngestedSources,
  activeReport,
  setActiveReport,
}: IngestModalProps) {
  const { toast } = useToast()

  // Phase: 0 = form, 1 = processing, 2 = report
  const [phase, setPhase] = useState<0 | 1 | 2>(0)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [sourceType, setSourceType] = useState<SourceType>("Nonfiction")
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("Limited Series")
  const [isDragging, setIsDragging] = useState(false)
  const [phaseLines, setPhaseLines] = useState<string[]>([])
  const [report, setReport] = useState<ExtractionReport | null>(null)
  const [reportTitle, setReportTitle] = useState("")
  const [reportAuthor, setReportAuthor] = useState("")
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Imported character names (gates "Apply Arcs" wiring)
  const [importedChars, setImportedChars] = useState<Set<string>>(new Set())

  // If parent set an activeReport, jump straight to report view
  useEffect(() => {
    if (activeReport && isOpen) {
      setReport(activeReport.report)
      setReportTitle(activeReport.title)
      setReportAuthor(activeReport.author)
      setSourceType(activeReport.type)
      setTargetFormat(activeReport.format)
      setPhase(2)
      setImportedChars(new Set())
    }
  }, [activeReport, isOpen])

  // Reset to form whenever the modal closes (but not mid-processing — that's handled below)
  useEffect(() => {
    if (!isOpen) {
      // Cancel any in-flight phase timer so reopening doesn't replay it
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current)
        phaseTimerRef.current = null
      }
      // Defer the state reset so the modal doesn't visibly snap mid-close-animation
      const t = setTimeout(() => {
        setPhase(0)
        setFile(null)
        setTitle("")
        setAuthor("")
        setSourceType("Nonfiction")
        setTargetFormat("Limited Series")
        setPhaseLines([])
        setReport(null)
        setReportTitle("")
        setReportAuthor("")
        setActiveReport(null)
        setImportedChars(new Set())
      }, 220)
      return () => clearTimeout(t)
    }
  }, [isOpen, setActiveReport])

  if (!isOpen) return null

  const canIngest = !!file && title.trim().length > 0

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    // Auto-fill title from filename if empty
    if (!title.trim()) {
      const stem = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
      setTitle(stem)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  const startIngest = () => {
    if (!canIngest || !file) return
    setPhase(1)
    setPhaseLines([])
    // Walk through the 5 phase lines over ~3s, then resolve to a report
    PROCESSING_PHASES.forEach((line, i) => {
      const t = setTimeout(() => {
        setPhaseLines(prev => [...prev, line])
        if (i === PROCESSING_PHASES.length - 1) {
          const finishT = setTimeout(() => {
            const r = buildReport(file.name, title)
            const id = `src-${Date.now().toString(36)}`
            const ingested: IngestedSource = {
              id,
              title: title.trim(),
              author: author.trim() || "Unknown",
              type: sourceType,
              format: targetFormat,
              filename: file.name,
              ingestedAt: new Date().toISOString(),
              report: r,
            }
            setIngestedSources([...ingestedSources, ingested])
            setReport(r)
            setReportTitle(ingested.title)
            setReportAuthor(ingested.author)
            setPhase(2)
          }, 500)
          phaseTimerRef.current = finishT
        }
      }, (i + 1) * 600)
      phaseTimerRef.current = t
    })
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[300] flex items-stretch justify-center"
      style={{ backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)" }}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-4xl m-4 md:m-8 self-center max-h-[90vh] overflow-hidden",
          "bg-[var(--card)] border-[3px] border-[var(--foreground)]",
          "flex flex-col"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-5 py-3 border-b-[2.5px] border-[var(--border)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--gold)]/15 border border-[var(--gold)]/40 flex items-center justify-center">
              <BookOpen size={16} className="text-[var(--gold)]" />
            </div>
            <div>
              <h2 className="font-sans text-base font-extrabold text-[var(--foreground)]">
                {phase === 2 ? "Extraction Report" : "Ingest Source Material"}
              </h2>
              <p className="font-mono text-[10px] text-[var(--muted-foreground)]">
                {phase === 0 && "Upload a novel, memoir, nonfiction book, or longform article. Get a structured extraction report."}
                {phase === 1 && "Working through the source — sit tight."}
                {phase === 2 && `${reportTitle} · ${reportAuthor}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            aria-label="Close ingest modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto p-6">
          {phase === 0 && (
            <FormPhase
              file={file}
              title={title}
              author={author}
              sourceType={sourceType}
              targetFormat={targetFormat}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              setTitle={setTitle}
              setAuthor={setAuthor}
              setSourceType={setSourceType}
              setTargetFormat={setTargetFormat}
              handleFile={handleFile}
              handleDrop={handleDrop}
            />
          )}
          {phase === 1 && <ProcessingPhase phaseLines={phaseLines} title={title} />}
          {phase === 2 && report && (
            <ReportPhase
              report={report}
              title={reportTitle}
              author={reportAuthor}
              sourceType={sourceType}
              targetFormat={targetFormat}
              importedChars={importedChars}
              setImportedChars={setImportedChars}
              toast={toast}
            />
          )}
        </div>

        {/* ─── Footer (form phase only) ─── */}
        {phase === 0 && (
          <div className="border-t-[2.5px] border-[var(--border)] bg-[var(--surface)] px-5 py-3 flex items-center justify-between shrink-0">
            <div className="font-mono text-[10px] text-[var(--muted-foreground)]">
              {canIngest
                ? "Ready to extract."
                : "Drop a file and add a title to enable extraction."}
            </div>
            <button
              onClick={startIngest}
              disabled={!canIngest}
              className={cn(
                "px-4 py-2 flex items-center gap-2",
                "border-2 font-mono text-[11px] font-bold tracking-wider transition-all",
                canIngest
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--background)] hover:brightness-110"
                  : "border-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50"
              )}
            >
              <Sparkles size={12} />
              INGEST &amp; EXTRACT
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Phase: Form ───────────────────────────────────────────────────────

interface FormPhaseProps {
  file: File | null
  title: string
  author: string
  sourceType: SourceType
  targetFormat: TargetFormat
  isDragging: boolean
  setIsDragging: (b: boolean) => void
  setTitle: (s: string) => void
  setAuthor: (s: string) => void
  setSourceType: (s: SourceType) => void
  setTargetFormat: (s: TargetFormat) => void
  handleFile: (f: File | null) => void
  handleDrop: (e: React.DragEvent) => void
}

function FormPhase({
  file, title, author, sourceType, targetFormat, isDragging,
  setIsDragging, setTitle, setAuthor, setSourceType, setTargetFormat,
  handleFile, handleDrop,
}: FormPhaseProps) {
  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <label
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed px-6 py-8 transition-all cursor-pointer block",
          isDragging
            ? "border-[var(--gold)] bg-[var(--gold)]/10"
            : file
              ? "border-[var(--gold)]/60 bg-[var(--gold)]/5"
              : "border-[var(--border)] hover:border-[var(--gold)]/60"
        )}
      >
        <input
          type="file"
          className="hidden"
          accept=".pdf,.epub,.txt,.docx,.doc,.md,.markdown,.rtf,.mobi,.azw3"
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[var(--gold)]/10 flex items-center justify-center shrink-0 border border-[var(--gold)]/40">
            {file ? <Check size={26} className="text-[var(--gold)]" /> : <Upload size={26} className="text-[var(--gold)]" />}
          </div>
          <div className="flex-1 min-w-0">
            {file ? (
              <>
                <p className="font-sans text-sm font-bold text-[var(--gold)] truncate">{file.name}</p>
                <p className="font-mono text-[10px] text-[var(--muted-foreground)] mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · click to swap
                </p>
              </>
            ) : (
              <>
                <p className="font-sans text-sm font-bold text-[var(--foreground)]">
                  Drop a source, or click to browse
                </p>
                <p className="font-mono text-[10px] text-[var(--muted-foreground)] mt-1">
                  PDF · EPUB · DOCX · TXT · MD · RTF · MOBI · AZW3
                </p>
              </>
            )}
          </div>
        </div>
      </label>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1.5">
            TITLE
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="The Source"
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--gold)] outline-none font-mono text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1.5">
            AUTHOR
          </label>
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author Name"
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--gold)] outline-none font-mono text-[12px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60 transition-colors"
          />
        </div>
      </div>

      {/* Source type */}
      <div>
        <label className="block font-mono text-[10px] font-bold text-[var(--muted-foreground)] tracking-wider mb-2">
          SOURCE TYPE
        </label>
        <div className="grid grid-cols-5 gap-2">
          {SOURCE_TYPES.map(({ key, icon: Icon }) => {
            const active = sourceType === key
            return (
              <button
                key={key}
                onClick={() => setSourceType(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-2 py-3 border-2 transition-all",
                  active
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={16} />
                <span className="font-mono text-[9px] font-bold tracking-wider text-center leading-tight">
                  {key.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Target format */}
      <div>
        <label className="block font-mono text-[10px] font-bold text-[var(--muted-foreground)] tracking-wider mb-2">
          TARGET FORMAT
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TARGET_FORMATS.map(({ key, icon: Icon }) => {
            const active = targetFormat === key
            return (
              <button
                key={key}
                onClick={() => setTargetFormat(key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-2 py-3 border-2 transition-all",
                  active
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon size={16} />
                <span className="font-mono text-[9px] font-bold tracking-wider text-center leading-tight">
                  {key.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Phase: Processing ─────────────────────────────────────────────────

function ProcessingPhase({ phaseLines, title }: { phaseLines: string[]; title: string }) {
  const pct = (phaseLines.length / PROCESSING_PHASES.length) * 100
  return (
    <div className="py-4">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 size={18} className="text-[var(--gold)] animate-spin" />
        <div className="font-mono text-[11px] font-bold text-[var(--gold)] tracking-wider">
          EXTRACTING — {title || "source"}
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-[var(--border)] overflow-hidden mb-6">
        <div
          className="h-full bg-[var(--gold)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Phase log */}
      <div className="space-y-1.5 font-mono text-[11px] text-[var(--muted-foreground)] min-h-[160px]">
        {phaseLines.map((line, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in">
            <Check size={11} className="text-[var(--gold)] shrink-0" />
            <span>{line}</span>
          </div>
        ))}
        {phaseLines.length < PROCESSING_PHASES.length && (
          <div className="flex items-center gap-2 opacity-60">
            <Loader2 size={11} className="text-[var(--gold)] animate-spin shrink-0" />
            <span>{PROCESSING_PHASES[phaseLines.length]}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Phase: Report ─────────────────────────────────────────────────────

interface ReportPhaseProps {
  report: ExtractionReport
  title: string
  author: string
  sourceType: SourceType
  targetFormat: TargetFormat
  importedChars: Set<string>
  setImportedChars: (s: Set<string>) => void
  toast: (msg: string, color?: string) => void
}

function ReportPhase({
  report, title, author, sourceType, targetFormat,
  importedChars, setImportedChars, toast,
}: ReportPhaseProps) {
  const importChar = (name: string) => {
    const next = new Set(importedChars)
    next.add(name)
    setImportedChars(next)
    toast(`${name} imported to character grid`, "var(--cyan)")
  }

  return (
    <div className="space-y-7">
      {/* ─── Source meta strip ─── */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[var(--border)]">
        <span className="font-mono text-[9px] font-bold text-[var(--gold)] tracking-wider px-2 py-1 bg-[var(--gold)]/10 border border-[var(--gold)]/40">
          {sourceType.toUpperCase()}
        </span>
        <span className="font-mono text-[9px] text-[var(--muted-foreground)]">→</span>
        <span className="font-mono text-[9px] font-bold text-[var(--foreground)] tracking-wider px-2 py-1 border border-[var(--border)]">
          {targetFormat.toUpperCase()}
        </span>
        <div className="ml-auto font-mono text-[10px] text-[var(--muted-foreground)]">
          extraction complete · {report.characters.length} chars · {report.beats.length} beats
        </div>
      </div>

      {/* ─── 1. Logline & Truth ─── */}
      <ReportSection
        n={1}
        icon={Quote}
        title="Logline & Truth"
        actionLabel="APPLY TO STORY"
        onAction={() => toast("Logline + Truth applied to Story", "var(--gold)")}
      >
        <div className="space-y-3">
          <div>
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1">LOGLINE</div>
            <p className="font-sans text-[14px] text-[var(--foreground)] leading-relaxed">{report.logline}</p>
          </div>
          <div>
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1">TRUTH</div>
            <p className="font-sans text-[13px] italic text-[var(--foreground)]/90 leading-relaxed">{report.truth}</p>
          </div>
        </div>
      </ReportSection>

      {/* ─── 2. Themes ─── */}
      <ReportSection
        n={2}
        icon={Heart}
        title="Themes"
        actionLabel="APPLY ALL"
        onAction={() => toast(`${report.themes.length} themes applied to Story`, "var(--gold)")}
      >
        <div className="flex flex-wrap gap-2">
          {report.themes.map(t => (
            <button
              key={t}
              onClick={() => toast(`Theme added: ${t}`, "var(--gold)")}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all"
            >
              <Plus size={10} className="text-[var(--muted-foreground)] group-hover:text-[var(--gold)]" />
              <span className="font-mono text-[10px] text-[var(--foreground)]">{t}</span>
            </button>
          ))}
        </div>
      </ReportSection>

      {/* ─── 3. Characters ─── */}
      <ReportSection
        n={3}
        icon={User}
        title="Characters"
      >
        <div className="grid grid-cols-2 gap-3">
          {report.characters.map(c => {
            const imported = importedChars.has(c.name)
            return (
              <div
                key={c.name}
                className="border border-[var(--border)] bg-[var(--surface)] p-3 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-sans text-[13px] font-extrabold text-[var(--foreground)] truncate">
                      {c.name}
                    </div>
                    <div className="font-mono text-[9px] text-[var(--muted-foreground)] tracking-wider">
                      {c.role.toUpperCase()}
                    </div>
                  </div>
                  <FunctionPill f={c.function} />
                </div>
                <p className="font-sans text-[11px] text-[var(--foreground)]/80 leading-snug">
                  {c.description}
                </p>
                <button
                  onClick={() => importChar(c.name)}
                  disabled={imported}
                  className={cn(
                    "mt-1 px-2 py-1.5 border font-mono text-[9px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5",
                    imported
                      ? "border-[var(--cyan)] bg-[var(--cyan)]/10 text-[var(--cyan)] cursor-default"
                      : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                  )}
                >
                  {imported ? <><Check size={10} /> IMPORTED</> : <><Plus size={10} /> IMPORT</>}
                </button>
              </div>
            )
          })}
        </div>
      </ReportSection>

      {/* ─── 4. Character Arcs ─── */}
      <ReportSection
        n={4}
        icon={Compass}
        title="Character Arcs"
        actionLabel="APPLY ALL ARCS"
        onAction={() => {
          const target = importedChars.size || report.characters.length
          toast(`${target} arcs applied to character studio`, "var(--gold)")
        }}
        subtitle={importedChars.size === 0 ? "Showing all extracted arcs (none imported yet)" : `Showing ${importedChars.size} imported character${importedChars.size === 1 ? "" : "s"}`}
      >
        <div className="space-y-2">
          {report.characters
            .filter(c => importedChars.size === 0 || importedChars.has(c.name))
            .map(c => (
              <div key={c.name} className="border border-[var(--border)] bg-[var(--surface)]">
                <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="font-sans text-[12px] font-bold text-[var(--foreground)]">{c.name}</div>
                  <FunctionPill f={c.function} />
                </div>
                <div className="grid grid-cols-4 gap-px bg-[var(--border)]">
                  <ArcCell label="WANT" value={c.arc.want} />
                  <ArcCell label="NEED" value={c.arc.need} />
                  <ArcCell label="FLAW" value={c.arc.flaw} />
                  <ArcCell label="TRANSFORMATION" value={c.arc.transformation} />
                </div>
              </div>
            ))}
        </div>
      </ReportSection>

      {/* ─── 5. Plot Beats ─── */}
      <ReportSection
        n={5}
        icon={Layers}
        title="Major Plot Points"
        actionLabel="SEND TO STORYBOARD"
        onAction={() => toast(`${report.beats.length} beats sent to storyboard`, "var(--gold)")}
      >
        <div className="space-y-1">
          {report.beats.map((b, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--border)]/40 last:border-0">
              <div className="w-7 h-7 shrink-0 border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center font-mono text-[10px] font-bold text-[var(--muted-foreground)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] font-bold text-[var(--gold)] tracking-wider">
                    {b.timestamp}
                  </span>
                  <BeatTypePill type={b.type} />
                </div>
                <p className="font-sans text-[12px] text-[var(--foreground)] mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ReportSection>

      {/* ─── 6. Season Scope ─── */}
      <ReportSection
        n={6}
        icon={Calendar}
        title="Season Scope Recommendation"
        actionLabel="APPLY STRUCTURE"
        onAction={() => toast(`Set to ${report.seasonScope.seasons}×${report.seasonScope.episodes}`, "var(--gold)")}
      >
        <div className="flex items-center gap-6 mb-3">
          <div className="text-center">
            <div className="font-sans text-3xl font-extrabold text-[var(--gold)]">{report.seasonScope.seasons}</div>
            <div className="font-mono text-[9px] text-[var(--muted-foreground)] tracking-wider">SEASON{report.seasonScope.seasons === 1 ? "" : "S"}</div>
          </div>
          <div className="font-mono text-[18px] text-[var(--muted-foreground)]">×</div>
          <div className="text-center">
            <div className="font-sans text-3xl font-extrabold text-[var(--gold)]">{report.seasonScope.episodes}</div>
            <div className="font-mono text-[9px] text-[var(--muted-foreground)] tracking-wider">EPISODES</div>
          </div>
        </div>
        <p className="font-mono text-[10px] text-[var(--muted-foreground)] italic leading-relaxed">
          {report.seasonScope.rationale}
        </p>
      </ReportSection>

      {/* ─── 7. POV Analysis ─── */}
      <ReportSection
        n={7}
        icon={Eye}
        title="POV Analysis"
        actionLabel={report.pov.matchedCharacter ? "SET AS STORY POV" : undefined}
        onAction={
          report.pov.matchedCharacter
            ? () => toast(`Story POV set to ${report.pov.matchedCharacter}`, "var(--gold)")
            : undefined
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1">NARRATOR</div>
            <p className="font-sans text-[12px] text-[var(--foreground)]">{report.pov.narrator}</p>
          </div>
          <div>
            <div className="font-mono text-[9px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1">VOICE</div>
            <p className="font-sans text-[12px] text-[var(--foreground)] leading-snug">{report.pov.voice}</p>
          </div>
        </div>
        {report.pov.matchedCharacter && (
          <div className="mt-3 px-3 py-2 border border-[var(--gold)]/30 bg-[var(--gold)]/5 flex items-center gap-2">
            <User size={12} className="text-[var(--gold)]" />
            <span className="font-mono text-[10px] text-[var(--foreground)]">
              Matches extracted character: <span className="font-bold text-[var(--gold)]">{report.pov.matchedCharacter}</span>
            </span>
          </div>
        )}
      </ReportSection>

      {/* ─── 8. Inciting Incident ─── */}
      <ReportSection
        n={8}
        icon={Zap}
        title="Inciting Incident — Pre-Docket Origin"
        actionLabel="APPLY TO PERSPECTIVE"
        onAction={() => toast("Inciting incident applied to perspective module", "var(--gold)")}
      >
        <p className="font-sans text-[12px] text-[var(--foreground)] leading-relaxed mb-3">
          {report.inciting.incident}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {report.inciting.tags.map(t => (
            <span
              key={t}
              className="font-mono text-[9px] px-1.5 py-0.5 border border-[var(--border)] text-[var(--muted-foreground)]"
            >
              {t}
            </span>
          ))}
        </div>
      </ReportSection>
    </div>
  )
}

// ─── Sub-primitives ───────────────────────────────────────────────────

function ReportSection({
  n, icon: Icon, title, subtitle, actionLabel, onAction, children,
}: {
  n: number
  icon: typeof BookOpen
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 border border-[var(--gold)]/40 bg-[var(--gold)]/10 flex items-center justify-center font-mono text-[10px] font-bold text-[var(--gold)]">
            {n}
          </div>
          <Icon size={14} className="text-[var(--gold)]" />
          <h3 className="font-sans text-[13px] font-extrabold text-[var(--foreground)] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <span className="font-mono text-[9px] text-[var(--muted-foreground)] italic">
              — {subtitle}
            </span>
          )}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-2.5 py-1 border border-[var(--gold)]/50 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--background)] transition-all font-mono text-[9px] font-bold tracking-wider flex items-center gap-1.5"
          >
            <Check size={10} />
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function ArcCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 bg-[var(--card)]">
      <div className="font-mono text-[8px] font-bold text-[var(--muted-foreground)] tracking-wider mb-1">{label}</div>
      <p className="font-sans text-[11px] text-[var(--foreground)] leading-snug">{value}</p>
    </div>
  )
}

function FunctionPill({ f }: { f: ExtractedCharacter["function"] }) {
  const map: Record<ExtractedCharacter["function"], { color: string; icon: typeof User }> = {
    Protagonist: { color: "var(--gold)", icon: Drama },
    Antagonist: { color: "var(--red)", icon: Skull },
    Mentor: { color: "var(--cyan)", icon: Brain },
    Foil: { color: "var(--purple)", icon: Target },
    Catalyst: { color: "var(--orange)", icon: Sparkles },
  }
  const { color, icon: Icon } = map[f]
  return (
    <span
      className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 border font-mono text-[8px] font-bold tracking-wider whitespace-nowrap"
      style={{ borderColor: color, color }}
    >
      <Icon size={9} />
      {f.toUpperCase()}
    </span>
  )
}

function BeatTypePill({ type }: { type: ExtractedBeat["type"] }) {
  const map: Record<ExtractedBeat["type"], string> = {
    Setup: "var(--muted-foreground)",
    Inciting: "var(--gold)",
    Rising: "var(--orange)",
    Midpoint: "var(--cyan)",
    Climax: "var(--red)",
    Resolution: "var(--green)",
  }
  const color = map[type]
  return (
    <span
      className="font-mono text-[8px] font-bold tracking-wider px-1 py-px border"
      style={{ borderColor: color, color }}
    >
      {type.toUpperCase()}
    </span>
  )
}
