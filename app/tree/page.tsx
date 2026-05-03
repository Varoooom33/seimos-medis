import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FamilyTreeClient from '@/components/FamilyTreeClient'
import Navbar from '@/components/Navbar'

export default async function TreePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: people }, { data: relationships }] = await Promise.all([
    supabase.from('people').select('*').order('birth_date', { ascending: true }),
    supabase.from('relationships').select('*'),
  ])

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} />
      <FamilyTreeClient
        initialPeople={people ?? []}
        initialRelationships={relationships ?? []}
      />
    </div>
  )
}
