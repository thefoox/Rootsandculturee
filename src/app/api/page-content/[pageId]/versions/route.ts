import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'

const VERSION_CAP = 20

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const { pageId } = await params

  try {
    const snapshot = await adminDb
      .collection('pageContent')
      .doc(pageId)
      .collection('versions')
      .orderBy('savedAt', 'desc')
      .limit(10)
      .get()

    const versions = snapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title as string,
      savedAt: doc.data().savedAt?.toDate?.() ?? doc.data().savedAt,
      savedBy: doc.data().savedBy as string,
      sectionCount: (doc.data().sections as unknown[])?.length ?? 0,
    }))

    return NextResponse.json(versions)
  } catch (error) {
    console.error('Feil ved henting av versjoner:', error)
    return NextResponse.json({ error: 'Kunne ikke hente versjoner.' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const { pageId } = await params
  const body = await request.json()

  try {
    // Create version document with timestamp-based ID
    const versionId = new Date().toISOString().replace(/[:.]/g, '-')
    const versionsRef = adminDb
      .collection('pageContent')
      .doc(pageId)
      .collection('versions')

    await versionsRef.doc(versionId).set({
      title: body.title,
      slug: body.slug,
      isPublished: body.isPublished,
      showInNavigation: body.showInNavigation,
      navigationOrder: body.navigationOrder,
      sections: body.sections,
      savedAt: new Date(),
      savedBy: session.email,
    })

    // Prune old versions beyond cap
    const allVersions = await versionsRef
      .orderBy('savedAt', 'desc')
      .get()

    if (allVersions.size > VERSION_CAP) {
      const toDelete = allVersions.docs.slice(VERSION_CAP)
      const batch = adminDb.batch()
      toDelete.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }

    return NextResponse.json({ success: true, versionId })
  } catch (error) {
    console.error('Feil ved opprettelse av versjon:', error)
    return NextResponse.json({ error: 'Kunne ikke opprette versjon.' }, { status: 500 })
  }
}
