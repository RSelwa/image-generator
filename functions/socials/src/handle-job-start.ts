import { JobsClient } from "@google-cloud/run/build/src/v2/index.js"
import { SOCIALS_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const CLOUD_RUN_JOB_NAME = process.env.CLOUD_RUN_JOB_NAME || "video-capture"
const CLOUD_RUN_REGION = process.env.CLOUD_RUN_REGION || "us-central1"
const CLOUD_RUN_PROJECT_ID = process.env.CLOUD_RUN_PROJECT_ID || ""

const jobsClient = new JobsClient()
export const handleJobStart = async (socialId: string, social: SocialDoc) => {
  try {
    const needAudioExtraction = Boolean(social.youtubeLink && (!social.audioLink || !social.soundId))

    if (needAudioExtraction) {
      console.info(`Social ${socialId} has YouTube link but missing audio — setting status to WAITING_AUDIO_EXTRACTION`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to trigger capture for social ${socialId}: ${errorMessage}`)

    await refs[TABLES.SOCIALS].doc(socialId).update({
      status: SOCIALS_STATUS.ERROR,
      errorInfo: errorMessage,
    })
  }
}
