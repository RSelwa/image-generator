import { AVATARS_KEYS, type ConstantValues, type STORAGE_PATHS } from "@repo/common"
import { ENDPOINTS_BASE } from "@/constants/api"
import { auth } from "@/constants/db"
import { AVATARS_URLS } from "@/constants/images"

interface Props {
  file: File
  bucketPath: ConstantValues<typeof STORAGE_PATHS>
  title: string
}

interface UploadResult {
  url: string
  width: number | null
  height: number | null
}

export const uploadFileToBucket = async ({
  file,
  bucketPath,
  title,
}: Props): Promise<UploadResult> => {
  const token = await auth.currentUser?.getIdToken()
  const formData = new FormData()
  formData.append("file", file)
  formData.append("gameName", title)
  formData.append("bucketPath", bucketPath)

  const response = await fetch(ENDPOINTS_BASE.UPLOAD_IMAGE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  const { url, width, height } = await response.json()

  return { url, width, height }
}

export const getAvatarUrl = (avatarKey: ConstantValues<typeof AVATARS_KEYS>) => AVATARS_URLS[avatarKey]

export const getAvatarKeyFromUrl = (avatarUrl: string) => {
  const entry = Object.values(AVATARS_URLS).find((url) => url === avatarUrl)

  return entry ? (entry[0] as ConstantValues<typeof AVATARS_KEYS>) : AVATARS_KEYS.ASSASSIN
}

export const getVideoIdFromYoutubeLink = (link: string) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-]{11})/
  const match = link.match(regex)

  return match ? match[1] : ""
}
