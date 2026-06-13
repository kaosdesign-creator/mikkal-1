import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const { topic, platform, tone } = await req.json()
    if (!topic) return NextResponse.json({ error: 'No topic' }, { status: 400 })
    const guides: Record<string,string> = { twitter: 'X/Twitter: max 280 chars, punchy', linkedin: 'LinkedIn: 150-300 words, professional, add CTA', instagram: 'Instagram: visual storytelling, 5-10 hashtags', facebook: 'Facebook: conversational, 100-200 words' }
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 1024,
      messages: [{ role: 'user', content: `Create 3 variations of a ${platform} post about: "${topic}"\nTone: ${tone}\nRules: ${guides[platform] || platform}\n\nNumber each post (1. 2. 3.) with blank lines between. Just the posts, no commentary.` }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result: text })
  } catch (error: any) {
    return NextResponse.json({ error: 'Social generation failed' }, { status: 500 })
  }
}
