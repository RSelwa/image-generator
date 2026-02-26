import { AUDIO_EXTRACT_ENDPOINT, SOCIALS_STATUS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import z from "zod"

const responseSchema = z.object({
  soundId: z.string(),
})

export const handleJobStart = async (socialId: string, social: SocialDoc) => {
  try {
    const needAudioExtraction = Boolean(social.youtubeLink && (!social.audioLink || !social.soundId))

    if (needAudioExtraction) {
      await refs[TABLES.SOCIALS].doc(socialId).update({
        status: SOCIALS_STATUS.WAITING_AUDIO_EXTRACTION,
      })

      console.info(`Social ${socialId} has YouTube link but missing audio — setting status to WAITING_AUDIO_EXTRACTION`)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 90_000)
      const res = await fetch(AUDIO_EXTRACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeLink: social.youtubeLink,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Audio extraction failed with status ${res.status}: ${errorText}`)
      }

      const { soundId } = responseSchema.parse(await res.json())

      const soundDoc = await refs[TABLES.SOUNDS].doc(soundId).get()
      const soundData = soundDoc.data()

      if (!soundDoc.exists || !soundData) {
        throw new Error(`Sound doc with ID ${soundId} not found after audio extraction`)
      }

      if (!soundData.storagePath) {
        logger.warn(`Sound doc ${soundId} is not fully populated yet (missing storagePath). It may be a delay in the audio extraction process.`)

        throw new Error(`Sound doc ${soundId} is missing storagePath after audio extraction`)
      }

      await refs[TABLES.SOCIALS].doc(socialId).update({
        soundId: soundDoc.id,
        audioLink: soundData.storagePath,
        status: SOCIALS_STATUS.WAITING_CAPTURE,
      })
    }

    const needRetrieveSound = Boolean(social.soundId && !social.audioLink)

    if (needRetrieveSound) {
      logger.info(`Social ${socialId} has soundId but missing audioLink — retrieving sound info`)

      const soundDoc = await refs[TABLES.SOUNDS].doc(social.soundId!).get()
      const soundData = soundDoc.data()

      if (!soundDoc.exists || !soundData || !soundData.storagePath) {
        throw new Error(`Sound doc with ID ${social.soundId} not found or not storagePath while retrieving sound info`)
      }

      await refs[TABLES.SOCIALS].doc(socialId).update({
        audioLink: soundData.storagePath,
        soundId: soundDoc.id,
        youtubeLink: soundData.youtubeLink,
        status: SOCIALS_STATUS.WAITING_CAPTURE,
      })
    }

    if (!needAudioExtraction && !needRetrieveSound) {
      logger.info(`Social ${socialId} has all necessary info — setting status to WAITING_CAPTURE`)

      await refs[TABLES.SOCIALS].doc(socialId).update({
        status: SOCIALS_STATUS.WAITING_CAPTURE,
      })
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
