import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, size, imageBase64 } = body
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const dimensions: Record<string, { width: number; height: number }> = {
      square:    { width: 1024, height: 1024 },
      portrait:  { width: 768,  height: 1024 },
      landscape: { width: 1024, height: 768  },
    }
    const { width, height } = dimensions[size] || dimensions.square

    const input: Record<string, unknown> = {
      prompt,
      width,
      height,
      output_format: 'jpg',
      output_quality: 90,
    }

    if (imageBase64) {
      input.image = imageBase64
      input.prompt_strength = 0.8
    }

    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
        'Prefer': 'wait',
      },
      body: JSON.stringify({ input }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Replicate error')
    }

    const data = await res.json()
    return NextResponse.json({ imageUrl: data.output })
  } catch (error: any) {
    console.error('IMAGE ERROR:', error?.message)
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 })
  }
}
