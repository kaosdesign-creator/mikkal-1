import { NextRequest, NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

fal.config({ credentials: process.env.FAL_API_KEY })

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = 'square', referenceImage, strength = 0.85 } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const dimensions: Record<string, { width: number; height: number }> = {
      square:    { width: 1024, height: 1024 },
      portrait:  { width: 768,  height: 1024 },
      landscape: { width: 1024, height: 768  },
    }
    const { width, height } = dimensions[size] || dimensions.square

    let result: unknown

    if (referenceImage) {
      result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
        input: {
          image_url:             referenceImage,
          prompt,
          strength,
          num_inference_steps:   28,
          guidance_scale:        3.5,
          num_images:            1,
          output_format:         'jpeg',
          enable_safety_checker: false,
        },
      })
    } else {
      result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
        input: {
          prompt,
          image_size:       { width, height },
          num_images:       1,
          safety_tolerance: '2',
          output_format:    'jpeg',
        },
      })
    }

    const imageUrl = (result as { images: { url: string }[] }).images?.[0]?.url
    if (!imageUrl) throw new Error('No image returned')

    return NextResponse.json({ url: imageUrl })
  } catch (error: unknown) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}