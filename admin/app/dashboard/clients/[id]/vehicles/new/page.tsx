'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const GARAGE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function NewVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ brand: '', model: '', year: '', plate: '' })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from('vehicles').insert({
      client_id: clientId,
      garage_id: GARAGE_ID,
      brand: form.brand,
      model: form.model,
      year: parseInt(form.year),
      plate: form.plate.toUpperCase(),
    })

    if (error) {
      setError('Error al guardar el vehículo')
      setLoading(false)
      return
    }

    router.push(`/dashboard/clients/${clientId}`)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Nuevo vehículo</h1>
        <p className="text-[var(--muted)] text-sm">Registrá el carro del cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Marca *</label>
            <input required type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className="input" placeholder="Toyota" />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Modelo *</label>
            <input required type="text" value={form.model} onChange={e => set('model', e.target.value)} className="input" placeholder="Corolla" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Año *</label>
            <input required type="number" min="1960" max="2030" value={form.year} onChange={e => set('year', e.target.value)} className="input" placeholder="2020" />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Placa *</label>
            <input required type="text" value={form.plate} onChange={e => set('plate', e.target.value)} className="input" placeholder="ABC123" />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg py-2.5 text-sm transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar vehículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
