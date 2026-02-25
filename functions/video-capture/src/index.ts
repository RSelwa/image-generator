import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { chromium, type Page } from "@playwright/test"
import { SOCIALS_STATUS, STORAGE_PATHS, TABLES } from "@repo/common"
import admin from "firebase-admin"

declare const window: {
  setCamera: (yaw: number, pitch: number) => void
  sceneReady: boolean
}

interface CaptureConfig {
  width: number
  height: number
  fps: number
  duration: number
  panRange: number
  pitchAmplitude: number
  captureUrl: string
  imageUrl: string | undefined
  outputPath: string
}

// Parse CLI args: --key=value format
const parseArgs = (args: string[]) => {
  const parsed: Record<string, string> = {}

  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.+)$/)

    if (match && match[1] && match[2]) {
      parsed[match[1]] = match[2]
    }
  }

  return parsed
}

const cliArgs = parseArgs(process.argv.slice(2))

// CLI args take priority over env vars
const getParam = (cliKey: string, envKey: string) => cliArgs[cliKey] || process.env[envKey]

// Configuration
const CONFIG: CaptureConfig = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 5,
  panRange: Math.PI / 2,
  pitchAmplitude: 0.1,
  captureUrl: getParam("capture-url", "CAPTURE_URL") || "https://www.geo-gamer.net/capture",
  imageUrl: getParam("image-url", "IMAGE_URL"),
  outputPath: getParam("output-path", "OUTPUT_PATH") || "output.mp4",
}

const PROJECT_ID = getParam("project-id", "FIREBASE_PROJECT_ID") || "tiktok-generator-fa261"

const log = (message: string) => console.info(`[Capture] ${message}`)
const logError = (message: string) => console.error(`[Error] ${message}`)

// Initialize Firebase Admin
const initFirebase = () => {
  if (admin.apps.length) return

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY

  if (credentialsPath) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(readFileSync(resolve(credentialsPath), "utf-8")),
      ),
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
    })
  } else if (serviceAccountKey) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
    })
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
    })
  }

  admin.firestore().settings({ ignoreUndefinedProperties: true, preferRest: true })
}

/**
 * Spawns FFmpeg process and pipes frames to it
 */
const createFFmpegProcess = (outputPath: string, fps: number): ChildProcessWithoutNullStreams => {
  const args = [
    "-y", // Overwrite output file
    "-f",
    "image2pipe", // Input format: piped images
    "-c:v",
    "mjpeg", // Input codec: JPEG
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

    const yaw = progress * config.panRange
    const pitch = Math.sin(progress * Math.PI * 2) * config.pitchAmplitude

    await page.evaluate(
      ({ yaw, pitch }) => window.setCamera(yaw, pitch),
      { yaw, pitch }
    )

    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 90,
      clip: {
        x: 0,
        y: 0,
        width: config.width,
        height: config.height,
      },
    })

    ffmpeg.stdin.write(screenshot)

    framesCaptured++

    if (framesCaptured % 30 === 0) {
      log(`Progress: ${framesCaptured}/${totalFrames} frames`)
    }
  }

  ffmpeg.stdin.end()

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
const capture = async (imageUrl: string, outputPath?: string, duration?: number) => {
  log("Starting video capture service...")

  if (!imageUrl) {
    throw new Error("IMAGE_URL is required")
  }

  const config = { ...CONFIG, imageUrl, outputPath: outputPath || CONFIG.outputPath, ...(duration && { duration }) }

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
    const url = `${config.captureUrl}?image=${encodeURIComponent(config.imageUrl)}`
    log(`Navigating to ${url}`)

    await page.goto(url, { waitUntil: "load", timeout: 60000 })

    log("Page loaded, waiting for viewer to initialize...")
    await page.waitForFunction(() => window.sceneReady === true, { timeout: 60000 })

    log("Scene ready! Starting capture...")

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
 * Upload video to Firebase Storage and update Firestore social doc
 */
const uploadAndUpdateDoc = async (videoPath: string, socialDocId: string) => {
  initFirebase()

  const storage = admin.storage()
  const db = admin.firestore()

  const storagePath = `${STORAGE_PATHS.SOCIALS}/${socialDocId}.mp4`

  log(`Uploading ${videoPath} to Storage at ${storagePath}`)

  const bucket = storage.bucket()
  await bucket.upload(videoPath, {
    destination: storagePath,
    metadata: { contentType: "video/mp4" },
  })

  const file = bucket.file(storagePath)
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-01-2030",
  })

  log(`Upload complete. Updating social doc ${socialDocId}`)

  await db.collection(TABLES.SOCIALS).doc(socialDocId).update({
    urlSphericalVideoStorage: url,
    status: SOCIALS_STATUS.IN_PROGRESS_CUSTOMIZATION,
  })

  log(`Social doc ${socialDocId} updated with video URL and status IN_PROGRESS_CUSTOMIZATION`)
}

/**
 * Main entry point for Cloud Run Job
 */
const main = async () => {
  try {
    const imageUrl = getParam("image-url", "IMAGE_URL")
    const outputPath = getParam("output-path", "OUTPUT_PATH")
    const socialDocId = getParam("social-doc-id", "SOCIAL_DOC_ID")

    if (!imageUrl) {
      logError("IMAGE_URL is required (--image-url=... or IMAGE_URL env var)")
      process.exit(1)
    }

    log(`Starting job for image: ${imageUrl}`)

    let duration: number | undefined

    if (socialDocId) {
      initFirebase()
      const socialDoc = await admin.firestore().collection(TABLES.SOCIALS).doc(socialDocId).get()
      const socialData = socialDoc.data()

      if (socialData?.duration) {
        duration = socialData.duration
        log(`Using duration from social doc: ${duration}s`)
      }
    }

    const videoPath = await capture(imageUrl, outputPath, duration)

    log(`Success! Video created at: ${videoPath}`)

    if (socialDocId) {
      await uploadAndUpdateDoc(videoPath, socialDocId)
    } else {
      log("No SOCIAL_DOC_ID provided — skipping upload and Firestore update")
    }

    process.exit(0)
  } catch (err) {
    const socialDocId = getParam("social-doc-id", "SOCIAL_DOC_ID")

    if (socialDocId) {
      try {
        initFirebase()
        const db = admin.firestore()
        await db.collection(TABLES.SOCIALS).doc(socialDocId).update({
          status: SOCIALS_STATUS.ERROR,
          errorInfo: (err as Error).message,
        })
      } catch (updateErr) {
        logError(`Failed to update social doc with error status: ${(updateErr as Error).message}`)
      }
    }

    logError(`Job failed: ${(err as Error).stack}`)
    process.exit(1)
  }
}

// Run when executed directly
main()

export { capture }
