import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const res = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    const data = await res.json()
    const imageBase64 = data.artifacts[0].base64
    return NextResponse.json({ image: imageBase64 })
  } catch (error: any) {
    console.error('IMAGE ERROR:', error?.message)
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }
}
