import { DOCUMENTS_STATUS, METADATA_DOCS, ROUND_TYPE, TABLES } from "@repo/common"
import { refs, subRefs } from "@repo/providers/db-refs"
import { db } from "@repo/providers/firebase"
import { buildReadyImageItem, type FlatDoc, type GameDoc, type MapDoc, type ReadyImageItem, readyImagesDocSchema, type SphericalDoc } from "@repo/schemas"
import { logger } from "firebase-functions"

const getMetadataRef = () => refs[TABLES.METADATA].doc(METADATA_DOCS.READY_IMAGES)

type ReadyImageKind = "sphericals" | "flats"

// A spherical and a flat share every field the pool needs.
type ReadyImageSource = SphericalDoc | FlatDoc

const isImageReady = (doc: ReadyImageSource | undefined): doc is ReadyImageSource =>
  doc?.status === DOCUMENTS_STATUS.READY && Boolean(doc.image)

// Recompute only when readiness flipped or a denormalized-relevant field changed.
const needsRefresh = (before: ReadyImageSource | undefined, after: ReadyImageSource | undefined) => {
  if (isImageReady(before) !== isImageReady(after)) return true

  return (
    before?.image !== after?.image ||
    before?.mapId !== after?.mapId ||
    before?.thumbnail !== after?.thumbnail ||
    before?.difficulty !== after?.difficulty ||
    before?.mapPosition?.x !== after?.mapPosition?.x ||
    before?.mapPosition?.y !== after?.mapPosition?.y
  )
}

// Build the enriched entry by fetching the related game + map once (at write time).
const buildEntry = async (
  type: (typeof ROUND_TYPE)[keyof typeof ROUND_TYPE],
  gameId: string,
  id: string,
  after: ReadyImageSource,
): Promise<ReadyImageItem | null> => {
  const [gameSnap, mapSnap] = await Promise.all([
    refs[TABLES.GAMES].doc(gameId).get(),
    after.mapId ? subRefs[TABLES.MAPS](gameId).doc(after.mapId).get() : Promise.resolve(null),
  ])

  return buildReadyImageItem({
    type,
    id,
    gameId,
    image: after.image,
    thumbnail: after.thumbnail,
    mapId: after.mapId,
    mapPosition: after.mapPosition,
    difficulty: after.difficulty,
    game: gameSnap.data(),
    map: mapSnap?.data(),
  })
}

// Upsert (or remove) one ready image in the pool, transactionally.
const syncReadyImage = async (
  kind: ReadyImageKind,
  type: (typeof ROUND_TYPE)[keyof typeof ROUND_TYPE],
  gameId: string,
  id: string,
  before: ReadyImageSource | undefined,
  after: ReadyImageSource | undefined,
) => {
  if (!needsRefresh(before, after)) return

  const entry = isImageReady(after) ? await buildEntry(type, gameId, id, after) : null

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(getMetadataRef())
    const data = readyImagesDocSchema.parse(snap.data() || {})

    const others = data[kind].filter((item) => item.id !== id)
    data[kind] = entry ? [...others, entry] : others

    tx.set(getMetadataRef(), data)
  })

  logger.info(`Synced readyImages metadata for ${kind} ${id} in game ${gameId} (${entry ? "ready" : "removed"})`)
}

export const updateReadySphericals = async (
  gameId: string,
  sphericalId: string,
  before: SphericalDoc | undefined,
  after: SphericalDoc | undefined,
) => syncReadyImage("sphericals", ROUND_TYPE.SPHERICAL, gameId, sphericalId, before, after)

export const updateReadyFlats = async (
  gameId: string,
  flatId: string,
  before: FlatDoc | undefined,
  after: FlatDoc | undefined,
) => syncReadyImage("flats", ROUND_TYPE.FLAT, gameId, flatId, before, after)

const arraysEqual = (a: string[] | null | undefined, b: string[] | null | undefined) => {
  const left = a || []
  const right = b || []

  return left.length === right.length && left.every((value, i) => value === right[i])
}

// Keep denormalized game fields fresh on the pool when a game is edited.
export const refreshReadyImagesForGame = async (
  gameId: string,
  before: GameDoc | undefined,
  after: GameDoc | undefined,
) => {
  if (!after) return

  const changed =
    before?.title !== after.title ||
    before?.image !== after.image ||
    !arraysEqual(before?.alternateNames, after.alternateNames)

  if (!changed) return

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(getMetadataRef())
    const data = readyImagesDocSchema.parse(snap.data() || {})

    const patch = (items: ReadyImageItem[]) =>
      items.map((item) =>
        item.gameId === gameId ? {
          ...item,
          gameTitle: after.title,
          gameAlternateNames: after.alternateNames || null,
          gameThumbnailUrl: after.image || null,
        } : item,
      )

    data.sphericals = patch(data.sphericals)
    data.flats = patch(data.flats)

    tx.set(getMetadataRef(), data)
  })

  logger.info(`Refreshed readyImages metadata for game ${gameId}`)
}

// Keep denormalized map fields fresh on the pool when a map is edited.
export const refreshReadyImagesForMap = async (
  mapId: string,
  before: MapDoc | undefined,
  after: MapDoc | undefined,
) => {
  if (!after) return

  const changed =
    before?.imageUrl !== after.imageUrl ||
    before?.width !== after.width ||
    before?.height !== after.height ||
    before?.maxDistancePoints !== after.maxDistancePoints

  if (!changed) return

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(getMetadataRef())
    const data = readyImagesDocSchema.parse(snap.data() || {})

    const patch = (items: ReadyImageItem[]) =>
      items.map((item) =>
        item.mapId === mapId ? {
          ...item,
          mapImage: after.imageUrl || null,
          mapWidth: after.width || null,
          mapHeight: after.height || null,
          maxDistancePoints: after.maxDistancePoints || null,
        } : item,
      )

    data.sphericals = patch(data.sphericals)
    data.flats = patch(data.flats)

    tx.set(getMetadataRef(), data)
  })

  logger.info(`Refreshed readyImages metadata for map ${mapId}`)
}
