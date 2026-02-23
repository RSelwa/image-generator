import { JobsClient } from "@google-cloud/run/build/src/v2"
import { SOCIALS_STATUS, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const CLOUD_RUN_JOB_NAME = process.env.CLOUD_RUN_JOB_NAME || "video-capture"
const CLOUD_RUN_REGION = process.env.CLOUD_RUN_REGION || "us-central1"
const CLOUD_RUN_PROJECT_ID = process.env.CLOUD_RUN_PROJECT_ID || ""

const jobsClient = new JobsClient()

export const handleWaitingCapture = async (socialId: string, social: SocialDoc) => {
  const { gameId, sphericalId } = social

  if (!gameId || !sphericalId) {
    logger.error(`Social doc ${socialId} is missing gameId or sphericalId`)
    await refs[TABLES.SOCIALS].doc(socialId).update({
      status: SOCIALS_STATUS.ERROR,
      errorInfo: "Missing gameId or sphericalId",
    })

    return
  }

  // Set status immediately to prevent re-trigger
  await refs[TABLES.SOCIALS].doc(socialId).update({
    status: SOCIALS_STATUS.IN_PROGRESS_SPHERE,
  })

  try {
    // Fetch spherical doc to get image URL
    const sphericalDoc = await subRefs[TABLES.SPHERICAL](gameId).doc(sphericalId).get()
    const sphericalData = sphericalDoc.data()

    if (!sphericalData?.image) {
      throw new Error(`Spherical ${sphericalId} in game ${gameId} has no image URL`)
    }

    const jobName = `projects/${CLOUD_RUN_PROJECT_ID}/locations/${CLOUD_RUN_REGION}/jobs/${CLOUD_RUN_JOB_NAME}`

    logger.info(`Executing Cloud Run Job: ${jobName} for social ${socialId}`)

    const [operation] = await jobsClient.runJob({
      name: jobName,
      overrides: {
        containerOverrides: [
          {
            env: [
              { name: "IMAGE_URL", value: sphericalData.image },
              { name: "SOCIAL_DOC_ID", value: socialId },
            ],
          },
        ],
      },
    })

    logger.info(`Cloud Run Job execution started for social ${socialId}, operation: ${operation.name}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to trigger capture for social ${socialId}: ${errorMessage}`)

    await refs[TABLES.SOCIALS].doc(socialId).update({
      status: SOCIALS_STATUS.ERROR,
      errorInfo: errorMessage,
    })
  }
}
