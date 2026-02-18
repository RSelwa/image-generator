import { test as setup } from "@playwright/test"
import { createDemoSeedData, generateGameData } from "@/utils/playwright"

setup("create new database", async () => {
  console.info("creating new database...")
  const data = await generateGameData()

  await createDemoSeedData(data)
})
