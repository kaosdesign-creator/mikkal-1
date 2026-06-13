import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'standard', response_format: 'url' }),
    })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || 'DALL-E error') }
    const data = await res.json()
    return NextResponse.json({ imageUrl: data.data[0].url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 })
  }
}
