import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { mockPageContent } from '@/lib/data/mock-data'
import type { PageContent } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params

  // Use mock data if Firebase not configured
  if (!adminDb) {
    const mock = mockPageContent.get(pageId)
    return NextResponse.json(mock || null)
  }

  const doc = await adminDb.collection('pageContent').doc(pageId).get()
  if (!doc.exists) {
    // Fall back to mock
    const mock = mockPageContent.get(pageId)
    return NextResponse.json(mock || null)
  }

  const data = doc.data()!
  const content: PageContent = {
    id: doc.id,
    title: data.title || '',
    sections: data.sections || [],
    updatedAt: data.updatedAt?.toDate() ?? new Date(),
  }
  return NextResponse.json(content)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params

  if (!adminDb) {
    // In dev without Firebase, just return success (mock mode)
    return NextResponse.json({ success: true, mock: true })
  }

  const body = await request.json()
  const { sections } = body

  await adminDb.collection('pageContent').doc(pageId).set(
    {
      title: mockPageContent.get(pageId)?.title || pageId,
      sections,
      updatedAt: new Date(),
    },
    { merge: true }
  )

  return NextResponse.json({ success: true })
}
