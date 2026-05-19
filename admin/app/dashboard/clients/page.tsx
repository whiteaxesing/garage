import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function ClientsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: clients } = await supabase
    .from('clients')
    .select('*, vehicles(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clientes</h1>
          <p className="text-[var(--muted)] text-sm">{clients?.length ?? 0} clientes registrados</p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>

      {!clients?.length ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <p className="text-lg mb-1">No hay clientes aún</p>
          <p className="text-sm">Creá el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Nombre</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Teléfono</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Correo</th>
                <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Vehículos</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr
                  key={client.id}
                  className={i < clients.length - 1 ? 'border-b border-[var(--border)]' : ''}
                >
                  <td className="px-6 py-4 text-sm text-white font-medium">{client.full_name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">{client.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">{client.email ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-[var(--muted)]">
                    {(client.vehicles as { count: number }[])?.[0]?.count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
