import { PLATFORMS, SOCIALS_STATUS, TABLES, UPLOAD_POST_PROFILES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { uploadPost } from "@repo/providers/upload-post"
import { type SocialDoc } from "@repo/schemas"
import { logger } from "firebase-functions"
import { HttpsError } from "firebase-functions/https"

export const handlePost = async (socialId: string, social: SocialDoc) => {
  if (!social.urlCustomizedVideoStorage) {
    throw new HttpsError("failed-precondition", `Social doc ${socialId} is missing urlCustomizedVideoStorage`)
  }

  const response = await uploadPost.upload(social.urlCustomizedVideoStorage, {
    user: UPLOAD_POST_PROFILES.GEO_GAMER,
    title: "Geo gamer is a game where you're dropped in a random location on multiples games maps and you have to find out where you are by exploring the surroundings and looking for clues. You can play with your friends now. Share, like, follow or comment if you want to see more!",
    // title: `New video post for social ${socialId}`,
    platforms: [PLATFORMS.INSTAGRAM, PLATFORMS.TIK_TOK],

    firstComment: "Check out our bio to play our game! 🔥🔥🔥",
  })

  logger.info(`Upload post response for social ${socialId}:`, response)

  if (!response) {
    throw new HttpsError("internal", `Failed to upload post for social ${socialId}, invalid response from UploadPost`)
  }

  const platforms = response?.data?.platforms || []

  const tiktokUrl = platforms.find((platform) => platform?.name === PLATFORMS.TIK_TOK)?.url || null
  const instagramUrl = platforms.find((platform) => platform?.name === PLATFORMS.INSTAGRAM)?.url || null

  await refs[TABLES.SOCIALS].doc(socialId).update({
    status: SOCIALS_STATUS.UPLOADED,
    urlInstagram: instagramUrl,
    urlTikTok: tiktokUrl,
  })
}
