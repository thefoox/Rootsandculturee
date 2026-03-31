import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { verifySession } from '@/lib/dal'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: Request) {
  // Auth check
  const session = await verifySession()
  if (!session) {
    return NextResponse.json(
      { error: 'Du må være innlogget for å laste opp filer' },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Ingen fil mottatt' }, { status: 400 })
  }

  // File extension check
  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Ugyldig filtype. Tillatte filtyper: ${ALLOWED_EXTENSIONS.join(', ')}` },
      { status: 400 }
    )
  }

  // File size check
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Filen er for stor. Maksimal filstørrelse er 5 MB' },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Save to public/uploads/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const filepath = path.join(uploadsDir, filename)
  await writeFile(filepath, buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
