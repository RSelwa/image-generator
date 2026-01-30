import { ENDPOINTS_BASE } from "@/constants/api"
import type { ConstantValues, STORAGE_PATHS } from "@repo/common"

type Props = {
  file: File
  bucketPath: ConstantValues<typeof STORAGE_PATHS>
  title: string
}

type UploadResult = {
  url: string
  width: number | null
  height: number | null
}

export const uploadFileToBucket = async ({
  file,
  bucketPath,
  title,
}: Props): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("gameName", title)
  formData.append("bucketPath", bucketPath)

  const response = await fetch(ENDPOINTS_BASE.UPLOAD_IMAGE, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  const { url, width, height } = await response.json()

  return { url, width, height }
}
