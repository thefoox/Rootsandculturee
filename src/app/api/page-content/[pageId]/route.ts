import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import { mockPageContent } from '@/lib/data/mock-data'
import type { PageContent } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params

  if (!adminDb) {
    const mock = mockPageContent.get(pageId)
    return NextResponse.json(mock || null)
  }

  const doc = await adminDb.collection('pageContent').doc(pageId).get()
  if (!doc.exists) {
    const mock = mockPageContent.get(pageId)
    return NextResponse.json(mock || null)
  }

  const data = doc.data()!
  const content: PageContent = {
    id: doc.id,
    title: data.title || '',
    slug: data.slug || doc.id,
    isPublished: data.isPublished ?? true,
    showInNavigation: data.showInNavigation ?? false,
    navigationOrder: data.navigationOrder ?? 0,
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
  const body = await request.json()

  if (!adminDb) {
    revalidateTag('page-content', 'max')
    return NextResponse.json({ success: true, mock: true })
  }

  const { title, slug, isPublished, showInNavigation, navigationOrder, sections } = body

  await adminDb.collection('pageContent').doc(pageId).set(
    {
      title,
      slug,
      isPublished,
      showInNavigation,
      navigationOrder,
      sections,
      updatedAt: new Date(),
    },
    { merge: true }
  )

  revalidateTag('page-content', 'max')
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const { pageId } = await params

  if (!adminDb) {
    revalidateTag('page-content', 'max')
    return NextResponse.json({ success: true, mock: true })
  }

  await adminDb.collection('pageContent').doc(pageId).delete()
  revalidateTag('page-content', 'max')
  return NextResponse.json({ success: true })
}
