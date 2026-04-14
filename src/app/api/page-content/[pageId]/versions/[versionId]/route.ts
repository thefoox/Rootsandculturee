import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ pageId: string; versionId: string }> }
) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const { pageId, versionId } = await params

  try {
    // Read the version document
    const versionDoc = await adminDb
      .collection('pageContent')
      .doc(pageId)
      .collection('versions')
      .doc(versionId)
      .get()

    if (!versionDoc.exists) {
      return NextResponse.json({ error: 'Versjonen ble ikke funnet.' }, { status: 404 })
    }

    const versionData = versionDoc.data()!

    // Write version data back to main document
    await adminDb.collection('pageContent').doc(pageId).set(
      {
        title: versionData.title,
        slug: versionData.slug,
        isPublished: versionData.isPublished,
        showInNavigation: versionData.showInNavigation,
        navigationOrder: versionData.navigationOrder,
        sections: versionData.sections,
        updatedAt: new Date(),
      },
      true // merge: preserve fields not in this update
    )

    // Invalidate caches
    revalidateTag('page-content', { expire: 0 })
    const slug = versionData.slug as string
    const publicPath = (slug === 'forside' || slug === '/') ? '/' : `/${slug}`
    revalidatePath(publicPath)

    // Return the restored data so the client can update state
    return NextResponse.json({
      success: true,
      data: {
        title: versionData.title,
        slug: versionData.slug,
        isPublished: versionData.isPublished,
        showInNavigation: versionData.showInNavigation,
        navigationOrder: versionData.navigationOrder,
        sections: versionData.sections,
      },
    })
  } catch (error) {
    console.error('Feil ved gjenoppretting av versjon:', error)
    return NextResponse.json({ error: 'Kunne ikke gjenopprette versjonen.' }, { status: 500 })
  }
}
