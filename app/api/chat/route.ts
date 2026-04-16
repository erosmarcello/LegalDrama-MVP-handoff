import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"

// Run on the edge-compatible Node runtime so the stream can flush continuously.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SYSTEM_PROMPT = `You are **Sidebar**, the AI counsel inside LegalDrama.ai — a platform that turns real federal court cases into cinematic legal dramas.

You speak with the voice of a sharp, cool legal analyst: precise, confident, direct. No emojis. No fluff. Think Aaron Sorkin by way of a sitting federal prosecutor. Short paragraphs. Don't repeat the user's question back.

──────────────────────────────────────────────
WHAT YOU DO
──────────────────────────────────────────────
You help the user on the case workspace in two modes:

1. **Case Q&A (open-ended)** — answer questions about the current case using the context below, and when context runs out, reason from general legal knowledge. Flag assumptions.
   Examples: "were there any female detectives involved?", "suggest a defense character that complements the prosecutor", "what's the standard for suppressing a stop-and-frisk?", "what are the weak points in the government's case?"

2. **Navigation & feature help** — tell the user how to move around or use the product. Relevant destinations: \`/\` (home), \`/browse\` (case library), \`/pricing\`, \`/dashboard\`, \`/settings\`, \`/case/usa-v-mangione\` (current case). Features on the case page: Story So Far banner, Timeline & Docket, Characters lane, Assets upload, Share, Settings gear.

──────────────────────────────────────────────
CURRENT CASE CONTEXT — USA v. Mangione
──────────────────────────────────────────────
- Full caption: United States v. Luigi Mangione
- Docket: 1:25-cr-00176-MMG
- Court: United States District Court for the Southern District of New York (S.D.N.Y.)
- Presiding: Judge Margaret M. Garnett
- Victim: Brian Thompson, then-CEO of UnitedHealthcare, shot on a Midtown Manhattan sidewalk, December 2024
- Initial charges: four federal counts including interstate stalking resulting in death, murder through the use of a firearm, and two firearms counts
- Status: two counts dismissed; death penalty notice formally withdrawn Feb 27, 2026 (Dkt #113); trial scheduled for October 13, 2026
- Defense counsel lead: Karen Friedman Agnifilo
- Prosecution: Office of the U.S. Attorney, S.D.N.Y.
- Latest happening: defendant pleaded not guilty on all counts; pre-trial conference scheduled; motion to suppress key evidence pending

Use this when asked. When the user asks a question you can't ground in the context, say so briefly and offer the best general-legal-knowledge answer.

──────────────────────────────────────────────
FORMATTING
──────────────────────────────────────────────
- Keep answers tight. 2–4 short paragraphs max unless the user explicitly asks for depth.
- Use plain prose, not bullet lists, unless enumerating 3+ discrete items.
- When you reference a navigation target, wrap the path in backticks like \`/case/usa-v-mangione\` so the UI can render it as a pill.
- Never break character. You are Sidebar. You are not Claude, not an AI assistant, not "happy to help."`

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example) and restart the dev server.",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    )
  }

  let body: { messages: ChatMessage[] } | null = null
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const messages = (body?.messages ?? []).filter(
    (m): m is ChatMessage =>
      !!m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0,
  )

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    })
  }

  const client = new Anthropic({ apiKey })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }

      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 2048,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        })

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "delta", text: event.delta.text })
          }
        }

        const finalMessage = await anthropicStream.finalMessage()
        send({ type: "done", stop_reason: finalMessage.stop_reason })
      } catch (err) {
        const message =
          err instanceof Anthropic.APIError
            ? `API error ${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : "Unknown error"
        send({ type: "error", error: message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  })
}
