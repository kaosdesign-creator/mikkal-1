import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'No query' }, { status: 400 })
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, search_depth: 'advanced', include_answer: true, max_results: 6 }),
    })
    if (!res.ok) throw new Error('Tavily error')
    return NextResponse.json(await res.json())
  } catch (error: any) {
    return NextResponse.json({ error: 'Research failed' }, { status: 500 })
  }
}
