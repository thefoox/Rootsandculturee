import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin — Roots & Culture' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()
  if (!session || session.role !== 'admin') {
    redirect('/')
  }
  return <AdminShell>{children}</AdminShell>
}
