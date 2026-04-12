import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import { pageContentCreateSchema } from '@/lib/validations'

export async function GET() {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  try {
    const snapshot = await adminDb.collection('pageContent').get()
    const pages = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: (data.title as string) || '',
          slug: (data.slug as string) || doc.id,
          isPublished: (data.isPublished as boolean) ?? true,
          showInNavigation: (data.showInNavigation as boolean) ?? false,
          navigationOrder: (data.navigationOrder as number) ?? 0,
          sections: (data.sections as unknown[]) || [],
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
        }
      })
    return NextResponse.json(pages)
  } catch (error) {
    console.error('Feil ved henting av sider:', error)
    return NextResponse.json({ error: 'Kunne ikke hente sider.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const body = await request.json()
  const result = pageContentCreateSchema.safeParse(body)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return NextResponse.json({ error: 'Valideringsfeil', errors }, { status: 400 })
  }
  const { title, slug } = result.data

  const pageId = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  try {
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
  } catch {
    return NextResponse.json({ error: 'Kunne ikke opprette siden.' }, { status: 500 })
  }
}
