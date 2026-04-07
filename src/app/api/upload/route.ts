import { NextResponse } from 'next/server'
import { getStorage } from 'firebase-admin/storage'
import { adminApp } from '@/lib/firebase/admin'
import { verifySession } from '@/lib/dal'
import path from 'path'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  // Auth check
  const session = await verifySession()
  if (!session) {
    return NextResponse.json(
      { error: 'Ikke autorisert.' },
      { status: 401 }
    )
  }

  if (!adminApp) {
    return NextResponse.json(
      { error: 'Server er ikke konfigurert.' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Ingen fil lastet opp.' }, { status: 400 })
  }

  // Validate extension
  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Filtype ikke tillatt. Tillatte filtyper: ${ALLOWED_EXTENSIONS.join(', ')}` },
      { status: 400 }
    )
  }

  // Validate size (5MB)
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Filen er for stor (maks 5 MB).' },
      { status: 400 }
    )
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!bucketName) {
    return NextResponse.json(
      { error: 'Storage-bucket er ikke konfigurert.' },
      { status: 500 }
    )
  }

  try {
    const bucket = getStorage(adminApp).bucket(bucketName)
    const filename = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const fileRef = bucket.file(filename)
    const buffer = Buffer.from(await file.arrayBuffer())

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    })
    await fileRef.makePublic()
    const url = fileRef.publicUrl()

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload feil:', error)
    return NextResponse.json(
      { error: 'Opplasting mislyktes. Prøv igjen.' },
      { status: 500 }
    )
  }
}
