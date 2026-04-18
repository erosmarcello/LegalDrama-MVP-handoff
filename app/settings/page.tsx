"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Moon, Sun, ArrowLeft, User, Shield, CreditCard,
  Palette, Key, Link2, Trash2, Check,
  Sparkles, RefreshCw, ChevronDown,
  Copy, Plus, Clock, CheckCircle2,
  HelpCircle, Download, Activity,
  Gavel, BookOpen, Cloud, Folder, Bell, Calendar, Zap,
  Mail, Monitor
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LegalButton, Chip, ToastProvider, useToast, LegalInput } from "@/components/legal-ui"
import { SiteFooter } from "@/components/site-footer"

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

/* ─── Main component ─── */
function SettingsContent() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted ? resolvedTheme === "dark" : false

  const [activeTab, setActiveTab] = useState("profile")
  const [expandedCategory, setExpandedCategory] = useState<string | null>("court-systems")
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@lawfirm.com",
    firm: "Doe & Associates LLP",
    role: "Senior Partner",
  })

  const handleSave = () => toast("Settings saved!", "var(--green)")

  const handleSync = async (integrationId: string) => {
    setSyncingIntegration(integrationId)
    await new Promise(r => setTimeout(r, 2000))
    setSyncingIntegration(null)
    toast("Sync complete!", "var(--green)")
  }

  const handleConnect = (_id: string, name: string) =>
    toast(`Opening ${name} authentication...`, "var(--cyan)")

  const handleDisconnect = (_id: string, name: string) =>
    toast(`Disconnected from ${name}`, "var(--orange)")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast("Copied to clipboard!", "var(--green)")
  }

  const connectedCount = INTEGRATION_CATEGORIES.reduce(
    (a, c) => a + c.integrations.filter(i => i.connected).length, 0
  )
  const totalCount = INTEGRATION_CATEGORIES.reduce(
    (a, c) => a + c.integrations.length, 0
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Masthead ── */}
      <nav className="sticky top-0 z-50 border-b-[2.5px] border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface)]">
        <div className="px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={cn(
                "w-9 h-9 flex items-center justify-center",
                "border-[2.5px] border-[var(--border)] bg-[var(--background)]",
                "text-[var(--foreground)] hover:border-[var(--amber)]",
                "transition-all shadow-[2px_2px_0px_var(--shadow-color)]",
                "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              )}
            >
              <ArrowLeft size={16} />
            </button>
            <Link href="/" className="flex items-baseline gap-0.5 cursor-pointer group">
              <span className="font-sans text-xl font-extrabold text-[var(--foreground)] transition-colors group-hover:text-[var(--red)]">
                legal
              </span>
              <span className="font-sans text-xl font-extrabold text-[var(--red)]">
                drama
              </span>
              <span className="font-mono text-sm text-[var(--pink)]">.ai</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 py-8 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-sans text-3xl font-black text-foreground">Settings</h1>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              Manage your account, integrations, and preferences
            </p>
          </div>
          {activeTab === "integrations" && (
            <div className="flex items-center gap-2">
              <Chip mono bold color="var(--green)">{connectedCount} Connected</Chip>
              <Chip mono bold>{totalCount - connectedCount} Available</Chip>
            </div>
          )}
        </div>

        {/* ── Horizontal Tab Bar ── */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 whitespace-nowrap",
                  "font-mono text-xs font-bold",
                  "border-[2.5px] transition-all",
                  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                  isActive
                    ? "border-[var(--red)] text-[var(--red)] bg-[var(--red)]/5 shadow-[3px_3px_0px_var(--shadow-color)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--card)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/40 shadow-[3px_3px_0px_var(--shadow-color)]"
                )}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.5 text-[9px] font-bold border",
                    isActive
                      ? "bg-[var(--red)]/15 text-[var(--red)] border-[var(--red)]/30"
                      : "bg-[var(--green)]/15 text-[var(--green)] border-[var(--green)]/30"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Tab Content ── */}

        {/* ═══ PROFILE ═══ */}
        {activeTab === "profile" && (
          <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h2 className="font-sans text-lg font-bold text-foreground mb-6">Profile Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <LegalInput
                label="Full Name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
              />
              <LegalInput
                label="Email"
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
              <LegalInput
                label="Firm/Organization"
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
              <LegalButton onClick={handleSave} className="shadow-[3px_3px_0px_var(--shadow-color)]">
                Save Changes
              </LegalButton>
            </div>
          </div>
        )}

        {/* ═══ ACCOUNT ═══ */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Security */}
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <h2 className="font-sans text-lg font-bold text-foreground mb-5">Security</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border-[2.5px] border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)]/40 transition-all">
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">Password</div>
                    <div className="font-mono text-[11px] text-muted-foreground">Last changed 30 days ago</div>
                  </div>
                  <LegalButton small className="shadow-[3px_3px_0px_var(--shadow-color)]">Change</LegalButton>
                </div>

                <div className="flex items-center justify-between p-4 border-[2.5px] border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)]/40 transition-all">
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">Two-Factor Auth</div>
                    <div className="font-mono text-[11px] text-muted-foreground">Add extra security to your account</div>
                  </div>
                  <Chip mono bold color="var(--red)">Not Enabled</Chip>
                </div>

                <div className="flex items-center justify-between p-4 border-[2.5px] border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)]/40 transition-all">
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">Active Sessions</div>
                    <div className="font-mono text-[11px] text-muted-foreground">2 devices currently logged in</div>
                  </div>
                  <LegalButton small className="shadow-[3px_3px_0px_var(--shadow-color)]">Manage</LegalButton>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-[2.5px] border-[var(--red)]/50 bg-[var(--red)]/5 p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <h2 className="font-sans text-lg font-bold text-[var(--red)] mb-2">Danger Zone</h2>
              <p className="font-serif text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <LegalButton small color="var(--red)" className="shadow-[3px_3px_0px_var(--shadow-color)]">
                <Trash2 size={12} />
                Delete Account
              </LegalButton>
            </div>
          </div>
        )}

        {/* ═══ APPEARANCE ═══ */}
        {activeTab === "appearance" && (
          <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h2 className="font-sans text-lg font-bold text-foreground mb-6">Theme</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Light Mode */}
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "p-5 border-[2.5px] transition-all text-left",
                  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                  !isDark
                    ? "border-[var(--red)] shadow-[4px_4px_0px_var(--red)]"
                    : "border-[var(--border)] shadow-[4px_4px_0px_var(--shadow-color)] hover:border-[var(--foreground)]/40"
                )}
              >
                {/* Preview */}
                <div className="w-full h-32 bg-[#FFF9EC] border-[2.5px] border-[var(--border)] mb-4 overflow-hidden">
                  <div className="h-6 bg-[#F5F0E0] border-b-2 border-[var(--border)]" />
                  <div className="h-[2px] bg-[var(--red)] w-full" />
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-[#EBE6D6] w-3/4" />
                    <div className="h-1.5 bg-[#EBE6D6] w-1/2" />
                    <div className="h-1.5 bg-[#EBE6D6] w-2/3" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Sun size={16} className="text-[var(--amber)]" />
                  <span className="font-mono text-sm font-bold text-foreground">Open Court</span>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground mt-1 text-center">
                  Public session — bright, on the record
                </p>
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "p-5 border-[2.5px] transition-all text-left",
                  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
                  isDark
                    ? "border-[var(--red)] shadow-[4px_4px_0px_var(--red)]"
                    : "border-[var(--border)] shadow-[4px_4px_0px_var(--shadow-color)] hover:border-[var(--foreground)]/40"
                )}
              >
                {/* Preview */}
                <div className="w-full h-32 bg-[#1C1810] border-[2.5px] border-[#3A3520] mb-4 overflow-hidden">
                  <div className="h-6 bg-[#252118] border-b-2 border-[#3A3520]" />
                  <div className="h-[2px] bg-[var(--purple)] w-full" />
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-[#302A1F] w-3/4" />
                    <div className="h-1.5 bg-[#302A1F] w-1/2" />
                    <div className="h-1.5 bg-[#302A1F] w-2/3" />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Moon size={16} className="text-[var(--purple)]" />
                  <span className="font-mono text-sm font-bold text-foreground">In Camera</span>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground mt-1 text-center">
                  Chambers session — sealed, off the record
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ═══ AI USAGE REPORT ═══ */}
        {activeTab === "ai-usage" && (
          <div className="space-y-6">
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <h2 className="font-sans text-lg font-bold text-foreground mb-1">AI Usage Report</h2>
              <p className="font-serif text-sm text-muted-foreground mb-6">
                Track every AI-assisted output for WGA and compliance transparency.
              </p>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-3xl font-black text-[var(--cyan)]">142</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-1">AI Prompts Sent</div>
                </div>
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-3xl font-black text-[var(--foreground)]">87</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-1">Outputs Generated</div>
                </div>
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-3xl font-black text-[var(--amber)]">34%</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-1">AI Contribution</div>
                </div>
              </div>

              {/* AI Contribution by Section */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-[var(--amber)]" />
                  <span className="font-sans text-sm font-bold text-foreground">AI Contribution by Section</span>
                </div>
                <div className="space-y-4">
                  {AI_CONTRIBUTIONS.map(item => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-foreground">{item.label}</span>
                        <span className="font-mono text-xs font-bold text-[var(--amber)]">{item.pct}%</span>
                      </div>
                      <div className="w-full h-[3px] bg-[var(--surface-alt)]">
                        <div
                          className="h-full bg-[var(--amber)] transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent AI Activity */}
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={14} className="text-muted-foreground" />
                <span className="font-sans text-sm font-bold text-foreground">Recent AI Activity</span>
              </div>

              <div className="space-y-0">
                {AI_ACTIVITY.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-4 py-4 px-2",
                      i < AI_ACTIVITY.length - 1 && "border-b border-[var(--border)]/30"
                    )}
                  >
                    <span className="font-mono text-[11px] text-muted-foreground w-20 shrink-0">
                      {item.time}
                    </span>
                    <span className="font-sans text-sm font-semibold text-foreground flex-1">
                      {item.action}
                    </span>
                    <Chip mono bold color="var(--amber)" className="shrink-0">
                      {item.category}
                    </Chip>
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                      {item.model}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WGA Compliance Notice */}
            <div className="border-[2.5px] border-dashed border-[var(--cyan)]/50 bg-[var(--cyan)]/5 p-6">
              <div className="text-center">
                <div className="font-mono text-xs font-bold text-[var(--amber)] tracking-widest uppercase mb-3">
                  WGA Compliance Notice
                </div>
                <p className="font-serif text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
                  All AI-generated outputs are logged and percentage contributions tracked per project.
                  Export this report for guild or production compliance at any time.
                </p>
                <LegalButton color="var(--amber)" className="shadow-[3px_3px_0px_var(--shadow-color)]">
                  <Download size={14} />
                  Export Report
                </LegalButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══ BILLING ═══ */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-sans text-lg font-bold text-foreground">Current Plan</h2>
                <Chip mono bold color="var(--purple)">PRO</Chip>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-2xl font-black text-foreground">100</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-1">Searches/mo</div>
                </div>
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-2xl font-black text-foreground">500</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-1">AI Gens/mo</div>
                </div>
                <div className="text-center p-5 border-[2.5px] border-[var(--border)] bg-[var(--background)] shadow-[3px_3px_0px_var(--shadow-color)]">
                  <div className="font-mono text-2xl font-black text-foreground">10GB</div>
                  <div className="font-mono text-[10px] font-bold text-muted-foreground tracking-wider uppercase mt-1">Storage</div>
                </div>
              </div>

              <div className="flex gap-2">
                <LegalButton color="var(--red)" className="shadow-[3px_3px_0px_var(--shadow-color)]">
                  Upgrade to Enterprise
                </LegalButton>
                <LegalButton className="shadow-[3px_3px_0px_var(--shadow-color)]">
                  View Invoices
                </LegalButton>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
              <h2 className="font-sans text-lg font-bold text-foreground mb-4">Payment Method</h2>
              <div className="flex items-center justify-between p-4 border-[2.5px] border-[var(--border)] bg-[var(--background)]">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-muted-foreground" />
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">Visa ending in 4242</div>
                    <div className="font-mono text-[11px] text-muted-foreground">Expires 12/26</div>
                  </div>
                </div>
                <LegalButton small className="shadow-[3px_3px_0px_var(--shadow-color)]">Update</LegalButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══ INTEGRATIONS ═══ */}
        {activeTab === "integrations" && (
          <div className="space-y-4">
            {/* Overview card */}
            <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-[var(--red)]/10 border-[2.5px] border-[var(--red)]/30">
                  <Link2 size={24} className="text-[var(--red)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-sans text-lg font-bold text-foreground">Connected Services</h2>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    Connect your legal research tools, court systems, and cloud storage to enhance your workflow.
                    LegalDrama.ai integrates with industry-standard platforms.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <div className="font-mono text-3xl font-black text-[var(--red)]">{connectedCount}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">of {totalCount} connected</div>
                </div>
              </div>
            </div>

            {/* Category accordions */}
            {INTEGRATION_CATEGORIES.map(category => {
              const activeCount = category.integrations.filter(i => i.connected).length
              const isExpanded = expandedCategory === category.id

              return (
                <div
                  key={category.id}
                  className="border-[2.5px] border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-[4px_4px_0px_var(--shadow-color)]"
                >
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4",
                      "hover:bg-[var(--surface-alt)] transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-[var(--red)]/10 border border-[var(--red)]/30">
                        <category.icon size={20} className="text-[var(--red)]" />
                      </div>
                      <div className="text-left">
                        <div className="font-mono text-sm font-bold text-foreground">{category.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Chip mono bold color="var(--green)">{activeCount} active</Chip>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {/* Expanded integrations */}
                  {isExpanded && (
                    <div className="border-t-[2.5px] border-[var(--border)] p-4 space-y-3 bg-[var(--background)]/50">
                      {category.integrations.map(integration => (
                        <div
                          key={integration.id}
                          className={cn(
                            "border-[2.5px] p-4",
                            integration.connected
                              ? "border-[var(--green)]/30 bg-[var(--green)]/5"
                              : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/30"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-foreground">
                                  {integration.name}
                                </span>
                                {integration.connected ? (
                                  <Chip mono bold color="var(--green)">
                                    <CheckCircle2 size={10} />
                                    Connected
                                  </Chip>
                                ) : (
                                  <Chip mono bold>Available</Chip>
                                )}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground mb-1">
                                {integration.fullName}
                              </div>
                              <p className="font-serif text-xs text-muted-foreground">
                                {integration.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              {integration.connected && integration.lastSync && (
                                <div className="text-right mr-2">
                                  <div className="font-mono text-[9px] text-muted-foreground">Last sync</div>
                                  <div className="font-mono text-[10px] text-[var(--green)]">{integration.lastSync}</div>
                                </div>
                              )}
                              {integration.connected ? (
                                <>
                                  <button
                                    onClick={() => handleSync(integration.id)}
                                    disabled={syncingIntegration === integration.id}
                                    className={cn(
                                      "p-2 border-[2.5px] border-[var(--border)] bg-[var(--background)]",
                                      "hover:border-[var(--foreground)]/40 transition-all",
                                      "disabled:opacity-50"
                                    )}
                                  >
                                    <RefreshCw
                                      size={14}
                                      className={cn(
                                        "text-muted-foreground",
                                        syncingIntegration === integration.id && "animate-spin"
                                      )}
                                    />
                                  </button>
                                  <LegalButton
                                    small
                                    color="var(--red)"
                                    onClick={() => handleDisconnect(integration.id, integration.name)}
                                    className="shadow-[3px_3px_0px_var(--shadow-color)]"
                                  >
                                    Disconnect
                                  </LegalButton>
                                </>
                              ) : (
                                <LegalButton
                                  small
                                  onClick={() => handleConnect(integration.id, integration.name)}
                                  className="shadow-[3px_3px_0px_var(--shadow-color)]"
                                >
                                  Connect
                                </LegalButton>
                              )}
                            </div>
                          </div>

                          {/* Feature tags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {integration.features.map((feature, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 font-mono text-[9px] border border-[var(--border)] bg-[var(--surface-alt)]"
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

            {/* Help footer */}
            <div className="border-[2.5px] border-[var(--cyan)]/30 bg-[var(--cyan)]/5 p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
              <div className="flex items-start gap-3">
                <HelpCircle size={20} className="text-[var(--cyan)] shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono text-sm font-bold text-foreground mb-1">Need help connecting?</div>
                  <p className="font-serif text-xs text-muted-foreground mb-4">
                    Visit our integration guides for step-by-step setup instructions, or contact support
                    for assistance with enterprise integrations and custom configurations.
                  </p>
                  <div className="flex gap-2">
                    <LegalButton small className="shadow-[3px_3px_0px_var(--shadow-color)]">
                      <BookOpen size={12} />
                      Integration Guides
                    </LegalButton>
                    <LegalButton small className="shadow-[3px_3px_0px_var(--shadow-color)]">
                      <Mail size={12} />
                      Contact Support
                    </LegalButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ API KEYS ═══ */}
        {activeTab === "api" && (
          <div className="border-[2.5px] border-[var(--border)] bg-[var(--card)] p-6 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h2 className="font-sans text-lg font-bold text-foreground mb-1">API Keys</h2>
            <p className="font-serif text-sm text-muted-foreground mb-6">
              Use API keys to integrate LegalDrama.ai with your own applications and workflows.
            </p>

            <div className="space-y-3">
              {API_KEYS.map(apiKey => (
                <div
                  key={apiKey.id}
                  className="p-4 border-[2.5px] border-[var(--green)]/30 bg-[var(--green)]/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-foreground mb-1">{apiKey.name}</div>
                      <div className="font-mono text-xs text-muted-foreground mb-2">{apiKey.key}</div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Created: {apiKey.created}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--green)]">
                          Last used: {apiKey.lastUsed}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="p-2 border-[2.5px] border-[var(--border)] bg-[var(--background)] hover:border-[var(--foreground)]/40 transition-all"
                      >
                        <Copy size={14} className="text-muted-foreground" />
                      </button>
                      <LegalButton small color="var(--red)" className="shadow-[3px_3px_0px_var(--shadow-color)]">
                        Revoke
                      </LegalButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <LegalButton className="shadow-[3px_3px_0px_var(--shadow-color)]">
                <Plus size={14} />
                Generate New Key
              </LegalButton>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  )
}
