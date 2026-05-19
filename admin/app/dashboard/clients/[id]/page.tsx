import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, services(id, service_type, performed_at, mileage, description, next_service_date)')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/clients" className="text-xs text-[var(--muted)] hover:text-white mb-2 inline-block">
            ← Clientes
          </Link>
          <h1 className="text-2xl font-bold text-white">{client.full_name}</h1>
          <div className="flex gap-4 mt-1">
            {client.phone && <span className="text-sm text-[var(--muted)]">{client.phone}</span>}
            {client.email && <span className="text-sm text-[var(--muted)]">{client.email}</span>}
            {client.id_number && <span className="text-sm text-[var(--muted)]">Cédula: {client.id_number}</span>}
          </div>
        </div>
        <Link
          href={`/dashboard/clients/${id}/vehicles/new`}
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Agregar vehículo
        </Link>
      </div>

      {!vehicles?.length ? (
        <div className="text-center py-20 text-[var(--muted)]">
          <p className="text-lg mb-1">Sin vehículos registrados</p>
          <p className="text-sm">Agregá el primero con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-white font-semibold">
                    {vehicle.year} {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-[var(--muted)]">Placa: {vehicle.plate}</p>
                </div>
                <Link
                  href={`/dashboard/clients/${id}/vehicles/${vehicle.id}/services/new`}
                  className="text-xs border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Registrar servicio
                </Link>
              </div>

              {vehicle.services?.length ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Servicio</th>
                      <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Fecha</th>
                      <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Kilometraje</th>
                      <th className="text-left text-xs text-[var(--muted)] font-medium px-6 py-3">Próximo servicio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicle.services.map((svc: {
                      id: string
                      service_type: string
                      performed_at: string
                      mileage: number | null
                      description: string | null
                      next_service_date: string | null
                    }, i: number) => (
                      <tr key={svc.id} className={i < vehicle.services.length - 1 ? 'border-b border-[var(--border)]' : ''}>
                        <td className="px-6 py-3 text-sm text-white">{serviceLabel(svc.service_type)}</td>
                        <td className="px-6 py-3 text-sm text-[var(--muted)]">
                          {new Date(svc.performed_at).toLocaleDateString('es-CR')}
                        </td>
                        <td className="px-6 py-3 text-sm text-[var(--muted)]">
                          {svc.mileage ? `${svc.mileage.toLocaleString()} km` : '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-[var(--muted)]">
                          {svc.next_service_date
                            ? new Date(svc.next_service_date).toLocaleDateString('es-CR')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-6 py-4 text-sm text-[var(--muted)]">Sin servicios registrados</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function serviceLabel(type: string): string {
  const labels: Record<string, string> = {
    oil_change: 'Cambio de aceite',
    filter_change: 'Cambio de filtro',
    brake_service: 'Frenos',
    tire_rotation: 'Rotación de llantas',
    general_inspection: 'Inspección general',
    other: 'Otro',
  }
  return labels[type] ?? type
}
