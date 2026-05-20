import { CAR_DATA } from '../admin/lib/cars'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://fnvlmxvdrndigqsucxep.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log(`Seeding ${CAR_DATA.length} brands...`)

  for (const entry of CAR_DATA) {
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .upsert({ name: entry.brand }, { onConflict: 'name' })
      .select('id')
      .single()

    if (brandError) {
      console.error(`Error inserting brand ${entry.brand}:`, brandError.message)
      continue
    }

    for (const model of entry.models) {
      const { error: modelError } = await supabase
        .from('models')
        .upsert(
          { brand_id: brand.id, name: model.model, generations: model.generations },
          { onConflict: 'brand_id,name' }
        )

      if (modelError) {
        console.error(`  Error inserting model ${model.model}:`, modelError.message)
      }
    }

    console.log(`  ✓ ${entry.brand} (${entry.models.length} models)`)
  }

  console.log('Done.')
}

seed()
