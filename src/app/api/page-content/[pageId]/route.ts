import { NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import { pageContentUpdateSchema } from '@/lib/validations'
import type { PageContent } from '@/types'

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
    const doc = await adminDb.collection('pageContent').doc(pageId).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Siden ble ikke funnet.' }, { status: 404 })
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
  } catch (error) {
    console.error('Feil ved henting av side:', error)
    return NextResponse.json({ error: 'Kunne ikke hente siden.' }, { status: 500 })
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
  const result = pageContentUpdateSchema.safeParse(body)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return NextResponse.json({ error: 'Valideringsfeil', errors }, { status: 400 })
  }
  const { title, slug, isPublished, showInNavigation, navigationOrder, sections } = result.data

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

    // Invalidate data cache (hard expire) + page CDN cache
    revalidateTag('page-content', { expire: 0 })
    const publicPath = (slug === 'forside' || slug === '/') ? '/' : `/${slug}`
    revalidatePath(publicPath)
    if (publicPath !== '/') revalidatePath('/')

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
    // Read slug before deleting so we can purge the public page cache
    const doc = await adminDb.collection('pageContent').doc(pageId).get()
    const slug = doc.exists ? (doc.data().slug as string) || pageId : pageId

    await adminDb.collection('pageContent').doc(pageId).delete()

    revalidateTag('page-content', { expire: 0 })
    const publicPath = (slug === 'forside' || slug === '/') ? '/' : `/${slug}`
    revalidatePath(publicPath)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kunne ikke slette siden.' }, { status: 500 })
  }
}
