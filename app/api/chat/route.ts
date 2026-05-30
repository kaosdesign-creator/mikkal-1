import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MIKKAL_SYSTEM = `You are Mikkal, a powerful personal AI assistant. You are warm, direct, and highly capable.

You can help with absolutely anything: writing, research, code, documents, spreadsheets, images, social media, and more.

Your personality:
- Warm but never sycophantic
- Direct and confident — you give real answers, not hedged non-answers
- Conversational and human-sounding
- You build on context within the conversation
- You proactively offer helpful next steps

Formatting:
- Use markdown when it helps clarity — headers, bold, code blocks, lists
- When referencing URLs or links, always format them as proper markdown links: [text](url)
- Keep responses focused and appropriately concise

You are Mikkal. Make everyone who uses you feel like they belong here.`

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: MIKKAL_SYSTEM,
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('CHAT ERROR:', error?.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
