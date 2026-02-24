import { JobsClient } from "@google-cloud/run/build/src/v2/index.js"
import { SOCIALS_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const POST_PRODUCTION_JOB_NAME = process.env.POST_PRODUCTION_JOB_NAME || "video-post-production"
const CLOUD_RUN_REGION = process.env.CLOUD_RUN_REGION || "us-central1"
const CLOUD_RUN_PROJECT_ID = process.env.CLOUD_RUN_PROJECT_ID || ""

const jobsClient = new JobsClient()

export const handleInProgressCustomization = async (socialId: string, social: SocialDoc) => {
  const { urlSphericalVideoStorage } = social

  if (!urlSphericalVideoStorage) {
    logger.error(`Social doc ${socialId} is missing urlSphericalVideoStorage`)
    await refs[TABLES.SOCIALS].doc(socialId).update({
      status: SOCIALS_STATUS.ERROR,
      errorInfo: "Missing urlSphericalVideoStorage",
    })

    return
  }

  // Set status immediately to prevent re-trigger
  await refs[TABLES.SOCIALS].doc(socialId).update({
    status: SOCIALS_STATUS.IN_PROGRESS_CUSTOMIZATION,
  })

  try {
    const jobName = `projects/${CLOUD_RUN_PROJECT_ID}/locations/${CLOUD_RUN_REGION}/jobs/${POST_PRODUCTION_JOB_NAME}`

    logger.info(`Executing post-production Cloud Run Job: ${jobName} for social ${socialId}`)

    const [operation] = await jobsClient.runJob({
      name: jobName,
      overrides: {
        containerOverrides: [
          {
            env: [{ name: "SOCIAL_DOC_ID", value: socialId }],
          },
        ],
      },
    })

    logger.info(`Post-production Cloud Run Job started for social ${socialId}, operation: ${operation.name}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to trigger post-production for social ${socialId}: ${errorMessage}`)

    await refs[TABLES.SOCIALS].doc(socialId).update({
      status: SOCIALS_STATUS.ERROR,
      errorInfo: errorMessage,
    })
  }
}
