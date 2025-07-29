// src/lib/supabase-server.ts
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// cookies() became async in Next.js 15. Await the call and expose an async helper.
export function supabaseServer() {
  const cookieStore = cookies()

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}
