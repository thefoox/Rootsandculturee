import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { importPKCS8, SignJWT } from 'jose'
import sharp from 'sharp'
import path from 'path'

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB (raw upload limit — optimized before storage)
const MAX_DIMENSION = 2048 // Max width or height in pixels
const WEBP_QUALITY = 80

/**
 * Get a Google OAuth2 access token with storage scope.
 * Uses jose (Web Crypto) — no native OpenSSL required.
 */
async function getStorageAccessToken(): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY

  if (!clientEmail || !privateKeyRaw) {
    throw new Error('Firebase Storage: Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY')
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')
  const nowSec = Math.floor(Date.now() / 1000)
  const key = await importPKCS8(privateKey, 'RS256')

  const jwt = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSec,
    exp: nowSec + 3600,
  })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(key)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenRes.ok) {
    const body = await tokenRes.text()
    throw new Error(`Storage token exchange failed: ${body}`)
  }

  const data = await tokenRes.json()
  return data.access_token as string
}

export async function POST(request: Request) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Ikke autorisert.' }, { status: 401 })
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!bucketName) {
    return NextResponse.json(
      { error: 'Storage-bucket er ikke konfigurert.' },
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

  // Validate MIME type to prevent extension spoofing
  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  ]
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Ugyldig filtype.' },
      { status: 400 }
    )
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Filen er for stor (maks 10 MB).' },
      { status: 400 }
    )
  }

  try {
    const token = await getStorageAccessToken()
    const rawBuffer = Buffer.from(await file.arrayBuffer())

    // Optimize raster images with Sharp (skip SVG and GIF)
    const isRaster = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    let uploadBuffer: Buffer
    let uploadContentType: string
    let uploadExt: string

    if (isRaster) {
      uploadBuffer = await sharp(rawBuffer)
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
      uploadContentType = 'image/webp'
      uploadExt = '.webp'
    } else {
      // SVG and GIF pass through unchanged
      uploadBuffer = rawBuffer
      uploadContentType = file.type || 'application/octet-stream'
      uploadExt = ext
    }

    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `uploads/${Date.now()}-${baseName}${uploadExt}`
    const encodedFilename = encodeURIComponent(filename)

    // Upload via GCS JSON API with cloud-platform scope
    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o?uploadType=media&name=${encodedFilename}`

    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': uploadContentType,
      },
      body: new Uint8Array(uploadBuffer),
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      console.error('Storage upload failed:', uploadRes.status, err)
      return NextResponse.json(
        { error: 'Opplasting mislyktes. Prøv igjen.' },
        { status: 500 }
      )
    }

    // Use Firebase Storage download URL format (works without ACLs)
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFilename}?alt=media`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload feil:', error)
    return NextResponse.json(
      { error: 'Opplasting mislyktes. Prøv igjen.' },
      { status: 500 }
    )
  }
}
