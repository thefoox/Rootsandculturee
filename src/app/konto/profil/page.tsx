import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getUserProfile } from '@/lib/data/users'
import { ProfileForm } from '@/components/konto/ProfileForm'
import { PasswordChangeForm } from '@/components/konto/PasswordChangeForm'

export default async function ProfilPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/')
  }

  const profile = await getUserProfile(session.uid)

  return (
    <div>
      <h2 className="font-heading text-[20px] font-bold text-forest mb-6">
        Profilinnstillinger
      </h2>

      <div className="space-y-10">
        <ProfileForm
          profile={{
            uid: session.uid,
            email: session.email,
            displayName: profile?.displayName || '',
            address: profile?.address || '',
          }}
        />

        <hr className="border-forest/12" />

        <PasswordChangeForm />
      </div>
    </div>
  )
}
