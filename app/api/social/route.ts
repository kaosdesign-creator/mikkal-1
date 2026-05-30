import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { topic, platform, tone } = await req.json()
    if (!topic) return NextResponse.json({ error: 'No topic' }, { status: 400 })

    const platformGuide: Record<string, string> = {
      twitter: 'X/Twitter — max 280 characters, punchy, no fluff',
      linkedin: 'LinkedIn — professional, 150-300 words, add a hook and CTA',
      instagram: 'Instagram — visual storytelling, include 5-10 relevant hashtags at the end',
      facebook: 'Facebook — conversational, 100-200 words, encourage engagement',
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Create 3 variations of a ${platform} post about: "${topic}"\n\nTone: ${tone}\nPlatform rules: ${platformGuide[platform] || platform}\n\nFormat: Number each post (1. 2. 3.) with a blank line between them. No extra commentary — just the posts.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result: text })
  } catch (error: any) {
    console.error('SOCIAL ERROR:', error?.message)
    return NextResponse.json({ error: 'Social generation failed' }, { status: 500 })
  }
}
