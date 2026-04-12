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

  try {
    const doc = await adminDb.collection('pageContent').doc(pageId).get()
    if (!doc.exists) {
      const mock = mockPageContent.get(pageId)
      return NextResponse.json(mock || null)
    }

    const data = doc.data()
    const content: PageContent = {
      id: doc.id,
      title: (data.title as string) || '',
      slug: (data.slug as string) || doc.id,
      isPublished: (data.isPublished as boolean) ?? true,
      showInNavigation: (data.showInNavigation as boolean) ?? false,
      navigationOrder: (data.navigationOrder as number) ?? 0,
      sections: (data.sections as PageContent['sections']) || [],
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    }
    return NextResponse.json(content)
  } catch {
    const mock = mockPageContent.get(pageId)
    return NextResponse.json(mock || null)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const { pageId } = await params
  const body = await request.json()

  const { title, slug, isPublished, showInNavigation, navigationOrder, sections } = body

  try {
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
      true // merge: DocRef.set() second arg is a boolean (see firestore-rest.ts)
    )

    revalidateTag('page-content', 'max')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kunne ikke oppdatere siden.' }, { status: 500 })
  }
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

  try {
    await adminDb.collection('pageContent').doc(pageId).delete()
    revalidateTag('page-content', 'max')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kunne ikke slette siden.' }, { status: 500 })
  }
}
