import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import NewVehicleForm from './NewVehicleForm'

export default async function NewVehiclePage() {
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

  return <NewVehicleForm brands={brands ?? []} />
}
