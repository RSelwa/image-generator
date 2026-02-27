import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const handleFirstCommentTiktok = async (socialId: string, social: SocialDoc) => {
  try {
    logger.info(`Posting first comment for Tiktok social ${socialId} on video ${social.urlTikTok}`)
  } catch (error) {
    logger.error(`Failed to post first comment for TikTok social ${socialId}:`, error)
  }
}

const handleFirstCommentInstagram = async (socialId: string, social: SocialDoc) => {
  try {
    logger.info(`Posting first comment for Instagram social ${socialId} on video ${social.urlInstagram}`)
  } catch (error) {
    logger.error(`Failed to post first comment for Instagram social ${socialId}:`, error)
  }
}

export const handleFirstComment = async (socialId: string, social: SocialDoc) => {
  const promises = []

  if (social.urlInstagram)
    promises.push(handleFirstCommentInstagram(socialId, social))

  if (social.urlTikTok)
    promises.push(handleFirstCommentTiktok(socialId, social))

  await Promise.all(promises)
}
