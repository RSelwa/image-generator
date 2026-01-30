import { TABLES } from "@repo/common"
import { type GameDoc, type MapDoc, type SphericalDoc, type UserDoc } from "@repo/schemas"
import { collection, type CollectionReference, doc } from "firebase/firestore"
import { db } from "@/constants/db"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
  [TABLES.GAMES]: GameDoc
  [TABLES.SPHERICAL]: SphericalDoc
  [TABLES.MAPS]: MapDoc
}

export type Table = keyof DocumentMapping

export type CustomCollectionRef<T extends Table> = CollectionReference<
  DocumentMapping[T],
  DocumentMapping[T]
>

export const TABLE_REFS = {
  [TABLES.USERS]: collection(db, TABLES.USERS) as CustomCollectionRef<
    typeof TABLES.USERS
  >,
  [TABLES.GAMES]: collection(db, TABLES.GAMES) as CustomCollectionRef<
    typeof TABLES.GAMES
  >,
  [TABLES.SPHERICAL]: collection(db, TABLES.SPHERICAL) as CustomCollectionRef<
    typeof TABLES.SPHERICAL
  >,
} as const

export const TABLES_SUB_REFS = {
  [TABLES.SPHERICAL]: (gameId: string) =>
    collection(
      db,
      TABLES.GAMES,
      gameId,
      TABLES.SPHERICAL,
    ) as CustomCollectionRef<typeof TABLES.SPHERICAL>,
  [TABLES.MAPS]: (gameId: string) =>
    collection(db, TABLES.GAMES, gameId, TABLES.MAPS) as CustomCollectionRef<
      typeof TABLES.MAPS
    >,
} as const

export function getUserRef(uid: string | undefined) {
  return uid ? doc(TABLE_REFS[TABLES.USERS], uid) : doc(TABLE_REFS[TABLES.USERS])
}

export function getGameRef(uid: string | undefined) {
  return uid ? doc(TABLE_REFS[TABLES.GAMES], uid) : doc(TABLE_REFS[TABLES.GAMES])
}

export function getSphericalRef(gameId: string, sphericalId: string) {
  return doc(TABLES_SUB_REFS[TABLES.SPHERICAL](gameId), sphericalId)
}

export function getMapRef(gameId: string, mapId: string) {
  return doc(TABLES_SUB_REFS[TABLES.MAPS](gameId), mapId)
}
