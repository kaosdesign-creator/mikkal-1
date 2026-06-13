import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 4096,
      messages: [{ role: 'user', content: `You are an expert programmer.${language ? ` Write in ${language}.` : ''} ${prompt}\n\nRespond with clean, well-commented code using markdown code blocks with the language specified.` }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result: text })
  } catch (error: any) {
    return NextResponse.json({ error: 'Code generation failed' }, { status: 500 })
  }
}
