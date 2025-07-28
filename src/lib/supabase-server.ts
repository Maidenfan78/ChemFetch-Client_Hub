// src/lib/supabase-server.ts

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export function supabaseServer() {
  return createServerComponentClient<Database>({
    // pass the Next.js cookies() function directly
    // runtime expects cookies() to return the CookieStore synchronously
    // we suppress the TS error here since the helper types are out of sync
    // with next/headers
    // @ts-ignore
    cookies,
  })
}
