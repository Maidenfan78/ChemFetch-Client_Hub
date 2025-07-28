// src/components/sidebar.tsx

'use client'

import Link from 'next/link'
import { Home, FileText, LogOut } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 hidden md:flex flex-col border-r bg-muted p-4">
      <div className="text-xl font-bold mb-6">ChemFetch</div>
      <nav className="space-y-2">
        <Link href="/" className="flex items-center gap-2 hover:text-primary">
          <Home size={20} /> Dashboard
        </Link>
        <Link href="/sds" className="flex items-center gap-2 hover:text-primary">
          <FileText size={20} /> SDS Register
        </Link>
        <button className="flex items-center gap-2 hover:text-primary mt-4">
          <LogOut size={20} /> Logout
        </button>
      </nav>
    </aside>
  )
}
