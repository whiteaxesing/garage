'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const GARAGE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    id_number: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.from('clients').insert({
      garage_id: GARAGE_ID,
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      id_number: form.id_number || null,
    })

    if (error) {
      setError('Error al guardar el cliente')
      setLoading(false)
      return
    }

    router.push('/dashboard/clients')
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Nuevo cliente</h1>
        <p className="text-[var(--muted)] text-sm">Completá los datos del cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre completo *" required>
          <input
            type="text"
            required
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Teléfono">
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Correo electrónico">
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Cédula / identificación">
          <input
            type="text"
            value={form.id_number}
            onChange={e => set('id_number', e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-[var(--border)] text-[var(--muted)] hover:text-white rounded-lg py-2.5 text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-[var(--muted)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
