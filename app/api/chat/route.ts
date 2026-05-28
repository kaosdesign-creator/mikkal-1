import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions)
// if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = await req.json()

    const stream = await anthropic.messages.stream({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system:     MIKKAL_SYSTEM,
      messages,
    })

    const encoder  = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
