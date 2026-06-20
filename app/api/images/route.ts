import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { prompt, size = '1:1', style = 'photographic' } = await req.json()
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

    const [width, height] = sizeToPixels(size)

    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: buildPrompt(prompt, style),
        image_size: { width, height },
        num_images: 1,
        safety_tolerance: '2',
        output_format: 'jpeg',
      },
    }) as unknown as { images: { url: string }[] }

    const imageUrl = result.images?.[0]?.url
    if (!imageUrl) throw new Error('No image returned')

    return NextResponse.json({ url: imageUrl, prompt, size, style })
  } catch (error: unknown) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function sizeToPixels(size: string): [number, number] {
  const map: Record<string, [number, number]> = {
    '1:1':  [1024, 1024],
    '16:9': [1344, 768],
    '9:16': [768, 1344],
    '4:3':  [1152, 896],
    '3:4':  [896, 1152],
  }
  return map[size] ?? [1024, 1024]
}

function buildPrompt(prompt: string, style: string): string {
  const suffixes: Record<string, string> = {
    photographic: 'photorealistic, high quality photograph, detailed',
    artistic:     'artistic, painterly, creative illustration',
    cinematic:    'cinematic lighting, movie still, dramatic atmosphere',
    anime:        'anime style, detailed illustration',
    'no-style':   '',
  }
  const suffix = suffixes[style] ?? ''
  return suffix ? `${prompt}, ${suffix}` : prompt
}
