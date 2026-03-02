import { DEMO_SEED_ID, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const allSeeds = await refs[TABLES.SEEDS].get()

if (allSeeds.empty) {
  throw new Error("No seeds found")
}

await Promise.all(
  allSeeds.docs.map(async (seed) => {
    const seedData = seed.data()

    if (seed.id === DEMO_SEED_ID || seedData?.name || seedData?.featuredAt) return

    console.log(`Deleting seed ${seed.id}...`)
    await refs[TABLES.SEEDS].doc(seed.id).delete()
  })
)
