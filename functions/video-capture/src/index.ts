import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { chromium, type Page } from "@playwright/test"

declare const window: {
  setCamera: (yaw: number, pitch: number) => void
  sceneReady: boolean
}

type CaptureConfig = {
  width: number
  height: number
  fps: number
  duration: number
  panRange: number
  pitchAmplitude: number
  captureUrl: string
  imageUrl: string | undefined
  outputPath: string
  projectId: string | undefined
  storageBucket: string | undefined
}

// Configuration
const CONFIG: CaptureConfig = {
  // Video settings
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 5, // seconds

  // Camera animation settings
  panRange: Math.PI / 2, // 90 degrees pan
  pitchAmplitude: 0.1, // Subtle vertical wave

  // URLs
  captureUrl: process.env.CAPTURE_URL || "https://www.geo-gamer.net/capture",
  imageUrl: process.env.IMAGE_URL,

  // Output
  outputPath: process.env.OUTPUT_PATH || "output.mp4",

  // Firebase (for Cloud Run Job)
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
}

const log = (message: string) => console.log(`[Capture] ${message}`)
const logError = (message: string) => console.error(`[Error] ${message}`)

/**
 * Spawns FFmpeg process and pipes frames to it
 */
const createFFmpegProcess = (outputPath: string, fps: number): ChildProcessWithoutNullStreams => {
  const args = [
    "-y", // Overwrite output file
    "-f",
    "image2pipe", // Input format: piped images
    "-framerate",
    String(fps),
    "-i",
    "-", // Read from stdin
    "-c:v",
    "libx264", // H.264 codec
    "-pix_fmt",
    "yuv420p", // Pixel format for compatibility
    "-preset",
    "fast", // Encoding speed
    outputPath,
  ]

  log(`Starting FFmpeg: ffmpeg ${args.join(" ")}`)

  const ffmpeg = spawn("ffmpeg", args)

  ffmpeg.stderr.on("data", (data: Buffer) => {
    // FFmpeg outputs progress to stderr
    process.stderr.write(data)
  })

  ffmpeg.on("error", (err: Error) => {
    logError(`FFmpeg error: ${err.message}`)
  })

  return ffmpeg
}

/**
 * Animates camera and captures frames
 */
const captureFrames = async (page: Page, config: CaptureConfig) => {
  const totalFrames = config.duration * config.fps

  log(`Capturing ${totalFrames} frames at ${config.fps} fps`)

  const ffmpeg = createFFmpegProcess(config.outputPath, config.fps)

  let framesCaptured = 0

  for (let i = 0; i < totalFrames; i++) {
    const progress = i / totalFrames

    // Calculate camera position
    // Slow horizontal pan
    const yaw = progress * config.panRange

    // Subtle vertical sine wave
    const pitch = Math.sin(progress * Math.PI * 2) * config.pitchAmplitude

    // Set camera position
    await page.evaluate(
      ({ yaw, pitch }) => window.setCamera(yaw, pitch),
      { yaw, pitch }
    )

    // Small delay to let Three.js render
    await page.waitForTimeout(16)

    // Capture screenshot
    const screenshot = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
      },
    })

    // Pipe to FFmpeg
    ffmpeg.stdin.write(screenshot)

    framesCaptured++

    if (framesCaptured % 30 === 0) {
      log(`Progress: ${framesCaptured}/${totalFrames} frames`)
    }
  }

  // Close FFmpeg stdin to signal end of input
  ffmpeg.stdin.end()

  // Wait for FFmpeg to finish
  await new Promise<void>((resolve, reject) => {
    ffmpeg.on("close", (code: number | null) => {
      if (code === 0) {
        log(`Video saved to ${config.outputPath}`)
        resolve()
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`))
      }
    })
  })
}

/**
 * Main capture function
 */
const capture = async (imageUrl: string, outputPath?: string) => {
  log("Starting video capture service...")

  if (!imageUrl) {
    throw new Error("IMAGE_URL is required")
  }

  const config = { ...CONFIG, imageUrl, outputPath: outputPath || CONFIG.outputPath }

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context = await browser.newContext({
    viewport: {
      width: config.width,
      height: config.height,
    },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  try {
    // Navigate to capture page
    const url = `${config.captureUrl}?image=${encodeURIComponent(config.imageUrl)}`
    log(`Navigating to ${url}`)

    await page.goto(url, { waitUntil: "load", timeout: 60000 })

    // Wait for scene to be ready
    log("Page loaded, waiting for viewer to initialize...")
    await page.waitForFunction(() => window.sceneReady === true, { timeout: 60000 })

    log("Scene ready! Starting capture...")

    // Capture frames
    await captureFrames(page, config)

    log("Capture complete!")

    return config.outputPath
  } catch (err) {
    logError(`Capture failed: ${(err as Error).message}`)
    throw err
  } finally {
    await browser.close()
  }
}

/**
 * Main entry point for Cloud Run Job
 */
const main = async () => {
  try {
    const imageUrl = process.env.IMAGE_URL
    const outputPath = process.env.OUTPUT_PATH

    if (!imageUrl) {
      logError("IMAGE_URL environment variable is required")
      process.exit(1)
    }

    log(`Starting job for image: ${imageUrl}`)

    const videoPath = await capture(imageUrl, outputPath)

    log(`Success! Video created at: ${videoPath}`)

    // TODO: Upload to Firebase Storage
    // TODO: Create Firestore document

    process.exit(0)
  } catch (err) {
    logError(`Job failed: ${(err as Error).stack}`)
    process.exit(1)
  }
}

// Run when executed directly
main()

export { capture }
