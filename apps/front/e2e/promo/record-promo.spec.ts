import path from "node:path"
import { expect, test } from "@playwright/test"

const RECORDING_DURATION_MS = 8_000
const VIEWPORT = { width: 1080, height: 1920 }

// Pass the spherical image URL as env var, e.g.:
// SPHERICAL_URL="https://storage.googleapis.com/..." pnpm --filter @repo/front e2e -- --grep "record promo"
const SPHERICAL_URL = process.env.SPHERICAL_URL || ""

test.describe("Promo video recording", () => {
  test("record promo video from spherical image", async ({ browser }) => {
    test.skip(!SPHERICAL_URL, "SPHERICAL_URL env var is required")

    const outputDir = path.resolve("e2e/promo/recordings")

    const context = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: {
        dir: outputDir,
        size: VIEWPORT,
      },
    })

    const page = await context.newPage()

    const encodedUrl = encodeURIComponent(SPHERICAL_URL)
    await page.goto(`/promo/${encodedUrl}`)

    // Wait for the sphere viewer to be ready
    await expect(page.locator("[data-testid='promo-container'][data-ready='true']")).toBeVisible({
      timeout: 15_000,
    })

    // Let the auto-rotation record for the desired duration
    await page.waitForTimeout(RECORDING_DURATION_MS)

    // Close context to finalize the video file
    await context.close()

    // Log the video path
    const videoPath = await page.video()?.path()
    console.info(`Promo video saved to: ${videoPath}`)
  })
})
