import { NextResponse } from 'next/server'
import { getNavigationPages } from '@/lib/data/page-content'

export async function GET() {
  const pages = await getNavigationPages()
  return NextResponse.json(pages)
}
