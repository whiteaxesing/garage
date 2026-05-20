'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Brand = { id: string; name: string }

export default function AddModelForm({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const [brandId, setBrandId] = useState('')
  const [modelName, setModelName] = useState('')
  const [generationsText, setGenerationsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const generations = generationsText
      .split('\n')
      .map(g => g.trim())
      .filter(Boolean)

    const supabase = createClient()
    const { error } = await supabase.from('models').insert({
      brand_id: brandId,
      name: modelName.trim(),
      generations,
    })

    if (error) {
      setError(error.code === '23505' ? 'Ese modelo ya existe para esta marca' : 'Error al guardar')
      setLoading(false)
      return
    }

    setModelName('')
    setGenerationsText('')
    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        value={brandId}
        onChange={e => setBrandId(e.target.value)}
        required
        className="input"
      >
        <option value="">Seleccioná una marca</option>
        {brands.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>

      <input
        type="text"
        value={modelName}
        onChange={e => setModelName(e.target.value)}
        required
        placeholder="Nombre del modelo"
        className="input"
      />

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1.5">
          Generaciones (una por línea, opcional)
        </label>
        <textarea
          value={generationsText}
          onChange={e => setGenerationsText(e.target.value)}
          rows={3}
          placeholder={"2001-2005 (Gen 1)\n2006-2010 (Gen 2)"}
          className="input resize-none text-xs"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">Modelo agregado</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Agregar modelo'}
      </button>
    </form>
  )
}
