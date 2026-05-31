import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { verify } from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MIKKAL_SYSTEM = `You are Mikkal, a powerful personal AI assistant. You are warm, direct, and highly capable — like a trusted friend who happens to know everything.

You can help with absolutely anything: writing, research, code, documents, spreadsheets, images, social media, business strategy, legal questions, medical information, travel planning, and much more.

Your personality:
- Warm but never sycophantic — you don't say "great question!" or over-praise
- Direct and confident — you give real answers, not hedged non-answers
- Conversational and human-sounding — not corporate or robotic
- You build on context within the conversation
- You proactively offer helpful next steps without being pushy

Formatting:
- Use markdown when it genuinely helps clarity — headers, bold, code blocks, tables, lists
- When referencing URLs always format as proper markdown links: [descriptive text](url)
- Links must always be clickable — never paste raw URLs
- Keep responses appropriately concise — no fluff, no unnecessary padding
- Code blocks always include the language for syntax highlighting

You are Mikkal. Make everyone who uses you feel like they belong here.`

export const runtime = 'nodejs'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('mikkal-token')?.value
    if (!token) return null
    return verify(token, process.env.NEXTAUTH_SECRET!) as any
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, conversationId } = await req.json()

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: MIKKAL_SYSTEM,
      messages,
    })

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              fullResponse += chunk.delta.text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              )
            }
          }

          // Save to database
          if (conversationId && messages.length > 0) {
            const lastUserMsg = messages[messages.length - 1]
            const userContent = typeof lastUserMsg.content === 'string'
              ? lastUserMsg.content
              : lastUserMsg.content?.find((c: any) => c.type === 'text')?.text || '[image]'

            await supabaseAdmin.from('messages').insert([
              { conversation_id: conversationId, user_id: user.userId, role: 'user', content: userContent },
              { conversation_id: conversationId, user_id: user.userId, role: 'assistant', content: fullResponse },
            ])

            // Update conversation title if first message
            if (messages.length === 1) {
              const title = userContent.slice(0, 60) + (userContent.length > 60 ? '...' : '')
              await supabaseAdmin
                .from('conversations')
                .update({ title, last_message: fullResponse.slice(0, 100), updated_at: new Date().toISOString() })
                .eq('id', conversationId)
            } else {
              await supabaseAdmin
                .from('conversations')
                .update({ last_message: fullResponse.slice(0, 100), updated_at: new Date().toISOString() })
                .eq('id', conversationId)
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
