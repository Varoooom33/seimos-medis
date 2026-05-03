'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Navbar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between shrink-0">
      <Link href="/tree" className="font-semibold text-lg tracking-tight text-stone-900">
        Šeimos medis
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-stone-500">
          {user.user_metadata?.display_name || user.email}
        </span>
        <button
          onClick={signOut}
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          Atsijungti
        </button>
      </div>
    </nav>
  )
}
