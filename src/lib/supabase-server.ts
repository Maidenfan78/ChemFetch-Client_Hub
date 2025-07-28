// src/lib/supabase-server.ts
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// no 'async' here—call cookies() synchronously
export function supabaseServer() {
  // call cookies() synchronously; don't await it
  const cookieStore = cookies()

  // pass a synchronous function returning the cookie store
  return createServerComponentClient<Database>({
    // return the cookieStore directly; do not make this async
    cookies: () => cookieStore,
  })
}
