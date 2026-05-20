'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AddBrandForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase.from('brands').insert({ name: name.trim() })

    if (error) {
      setError(error.code === '23505' ? 'Esa marca ya existe' : 'Error al guardar')
      setLoading(false)
      return
    }

    setName('')
    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        placeholder="Ej: Alfa Romeo"
        className="input"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">Marca agregada</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Agregar marca'}
      </button>
    </form>
  )
}
