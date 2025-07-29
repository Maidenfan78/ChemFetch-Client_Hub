// src/app/page.tsx
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase-server'

export default async function DashboardPage() {
  // 1. Check session on the server
  const supabase = await supabaseServer()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 2. If no session, redirect to /login
  if (!session) {
    redirect('/login')
  }

  // 3. (Optional) Fetch any dashboard data here
  // const { data: items } = await supabase.from('user_chemical_watch_list').select('*')

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Welcome, {session.user.email}</h2>
      <p>Your chemical watch list goes here.</p>
    </div>
  )
}
