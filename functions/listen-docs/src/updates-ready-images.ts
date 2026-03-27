import { DOCUMENTS_STATUS, METADATA_DOCS, TABLES } from "@repo/common"
import { refs } from "@repo/providers/db-refs"
import { type FlatDoc, type ReadyImagesDoc, type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const getMetadataRef = () => refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES)

const getReadyImagesDoc = async (): Promise<ReadyImagesDoc> => {
  const doc = await getMetadataRef().get()
  const data = doc.data() as ReadyImagesDoc | undefined

  return data || { sphericals: [], flats: [] }
}

export const updateReadySphericals = async (
  gameId: string,
  sphericalId: string,
  before: SphericalDoc | undefined,
  after: SphericalDoc | undefined,
) => {
  const wasReady = before?.status === DOCUMENTS_STATUS.READY && Boolean(before.image)
  const isReady = after?.status === DOCUMENTS_STATUS.READY && Boolean(after?.image)

  if (wasReady === isReady && before?.image === after?.image) return

  const readyImages = await getReadyImagesDoc()

  if (isReady && after) {
    const existing = readyImages.sphericals.find((s) => s.id === sphericalId)

    if (existing) {
      readyImages.sphericals = readyImages.sphericals.map((s) =>
        s.id === sphericalId ? { id: sphericalId, gameId, image: after.image } : s,
      )
    } else {
      readyImages.sphericals.push({ id: sphericalId, gameId, image: after.image })
    }
  } else {
    readyImages.sphericals = readyImages.sphericals.filter((s) => s.id !== sphericalId)
  }

  await getMetadataRef().set(readyImages)

  logger.info(`Updated readyImages metadata for spherical ${sphericalId} in game ${gameId}`)
}

export const updateReadyFlats = async (
  gameId: string,
  flatId: string,
  before: FlatDoc | undefined,
  after: FlatDoc | undefined,
) => {
  const wasReady = before?.status === DOCUMENTS_STATUS.READY && Boolean(before.image)
  const isReady = after?.status === DOCUMENTS_STATUS.READY && Boolean(after?.image)

  if (wasReady === isReady && before?.image === after?.image) return

  const readyImages = await getReadyImagesDoc()

  if (isReady && after) {
    const existing = readyImages.flats.find((f) => f.id === flatId)

    if (existing) {
      readyImages.flats = readyImages.flats.map((f) =>
        f.id === flatId ? { id: flatId, gameId, image: after.image } : f,
      )
    } else {
      readyImages.flats.push({ id: flatId, gameId, image: after.image })
    }
  } else {
    readyImages.flats = readyImages.flats.filter((f) => f.id !== flatId)
  }

  await getMetadataRef().set(readyImages)

  logger.info(`Updated readyImages metadata for flat ${flatId} in game ${gameId}`)
}
