import { SOCIALS_STATUS, TABLES } from "@repo/common"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { onDocumentWritten } from "firebase-functions/firestore"
import { onSchedule } from "firebase-functions/scheduler"
import { handleInProgressCustomization } from "~/handle-in-progress-customization"
import { handleJobStart } from "~/handle-job-start"
import { handleWaitingCapture } from "~/handle-waiting-capture"
import { createScheduledSocial } from "~/schedule-social"

export const schedule_create_social = onSchedule("every day 10:00", async () => {
  await createScheduledSocial()
})

export const listen_social_written = onDocumentWritten(
  { document: `${TABLES.SOCIALS}/{socialId}`, timeoutSeconds: 120 },
  async (event) => {
    const socialId = event.params.socialId

    if (!socialId) {
      logger.error(`Social ID is undefined in document path: ${event.document}`)

      return
    }

    const before = event.data?.before.data() as SocialDoc | undefined
    const after = event.data?.after.data() as SocialDoc | undefined

    if (!after) {
      logger.info(`Social doc ${socialId} was deleted — skipping`)

      return
    }

    const statusChanged = before?.status !== after.status

    if (!statusChanged) {
      logger.info(`Social doc ${socialId} status unchanged (${after.status}) — skipping`)

      return
    }

    if (after.status === SOCIALS_STATUS.WAITING_JOB_START)
      await handleJobStart(socialId, after)

    if (after.status === SOCIALS_STATUS.WAITING_CAPTURE)
      await handleWaitingCapture(socialId, after)

    if (after.status === SOCIALS_STATUS.WAITING_CUSTOMIZATION)
      await handleInProgressCustomization(socialId, after)
  },
)
