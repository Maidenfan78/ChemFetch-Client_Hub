// src/lib/supabase.ts

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase'

export const supabaseBrowser = () =>
  createPagesBrowserClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

export const supabaseServer = () =>
  createServerComponentClient<Database>({
    cookies,
  })
