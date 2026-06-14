const fs = require('fs')
const path = require('path')

const filePath = path.join('C:\\Users\\bthey\\downloads\\mikkal-v1\\mikkal\\app\\api\\images\\route.ts')

const content = `import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 })

    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.REPLICATE_API_KEY}\`,
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          width: 1024,
          height: 1024,
          output_format: 'jpg',
          output_quality: 90,
        }
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || 'Replicate error')
    }

    const data = await res.json()
    const imageUrl = data.output
    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('IMAGE ERROR:', error?.message)
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 })
  }
}
`

fs.writeFileSync(filePath, content, 'utf8')
console.log('Done! images/route.ts switched to Flux via Replicate.')