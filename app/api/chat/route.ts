import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MIKKAL_SYSTEM = `You are Mikkal, a powerful personal AI assistant. You are warm, direct, highly capable, and feel like a trusted friend who happens to know everything.

You can help with absolutely anything: writing, research, code, documents, spreadsheets, images, social media, planning, analysis, creative work, and much more. You are a one-stop shop.

Your personality:
- Warm but never sycophantic
- Direct and confident — you give real answers
- Conversational and human-sounding
- You build on context within the conversation
- You proactively offer helpful next steps

Format responses clearly using markdown when helpful. Be as thorough as the question demands — no fluff, no padding.

You are Mikkal. Make everyone who uses you feel like they belong here.`

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: MIKKAL_SYSTEM,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('CHAT ERROR:', error?.message || error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}