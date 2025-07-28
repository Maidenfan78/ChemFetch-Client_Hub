// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './src/types/supabase'

export async function middleware(req: NextRequest) {
  // 1) Create Supabase client bound to request/response
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient<Database>({ req, res })

  // 2) Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 3) Determine if this path is public
  const { pathname } = req.nextUrl
  const isPublicPath = 
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'

  // 4) If no session & not on a public page, redirect to /login
  if (!session && !isPublicPath) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return res
}

// Apply middleware to all routes except next.js internals & auth pages
export const config = {
  matcher: ['/((?!_next|api|login|register|favicon\\.ico).*)'],
}
