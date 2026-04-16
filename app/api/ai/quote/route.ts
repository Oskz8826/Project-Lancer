import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a game dev freelance pricing assistant built into Lancer, a quoting tool for game artists and developers. Your job is to analyse a client brief and suggest a structured quote. You understand game dev asset types, complexity tiers, and regional rate differences. You are practical, direct, and do not over-explain.
Always respond in valid JSON only. No preamble, no explanation, no markdown. Just the JSON object.

The JSON must follow this exact structure:
{
  "asset_type": string,
  "complexity_tier": "Simple" | "Mid" | "Complex" | "Hero",
  "estimated_hours_min": number,
  "estimated_hours_max": number,
  "suggested_rate_eur": number,
  "revisions_included": number,
  "usage_rights": "Personal" | "Indie" | "Commercial" | "AAA",
  "rush_job": boolean,
  "quote_min_eur": number,
  "quote_max_eur": number,
  "confidence": "Low" | "Medium" | "High",
  "confidence_reason": string,
  "notes": string
}

If the brief is too vague, set confidence to "Low" and explain in confidence_reason what information is missing.`

export async function POST(req: NextRequest) {
  // Auth check
  const pbAuth = req.cookies.get('pb_auth')?.value
  if (!pbAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let tier: string | undefined
  let aiAddon: boolean | undefined
  try {
    const parsed = JSON.parse(pbAuth)
    if (!parsed?.token) throw new Error()
    tier    = parsed?.model?.tier
    aiAddon = parsed?.model?.ai_addon
  } catch {
    return NextResponse.json({ error: 'Invalid auth' }, { status: 401 })
  }

  // Tier + addon check
  if (tier === 'free') {
    return NextResponse.json({ error: 'AI assist requires Basic plan or higher.' }, { status: 403 })
  }
  if (!aiAddon) {
    return NextResponse.json({ error: 'AI assist add-on not enabled on your account.' }, { status: 403 })
  }

  // API key check
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI assist is not configured yet — API key missing.' },
      { status: 503 }
    )
  }

  // Parse body
  const body = await req.json().catch(() => null)
  if (!body?.client_brief) {
    return NextResponse.json({ error: 'client_brief is required.' }, { status: 400 })
  }

  const { client_brief, discipline, experience_level, region, country, hourly_rate } = body

  const userPrompt = `Artist profile:
- Discipline: ${discipline ?? 'Not specified'}
- Experience level: ${experience_level ?? 'Mid'}
- Region: ${region ?? 'Not specified'}
- Country: ${country ?? 'Not specified'}
- Default hourly rate: €${hourly_rate ?? 0}/hr

Client brief:
${client_brief}

Based on this brief and artist profile, suggest a quote using the JSON format specified.`

  try {
    const client  = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: userPrompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const data = JSON.parse(text)
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
