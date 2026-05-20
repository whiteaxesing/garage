'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const GARAGE_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

type Model = { id: string; name: string; generations: string[] }
type Brand = { id: string; name: string; models: Model[] }

export default function NewVehicleForm({ brands }: { brands: Brand[] }) {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brandId, setBrandId] = useState('')
  const [modelId, setModelId] = useState('')
  const [generation, setGeneration] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [year, setYear] = useState('')
  const [plate, setPlate] = useState('')

  const isOtherBrand = brandId === '__other__'
  const isOtherModel = modelId === '__other__'

  const selectedBrand = brands.find(b => b.id === brandId)
  const models = selectedBrand?.models ?? []
  const selectedModel = models.find(m => m.id === modelId)
  const generations = selectedModel?.generations ?? []

  function handleBrandChange(val: string) {
    setBrandId(val)
    setModelId('')
    setGeneration('')
    setCustomBrand('')
    setCustomModel('')
  }

  function handleModelChange(val: string) {
    setModelId(val)
    setGeneration('')
    setCustomModel('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const finalBrand = isOtherBrand ? customBrand : (selectedBrand?.name ?? '')
    const finalModel = isOtherModel ? customModel : (selectedModel?.name ?? '')

    if (!finalBrand || !finalModel) {
      setError('Marca y modelo son obligatorios')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('vehicles').insert({
      client_id: clientId,
      garage_id: GARAGE_ID,
      brand: finalBrand,
      model: finalModel + (generation ? ` — ${generation}` : ''),
      year: parseInt(year),
      plate: plate.toUpperCase(),
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
        <p className="text-[var(--muted)] text-sm">
          Registrá el carro del cliente. Si no está en la lista,{' '}
          <a href="/dashboard/catalog" className="text-[var(--accent)] hover:underline">
            agregalo al catálogo
          </a>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1.5">Marca *</label>
          <select value={brandId} onChange={e => handleBrandChange(e.target.value)} required className="input">
            <option value="">Seleccioná una marca</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
            <option value="__other__">Otra (escribir)</option>
          </select>
        </div>

        {isOtherBrand && (
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Marca (escribir)</label>
            <input type="text" value={customBrand} onChange={e => setCustomBrand(e.target.value)} className="input" placeholder="Ej: Alfa Romeo" required />
          </div>
        )}

        {(brandId && !isOtherBrand) && (
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Modelo *</label>
            <select value={modelId} onChange={e => handleModelChange(e.target.value)} required className="input">
              <option value="">Seleccioná un modelo</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
              <option value="__other__">Otro (escribir)</option>
            </select>
          </div>
        )}

        {(isOtherBrand || isOtherModel) && (
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Modelo (escribir)</label>
            <input type="text" value={customModel} onChange={e => setCustomModel(e.target.value)} className="input" placeholder="Ej: Giulia QV" required />
          </div>
        )}

        {generations.length > 0 && (
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Generación</label>
            <select value={generation} onChange={e => setGeneration(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              {generations.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Año *</label>
            <input required type="number" min="1950" max="2030" value={year} onChange={e => setYear(e.target.value)} className="input" placeholder="2006" />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1.5">Placa *</label>
            <input required type="text" value={plate} onChange={e => setPlate(e.target.value)} className="input" placeholder="ABC123" />
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
