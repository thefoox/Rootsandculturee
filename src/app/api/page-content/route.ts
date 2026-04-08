import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { mockPageContent } from '@/lib/data/mock-data'
import { verifySession } from '@/lib/dal'

export async function GET() {
  if (!adminDb) {
    const pages = Array.from(mockPageContent.values()).filter((p) => p.isPublished !== false)
    return NextResponse.json(pages)
  }

  const snapshot = await adminDb.collection('pageContent').get()
  const pages = snapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || doc.id,
        isPublished: data.isPublished ?? true,
        showInNavigation: data.showInNavigation ?? false,
        navigationOrder: data.navigationOrder ?? 0,
        sections: data.sections || [],
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      }
    })
    .filter((page) => page.isPublished !== false)
  return NextResponse.json(pages)
}

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const body = await request.json()
  const { title, slug } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'Tittel og slug er påkrevd' }, { status: 400 })
  }

  const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  if (!adminDb) {
    return NextResponse.json({ success: true, mock: true, id: pageId })
  }

  const existing = await adminDb.collection('pageContent').doc(pageId).get()
  if (existing.exists) {
    return NextResponse.json({ error: 'En side med denne ID-en finnes allerede' }, { status: 409 })
  }

  await adminDb.collection('pageContent').doc(pageId).set({
    title,
    slug,
    isPublished: false,
    showInNavigation: false,
    navigationOrder: 0,
    sections: [],
    updatedAt: new Date(),
  })

  return NextResponse.json({ success: true, id: pageId })
}
