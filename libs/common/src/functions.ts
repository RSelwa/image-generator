import { SOURCE_IMAGE } from "./constants"

export const chunk = <T>(array: T[], size = 500): T[][] =>
  [...Array<T>(Math.ceil(array.length / size))].map((_, i) =>
    array.slice(i * size, i * size + size),
  )

export const getSourceTypeFromS3Url = (S3Url: string) => {
  if (S3Url.includes("flim-upload-genai")) return SOURCE_IMAGE.UPLOAD

  if (
    S3Url.includes("image-editing-generation") ||
    S3Url.includes("image-mixing-generation") ||
    S3Url.includes("image-mixing-generation-us")
  )
    return SOURCE_IMAGE.GENERATION

  if (S3Url.includes("flim-1-0-2")) return SOURCE_IMAGE.FLIM

  return "OTHER" as const
}
