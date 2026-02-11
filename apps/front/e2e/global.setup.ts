import { test as setup } from "@playwright/test"
import { generateGameData } from "@/utils/playwright"

setup("create new database", async () => {
  console.info("creating new database...")
  await generateGameData()
})
