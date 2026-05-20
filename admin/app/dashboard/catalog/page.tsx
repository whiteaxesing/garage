import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AddBrandForm from './AddBrandForm'
import AddModelForm from './AddModelForm'

export default async function CatalogPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, models(id, name, generations)')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Catálogo de vehículos</h1>
        <p className="text-[var(--muted)] text-sm">{brands?.length ?? 0} marcas · Agregá marcas o modelos que no estén en la lista</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Agregar marca</h2>
          <AddBrandForm />
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Agregar modelo</h2>
          <AddModelForm brands={brands ?? []} />
        </div>
      </div>

      <div className="space-y-3">
        {brands?.map(brand => (
          <details key={brand.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl group">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
              <span className="text-white font-medium">{brand.name}</span>
              <span className="text-[var(--muted)] text-sm">
                {(brand.models as { id: string; name: string }[])?.length ?? 0} modelos ›
              </span>
            </summary>
            <div className="px-6 pb-4 border-t border-[var(--border)]">
              <div className="flex flex-wrap gap-2 pt-3">
                {(brand.models as { id: string; name: string; generations: string[] }[])
                  ?.sort((a, b) => a.name.localeCompare(b.name))
                  .map(model => (
                    <span
                      key={model.id}
                      className="text-xs bg-white/5 text-[var(--muted)] px-3 py-1 rounded-full"
                    >
                      {model.name}
                    </span>
                  ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
