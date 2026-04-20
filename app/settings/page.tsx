"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  Moon,
  Sun,
  User,
  Shield,
  CreditCard,
  Palette,
  Key,
  Link2,
  Trash2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Copy,
  Plus,
  Clock,
  CheckCircle2,
  HelpCircle,
  Download,
  Gavel,
  BookOpen,
  Cloud,
  Folder,
  Bell,
  Calendar,
  Zap,
  Mail,
  Monitor,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LegalButton,
  Chip,
  ToastProvider,
  useToast,
  LegalInput,
} from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"
import { Masthead } from "@/components/masthead"

/* ─── Tab definitions ─── */
const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "account", label: "Account", icon: Shield },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "ai-usage", label: "AI Usage Report", icon: Sparkles },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "integrations", label: "Integrations", icon: Monitor, badge: 9 },
  { key: "api", label: "API Keys", icon: Key },
]

/* ─── AI Usage mock data ─── */
const AI_CONTRIBUTIONS = [
  { label: "Timeline Summaries", pct: 45 },
  { label: "Docket Summaries", pct: 38 },
  { label: "Drama Lab Outputs", pct: 62 },
  { label: "Case Narratives", pct: 22 },
]

const AI_ACTIVITY = [
  { time: "2 min ago", action: "Generated timeline summary", category: "Timelines", model: "Claude 3.5" },
  { time: "15 min ago", action: "Summarized docket entry #42", category: "Docket", model: "Claude 3.5" },
  { time: "1 hr ago", action: "Generated storyline pitch", category: "Drama Lab", model: "Claude 3.5" },
  { time: "3 hrs ago", action: "Extracted character profile", category: "Drama Lab", model: "Claude 3.5" },
  { time: "Yesterday", action: "Summarized 12 docket entries", category: "Docket", model: "Claude 3.5" },
]

/* ─── API Keys mock data ─── */
const API_KEYS = [
  {
    id: "prod",
    name: "Production Key",
    key: "ld_live_****...****7x9k",
    created: "Mar 15, 2024",
    lastUsed: "2 hours ago",
  },
  {
    id: "dev",
    name: "Development Key",
    key: "ld_test_****...****3m2p",
    created: "Feb 28, 2024",
    lastUsed: "1 week ago",
  },
]

/* ─── Integrations data ─── */
const INTEGRATION_CATEGORIES = [
  {
    id: "court-systems",
    name: "Court & Docket Systems",
    description: "Access federal court records",
    icon: Gavel,
    integrations: [
      {
        id: "pacer",
        name: "PACER",
        fullName: "Public Access to Court Electronic Records",
        description: "Direct access to federal court dockets, filings, and case information",
        connected: true,
        lastSync: "2 min ago",
        features: ["Real-time docket alerts", "Bulk download", "Citation tracking"],
      },
      {
        id: "pacerpro",
        name: "PacerPro",
        fullName: "Enhanced PACER Access",
        description: "Premium PACER interface with advanced search, alerts, and analytics",
        connected: true,
        lastSync: "5 min ago",
        features: ["Instant alerts", "Docket analytics", "Judicial history", "Case prediction"],
      },
      {
        id: "courtlistener",
        name: "CourtListener",
        fullName: "Free Law Project",
        description: "Free access to millions of legal opinions and oral arguments",
        connected: false,
        features: ["Opinion search", "RECAP archive", "Citation network"],
      },
      {
        id: "cm-ecf",
        name: "CM/ECF Direct",
        fullName: "Case Management/Electronic Case Files",
        description: "Direct court filing system integration for specific districts",
        connected: false,
        features: ["E-filing", "Document upload", "Receipt tracking"],
      },
    ],
  },
  {
    id: "legal-research",
    name: "Legal Research Platforms",
    description: "Case law and legal research databases",
    icon: BookOpen,
    integrations: [
      {
        id: "casetext",
        name: "Casetext",
        fullName: "Casetext CARA AI",
        description: "AI-powered legal research with contextual recommendations",
        connected: true,
        lastSync: "1 hour ago",
        features: ["CARA AI", "Brief analysis", "Parallel search"],
      },
      {
        id: "westlaw",
        name: "Westlaw",
        fullName: "Thomson Reuters Westlaw",
        description: "Comprehensive legal research with KeyCite citation checking",
        connected: false,
        features: ["Case law", "KeyCite", "Secondary sources", "Practical Law"],
      },
      {
        id: "fastcase",
        name: "Fastcase",
        fullName: "Fastcase Legal Research",
        description: "Affordable legal research with AI-enhanced search",
        connected: false,
        features: ["Case law search", "Authority Check", "AI analytics"],
      },
    ],
  },
  {
    id: "cloud-storage",
    name: "Cloud Storage & Documents",
    description: "File storage and document management",
    icon: Cloud,
    integrations: [
      {
        id: "google-drive",
        name: "Google Drive",
        fullName: "Google Workspace Drive",
        description: "Cloud storage with real-time collaboration",
        connected: true,
        lastSync: "Just now",
        features: ["Auto-sync", "Folder mapping", "Version history"],
      },
      {
        id: "dropbox",
        name: "Dropbox",
        fullName: "Dropbox Business",
        description: "Secure file storage with advanced sharing controls",
        connected: false,
        features: ["Smart Sync", "Paper integration", "Team folders"],
      },
      {
        id: "box",
        name: "Box",
        fullName: "Box Enterprise",
        description: "Enterprise content management with legal holds",
        connected: false,
        features: ["Legal hold", "Retention policies", "eDiscovery"],
      },
    ],
  },
  {
    id: "practice-management",
    name: "Practice Management",
    description: "Case and client management systems",
    icon: Folder,
    integrations: [
      {
        id: "clio",
        name: "Clio",
        fullName: "Clio Manage & Grow",
        description: "Complete legal practice management suite",
        connected: true,
        lastSync: "30 min ago",
        features: ["Matter sync", "Time entries", "Client portal", "Billing"],
      },
      {
        id: "mycase",
        name: "MyCase",
        fullName: "MyCase Legal Practice",
        description: "Cloud-based case management for small firms",
        connected: false,
        features: ["Case management", "Client intake", "Document automation"],
      },
    ],
  },
  {
    id: "communication",
    name: "Communication & Collaboration",
    description: "Team messaging and notifications",
    icon: Bell,
    integrations: [
      {
        id: "slack",
        name: "Slack",
        fullName: "Slack Workspace",
        description: "Team messaging with channel-based alerts",
        connected: true,
        lastSync: "Real-time",
        features: ["Docket alerts channel", "Case updates", "Bot commands"],
      },
      {
        id: "email-smtp",
        name: "Email (SMTP)",
        fullName: "Custom Email Server",
        description: "Direct email integration for alerts and reports",
        connected: true,
        lastSync: "Active",
        features: ["Custom templates", "Scheduled reports", "PDF attachments"],
      },
      {
        id: "teams",
        name: "Microsoft Teams",
        fullName: "Microsoft Teams",
        description: "Enterprise communication and collaboration",
        connected: false,
        features: ["Channel notifications", "Meeting integration", "File sharing"],
      },
    ],
  },
  {
    id: "calendar",
    name: "Calendar & Scheduling",
    description: "Deadline and hearing management",
    icon: Calendar,
    integrations: [
      {
        id: "google-calendar",
        name: "Google Calendar",
        fullName: "Google Calendar",
        description: "Calendar sync for deadlines and hearings",
        connected: true,
        lastSync: "Just now",
        features: ["Deadline sync", "Hearing reminders", "Court rules"],
      },
      {
        id: "outlook-calendar",
        name: "Outlook Calendar",
        fullName: "Microsoft Outlook Calendar",
        description: "Office 365 calendar integration",
        connected: false,
        features: ["Exchange sync", "Team calendars", "Room booking"],
      },
    ],
  },
  {
    id: "ai-services",
    name: "AI & Analytics",
    description: "Machine learning and analysis tools",
    icon: Zap,
    integrations: [
      {
        id: "openai",
        name: "OpenAI",
        fullName: "OpenAI GPT-4 API",
        description: "Powers screenplay generation and case analysis",
        connected: true,
        lastSync: "Active",
        features: ["Screenplay generation", "Case summarization", "Entity extraction"],
      },
      {
        id: "anthropic",
        name: "Anthropic Claude",
        fullName: "Claude AI API",
        description: "Alternative AI provider for legal analysis",
        connected: false,
        features: ["Long context", "Constitutional AI", "Document analysis"],
      },
    ],
  },
]

/* ─── Reusable noir section card ─── */
function NoirCard({
  children,
  className,
  accent,
}: {
  children: React.ReactNode
  className?: string
  accent?: string
}) {
  return (
    <div
      className={cn(
        "relative border border-[var(--border)] bg-[#141414] p-6",
        className
      )}
      style={accent ? { borderTop: `2px solid ${accent}` } : undefined}
    >
      {children}
    </div>
  )
}

/* ─── Main component ─── */
function SettingsContent() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])
  const isDark = mounted ? resolvedTheme === "dark" : true

  const [activeTab, setActiveTab] = useState("profile")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "court-systems"
  )
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(
    null
  )

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@lawfirm.com",
    firm: "Doe & Associates LLP",
    role: "Senior Partner",
  })

  const handleSave = () => toast("Settings saved", "var(--gold)")

  const handleSync = async (integrationId: string) => {
    setSyncingIntegration(integrationId)
    await new Promise(r => setTimeout(r, 1600))
    setSyncingIntegration(null)
    toast("Sync complete", "var(--gold)")
  }

  const handleConnect = (_id: string, name: string) =>
    toast(`Opening ${name} authentication…`, "var(--gold)")

  const handleDisconnect = (_id: string, name: string) =>
    toast(`Disconnected from ${name}`, "var(--red)")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast("Copied to clipboard", "var(--gold)")
  }

  const connectedCount = INTEGRATION_CATEGORIES.reduce(
    (a, c) => a + c.integrations.filter(i => i.connected).length,
    0
  )
  const totalCount = INTEGRATION_CATEGORIES.reduce(
    (a, c) => a + c.integrations.length,
    0
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Masthead onSignIn={() => router.push("/")} />

      {/* ── Main content ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 md:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="cinema-contract text-[11px] text-[var(--gold)] mb-2">
              § Production Office
            </div>
            <h1 className="cinema-title text-[48px] text-white leading-none">
              Settings
            </h1>
            <p className="cinema-contract-italic text-[12px] text-[var(--muted-foreground)] mt-3">
              Account · Integrations · Preferences
            </p>
          </div>
          {activeTab === "integrations" && (
            <div className="flex flex-col items-end gap-1">
              <span className="cinema-contract text-[10px] text-[var(--gold)]">
                {connectedCount} Connected
              </span>
              <span className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                of {totalCount} available
              </span>
            </div>
          )}
        </div>

        {/* ── Horizontal Tab Bar ── */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto border-b border-[var(--border)]">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3 whitespace-nowrap",
                  "cinema-label text-[10px] transition-colors",
                  isActive
                    ? "text-white"
                    : "text-[var(--muted-foreground)] hover:text-white"
                )}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[8px] cinema-label border",
                      isActive
                        ? "border-[var(--gold)] text-[var(--gold)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute -bottom-px left-0 right-0 h-[2px]"
                    style={{ background: "var(--red)" }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ═══ PROFILE ═══ */}
        {activeTab === "profile" && (
          <NoirCard accent="var(--gold)">
            <h2 className="cinema-title text-[24px] text-white mb-1">
              Profile
            </h2>
            <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)] mb-6">
              Your credits on the call sheet
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <LegalInput
                label="Full Name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
              <LegalInput
                label="Email"
                type="email"
                value={profile.email}
                onChange={e =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />
              <LegalInput
                label="Firm / Organization"
                value={profile.firm}
                onChange={e => setProfile({ ...profile, firm: e.target.value })}
              />
              <LegalInput
                label="Role"
                value={profile.role}
                onChange={e => setProfile({ ...profile, role: e.target.value })}
              />
            </div>

            <div className="flex justify-end mt-6">
              <LegalButton active color="var(--gold)" onClick={handleSave}>
                Save Changes
              </LegalButton>
            </div>
          </NoirCard>
        )}

        {/* ═══ ACCOUNT ═══ */}
        {activeTab === "account" && (
          <div className="space-y-4">
            <NoirCard accent="var(--gold)">
              <h2 className="cinema-title text-[24px] text-white mb-1">
                Security
              </h2>
              <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)] mb-5">
                Locks & seals
              </p>
              <div className="divide-y divide-[var(--border)]">
                <SecurityRow
                  title="Password"
                  subtitle="Last changed 30 days ago"
                  action={<LegalButton small>Change</LegalButton>}
                />
                <SecurityRow
                  title="Two-Factor Auth"
                  subtitle="Add extra security to your account"
                  action={<Chip color="var(--red)">Not Enabled</Chip>}
                />
                <SecurityRow
                  title="Active Sessions"
                  subtitle="2 devices currently logged in"
                  action={<LegalButton small>Manage</LegalButton>}
                />
              </div>
            </NoirCard>

            <NoirCard accent="var(--red)">
              <h2 className="cinema-title text-[24px] mb-1" style={{ color: "var(--red)" }}>
                Danger Zone
              </h2>
              <p className="font-sans text-[13px] text-[var(--muted-foreground)] mb-4 leading-relaxed">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <LegalButton active color="var(--red)" small>
                <Trash2 size={12} />
                Delete Account
              </LegalButton>
            </NoirCard>
          </div>
        )}

        {/* ═══ APPEARANCE ═══ */}
        {activeTab === "appearance" && (
          <NoirCard accent="var(--gold)">
            <h2 className="cinema-title text-[24px] text-white mb-1">
              Theme
            </h2>
            <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)] mb-6">
              House lights
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ThemeCard
                selected={!isDark}
                onSelect={() => setTheme("light")}
                title="Open Court"
                subtitle="Public session — bright, on the record"
                Icon={Sun}
                preview={
                  <div className="w-full h-32 bg-[#FFF9EC] border border-[var(--border)] overflow-hidden">
                    <div className="h-6 bg-[#F5F0E0] border-b border-[var(--border)]" />
                    <div className="h-[2px] bg-[var(--red)] w-full" />
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-[#EBE6D6] w-3/4" />
                      <div className="h-1.5 bg-[#EBE6D6] w-1/2" />
                      <div className="h-1.5 bg-[#EBE6D6] w-2/3" />
                    </div>
                  </div>
                }
              />
              <ThemeCard
                selected={isDark}
                onSelect={() => setTheme("dark")}
                title="In Camera"
                subtitle="Chambers session — sealed, off the record"
                Icon={Moon}
                preview={
                  <div className="w-full h-32 bg-[#0a0a0a] border border-[var(--border)] overflow-hidden cinema-grain">
                    <div className="h-6 bg-[#141414] border-b border-[var(--border)]" />
                    <div className="h-[2px] bg-[var(--gold)] w-full" />
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-[#262626] w-3/4" />
                      <div className="h-1.5 bg-[#262626] w-1/2" />
                      <div className="h-1.5 bg-[#262626] w-2/3" />
                    </div>
                  </div>
                }
              />
            </div>
          </NoirCard>
        )}

        {/* ═══ AI USAGE REPORT ═══ */}
        {activeTab === "ai-usage" && (
          <div className="space-y-4">
            <NoirCard accent="var(--gold)">
              <h2 className="cinema-title text-[24px] text-white mb-1">
                AI Usage Report
              </h2>
              <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)] mb-6">
                Every AI-assisted output logged — WGA & compliance transparency
              </p>

              <div className="grid grid-cols-3 gap-0 border border-[var(--border)] mb-8">
                <StatTile value="142" label="AI Prompts Sent" accent="var(--gold)" />
                <StatTile value="87" label="Outputs Generated" accent="#ffffff" borderLeft />
                <StatTile value="34%" label="AI Contribution" accent="var(--red)" borderLeft />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={12} className="text-[var(--gold)]" />
                  <span className="cinema-label text-[10px] text-[var(--gold)]">
                    Contribution by Section
                  </span>
                </div>
                <div className="space-y-4">
                  {AI_CONTRIBUTIONS.map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-[13px] text-white">
                          {item.label}
                        </span>
                        <span className="cinema-label text-[10px] text-[var(--gold)]">
                          {item.pct}%
                        </span>
                      </div>
                      <div className="w-full h-[2px] bg-[var(--border)]">
                        <div
                          className="h-full bg-[var(--gold)] transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </NoirCard>

            <NoirCard>
              <div className="flex items-center gap-2 mb-5">
                <Clock size={12} className="text-[var(--muted-foreground)]" />
                <span className="cinema-label text-[10px] text-[var(--gold)]">
                  Recent Activity
                </span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {AI_ACTIVITY.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-3"
                  >
                    <span className="cinema-label text-[9px] text-[var(--muted-foreground)] w-20 shrink-0">
                      {item.time}
                    </span>
                    <span className="font-sans text-[13px] text-white flex-1">
                      {item.action}
                    </span>
                    <Chip color="var(--gold)" mono>
                      {item.category}
                    </Chip>
                    <span className="cinema-label text-[9px] text-[var(--muted-foreground)] shrink-0">
                      {item.model}
                    </span>
                  </div>
                ))}
              </div>
            </NoirCard>

            <NoirCard accent="var(--gold)">
              <div className="text-center py-2">
                <div className="cinema-contract text-[11px] text-[var(--gold)] mb-3">
                  WGA Compliance Notice
                </div>
                <p className="font-sans text-[13px] text-[var(--muted-foreground)] mb-4 max-w-2xl mx-auto leading-relaxed">
                  All AI-generated outputs are logged and percentage
                  contributions tracked per project. Export this report for
                  guild or production compliance at any time.
                </p>
                <LegalButton active color="var(--gold)">
                  <Download size={12} />
                  Export Report
                </LegalButton>
              </div>
            </NoirCard>
          </div>
        )}

        {/* ═══ BILLING ═══ */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            <NoirCard accent="var(--gold)">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="cinema-title text-[24px] text-white mb-1">
                    Current Plan
                  </h2>
                  <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)]">
                    Prime Time
                  </p>
                </div>
                <Chip color="var(--gold)" mono>
                  PRO
                </Chip>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-[var(--border)] mb-5">
                <StatTile value="100" label="Searches / mo" accent="var(--gold)" />
                <StatTile value="500" label="AI Gens / mo" accent="#ffffff" borderLeft />
                <StatTile value="10 GB" label="Storage" accent="var(--red)" borderLeft />
              </div>

              <div className="flex gap-2">
                <LegalButton active color="var(--red)">
                  Upgrade to Writers' Room
                </LegalButton>
                <LegalButton>View Invoices</LegalButton>
              </div>
            </NoirCard>

            <NoirCard>
              <h2 className="cinema-title text-[20px] text-white mb-4">
                Payment Method
              </h2>
              <div className="flex items-center justify-between p-4 border border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-[var(--muted-foreground)]" />
                  <div>
                    <div className="font-sans text-[13px] text-white font-semibold">
                      Visa ending in 4242
                    </div>
                    <div className="cinema-label text-[9px] text-[var(--muted-foreground)] mt-0.5">
                      Expires 12 / 26
                    </div>
                  </div>
                </div>
                <LegalButton small>Update</LegalButton>
              </div>
            </NoirCard>
          </div>
        )}

        {/* ═══ INTEGRATIONS ═══ */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            <NoirCard accent="var(--gold)">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0 border border-[var(--gold)]">
                  <Link2 size={20} className="text-[var(--gold)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="cinema-title text-[24px] text-white mb-1">
                    Connected Services
                  </h2>
                  <p className="font-sans text-[13px] text-[var(--muted-foreground)] leading-relaxed">
                    Connect legal research tools, court systems, and cloud
                    storage. PACER, CourtListener, Clio, Westlaw and more all
                    plug into the workspace here.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <div className="cinema-title text-[32px] text-[var(--gold)] leading-none">
                    {connectedCount}
                  </div>
                  <div className="cinema-label text-[9px] text-[var(--muted-foreground)]">
                    of {totalCount} connected
                  </div>
                </div>
              </div>
            </NoirCard>

            {/* Category accordions */}
            {INTEGRATION_CATEGORIES.map(category => {
              const activeCount = category.integrations.filter(
                i => i.connected
              ).length
              const isExpanded = expandedCategory === category.id

              return (
                <div
                  key={category.id}
                  className="border border-[var(--border)] bg-[#141414] overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.id)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center border border-[var(--border)]">
                        <category.icon size={18} className="text-[var(--gold)]" />
                      </div>
                      <div className="text-left">
                        <div className="cinema-contract text-[12px] text-white">
                          {category.name}
                        </div>
                        <div className="cinema-label text-[9px] text-[var(--muted-foreground)] mt-1">
                          {category.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="cinema-label text-[9px] text-[var(--gold)]">
                        {activeCount} active
                      </span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "text-[var(--muted-foreground)] transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[var(--border)] p-4 space-y-3 bg-[#0f0f0f]">
                      {category.integrations.map(integration => (
                        <div
                          key={integration.id}
                          className={cn(
                            "border p-4 transition-colors",
                            integration.connected
                              ? "border-[var(--gold)]/40 bg-[color:color-mix(in_srgb,var(--gold)_5%,transparent)]"
                              : "border-[var(--border)] bg-[#141414] hover:border-[var(--muted-foreground)]"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="cinema-contract text-[12px] text-white">
                                  {integration.name}
                                </span>
                                {integration.connected ? (
                                  <Chip color="var(--gold)" mono>
                                    <CheckCircle2 size={9} />
                                    Connected
                                  </Chip>
                                ) : (
                                  <Chip mono>Available</Chip>
                                )}
                              </div>
                              <div className="cinema-label text-[9px] text-[var(--muted-foreground)] mb-2">
                                {integration.fullName}
                              </div>
                              <p className="font-sans text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                                {integration.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {integration.connected &&
                                integration.lastSync && (
                                  <div className="text-right mr-2">
                                    <div className="cinema-label text-[8px] text-[var(--muted-foreground)]">
                                      Last sync
                                    </div>
                                    <div className="cinema-label text-[9px] text-[var(--gold)] mt-0.5">
                                      {integration.lastSync}
                                    </div>
                                  </div>
                                )}
                              {integration.connected ? (
                                <>
                                  <button
                                    onClick={() => handleSync(integration.id)}
                                    disabled={
                                      syncingIntegration === integration.id
                                    }
                                    className={cn(
                                      "w-8 h-8 flex items-center justify-center",
                                      "border border-[var(--border)] bg-transparent",
                                      "text-[var(--muted-foreground)]",
                                      "hover:border-[var(--gold)] hover:text-[var(--gold)]",
                                      "transition-colors",
                                      "disabled:opacity-50"
                                    )}
                                  >
                                    <RefreshCw
                                      size={12}
                                      className={cn(
                                        syncingIntegration === integration.id &&
                                          "animate-spin"
                                      )}
                                    />
                                  </button>
                                  <LegalButton
                                    small
                                    color="var(--red)"
                                    onClick={() =>
                                      handleDisconnect(
                                        integration.id,
                                        integration.name
                                      )
                                    }
                                  >
                                    Disconnect
                                  </LegalButton>
                                </>
                              ) : (
                                <LegalButton
                                  small
                                  active
                                  color="var(--gold)"
                                  onClick={() =>
                                    handleConnect(
                                      integration.id,
                                      integration.name
                                    )
                                  }
                                >
                                  Connect
                                </LegalButton>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {integration.features.map((feature, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 cinema-label text-[8px] border border-[var(--border)] text-[var(--muted-foreground)]"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <NoirCard accent="var(--gold)">
              <div className="flex items-start gap-3">
                <HelpCircle
                  size={18}
                  className="text-[var(--gold)] shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <div className="cinema-contract text-[12px] text-white mb-1">
                    Need help connecting?
                  </div>
                  <p className="font-sans text-[12px] text-[var(--muted-foreground)] mb-4 leading-relaxed">
                    Visit our integration guides for step-by-step setup
                    instructions, or contact support for assistance with
                    enterprise integrations and custom configurations.
                  </p>
                  <div className="flex gap-2">
                    <LegalButton small>
                      <BookOpen size={11} />
                      Integration Guides
                    </LegalButton>
                    <LegalButton small>
                      <Mail size={11} />
                      Contact Support
                    </LegalButton>
                  </div>
                </div>
              </div>
            </NoirCard>
          </div>
        )}

        {/* ═══ API KEYS ═══ */}
        {activeTab === "api" && (
          <NoirCard accent="var(--gold)">
            <h2 className="cinema-title text-[24px] text-white mb-1">
              API Keys
            </h2>
            <p className="cinema-contract-italic text-[11px] text-[var(--muted-foreground)] mb-6">
              Script access — treat like a production key
            </p>

            <div className="space-y-3">
              {API_KEYS.map(apiKey => (
                <div
                  key={apiKey.id}
                  className="p-4 border border-[var(--gold)]/40 bg-[color:color-mix(in_srgb,var(--gold)_5%,transparent)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="cinema-contract text-[12px] text-white mb-1">
                        {apiKey.name}
                      </div>
                      <div className="cinema-label text-[10px] text-[var(--gold)] mb-2 truncate">
                        {apiKey.key}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="cinema-label text-[8px] text-[var(--muted-foreground)]">
                          Created · {apiKey.created}
                        </span>
                        <span className="cinema-label text-[8px] text-[var(--gold)]">
                          Last used · {apiKey.lastUsed}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center",
                          "border border-[var(--border)] bg-transparent",
                          "text-[var(--muted-foreground)]",
                          "hover:border-[var(--gold)] hover:text-[var(--gold)]",
                          "transition-colors"
                        )}
                      >
                        <Copy size={12} />
                      </button>
                      <LegalButton small color="var(--red)">
                        Revoke
                      </LegalButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <LegalButton active color="var(--gold)">
                <Plus size={12} />
                Generate New Key
              </LegalButton>
            </div>
          </NoirCard>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

/* ─── Helpers ─── */
function SecurityRow({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <div className="cinema-contract text-[12px] text-white">{title}</div>
        <div className="cinema-label text-[9px] text-[var(--muted-foreground)] mt-0.5">
          {subtitle}
        </div>
      </div>
      {action}
    </div>
  )
}

function StatTile({
  value,
  label,
  accent,
  borderLeft = false,
}: {
  value: string
  label: string
  accent: string
  borderLeft?: boolean
}) {
  return (
    <div
      className={cn(
        "text-center p-5",
        borderLeft && "border-l border-[var(--border)]"
      )}
      style={{ borderTop: `2px solid ${accent}` }}
    >
      <div
        className="cinema-title text-[32px] leading-none"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="cinema-label text-[9px] text-[var(--muted-foreground)] mt-2">
        {label}
      </div>
    </div>
  )
}

function ThemeCard({
  selected,
  onSelect,
  title,
  subtitle,
  Icon,
  preview,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  preview: React.ReactNode
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "p-4 border transition-colors text-left",
        selected
          ? "border-[var(--gold)] bg-[color:color-mix(in_srgb,var(--gold)_6%,transparent)]"
          : "border-[var(--border)] bg-transparent hover:border-[var(--muted-foreground)]"
      )}
    >
      {preview}
      <div className="flex items-center justify-center gap-2 mt-4">
        <Icon
          size={14}
          className={selected ? "text-[var(--gold)]" : "text-[var(--muted-foreground)]"}
        />
        <span
          className={cn(
            "cinema-contract text-[12px]",
            selected ? "text-[var(--gold)]" : "text-white"
          )}
        >
          {title}
        </span>
      </div>
      <p className="cinema-label text-[9px] text-[var(--muted-foreground)] mt-1 text-center">
        {subtitle}
      </p>
    </button>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  )
}
