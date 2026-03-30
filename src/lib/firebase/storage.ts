'use client'

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/client'

export interface UploadProgress {
  percent: number
  status: 'uploading' | 'complete' | 'error'
  url?: string
  error?: string
}

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Ugyldig filformat. Bruk JPG, PNG eller WebP.')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Filen er for stor. Maks 5 MB per bilde.')
  }

  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        onProgress?.({ percent, status: 'uploading' })
      },
      (error) => {
        onProgress?.({ percent: 0, status: 'error', error: error.message })
        reject(error)
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        onProgress?.({ percent: 100, status: 'complete', url })
        resolve(url)
      }
    )
  })
}

export async function deleteImage(path: string): Promise<void> {
  const { deleteObject, ref: storageRefFn } = await import('firebase/storage')
  return deleteObject(storageRefFn(storage, path))
}
