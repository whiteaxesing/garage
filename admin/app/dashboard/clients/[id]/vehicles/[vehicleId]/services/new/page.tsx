'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const GARAGE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const SERVICE_TYPES = [
  { value: 'oil_change', label: 'Cambio de aceite' },
  { value: 'filter_change', label: 'Cambio de filtro' },
  { value: 'brake_service', label: 'Frenos' },
  { value: 'tire_rotation', label: 'Rotación de llantas' },
  { value: 'general_inspection', label: 'Inspección general' },
  { value: 'other', label: 'Otro' },
]

export default function NewServicePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  const vehicleId = params.vehicleId as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    service_type: 'oil_change',
    description: '',
    mileage: '',
    performed_at: new Date().toISOString().split('T')[0],
    next_service_date: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from('services').insert({
      vehicle_id: vehicleId,
      garage_id: GARAGE_ID,
      service_type: form.service_type,
      description: form.description || null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      performed_at: form.performed_at,
      next_service_date: form.next_service_date || null,
    })

    if (error) {
      setError('Error al registrar el servicio')
      setLoading(false)
      return
    }

    router.push(`/dashboard/clients/${clientId}`)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Registrar servicio</h1>
        <p className="text-[var(--muted)] text-sm">Completá los detalles del servicio realizado</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1.5">Tipo de servicio *</label>
          <select
            value={form.service_type}
            onChange={e => set('service_type', e.target.value)}
            className="input"
          >
            {SERVICE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Fecha del servicio *</label>
            <input
              required
              type="date"
              value={form.performed_at}
              onChange={e => set('performed_at', e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Kilometraje</label>
            <input
              type="number"
              value={form.mileage}
              onChange={e => set('mileage', e.target.value)}
              className="input"
              placeholder="85000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1.5">Próximo servicio</label>
          <input
            type="date"
            value={form.next_service_date}
            onChange={e => set('next_service_date', e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--muted)] mb-1.5">Notas adicionales</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            className="input resize-none"
            placeholder="Detalles del servicio..."
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg py-2.5 text-sm transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Registrar servicio'}
          </button>
        </div>
      </form>
    </div>
  )
}
