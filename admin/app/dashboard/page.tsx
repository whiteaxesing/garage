import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getStats(supabase: ReturnType<typeof createServerClient>) {
  const [{ count: clients }, { count: vehicles }, { count: services }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
  ])
  return { clients: clients ?? 0, vehicles: vehicles ?? 0, services: services ?? 0 }
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const stats = await getStats(supabase)

  const cards = [
    { label: 'Clientes', value: stats.clients, icon: '◎' },
    { label: 'Vehículos', value: stats.vehicles, icon: '◈' },
    { label: 'Servicios registrados', value: stats.services, icon: '◆' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Resumen</h1>
      <p className="text-[var(--muted)] text-sm mb-8">Todo lo que pasa en el taller</p>

      <div className="grid grid-cols-3 gap-4">
        {cards.map(card => (
          <div
            key={card.label}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--muted)] text-sm">{card.label}</span>
              <span className="text-[var(--accent)] text-xl">{card.icon}</span>
            </div>
            <p className="text-4xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
