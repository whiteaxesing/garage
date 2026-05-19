'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const links = [
  { href: '/dashboard', label: 'Inicio', icon: '▣' },
  { href: '/dashboard/clients', label: 'Clientes', icon: '◎' },
  { href: '/dashboard/vehicles', label: 'Vehículos', icon: '◈' },
  { href: '/dashboard/services', label: 'Servicios', icon: '◆' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-60 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] shrink-0">
      <div className="px-6 py-6 border-b border-[var(--border)]">
        <span className="text-white font-bold text-lg tracking-tight">Garage CR</span>
        <p className="text-[var(--muted)] text-xs mt-0.5">Panel de administración</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[var(--accent)] text-white font-medium'
                  : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>⎋</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
