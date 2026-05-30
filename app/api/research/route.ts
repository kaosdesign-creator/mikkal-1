import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 })

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_images: false,
        max_results: 6,
      }),
    })

    if (!res.ok) throw new Error('Tavily error')
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('RESEARCH ERROR:', error?.message)
    return NextResponse.json({ error: 'Research failed' }, { status: 500 })
  }
}
