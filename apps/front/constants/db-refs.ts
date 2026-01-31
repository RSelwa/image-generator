import { TABLES } from "@repo/common"
import { type GameDoc, type MapDoc, type SphericalDoc, type UserDoc } from "@repo/schemas"
import { collection, collectionGroup, type CollectionReference, doc } from "firebase/firestore"
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
} as const

export const TABLES_GROUP_REFS = {
  [TABLES.SPHERICAL]: collectionGroup(db, TABLES.SPHERICAL) as CustomCollectionRef<
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

export const getUserRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.USERS], uid) : doc(TABLE_REFS[TABLES.USERS])

export const getGameRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.GAMES], uid) : doc(TABLE_REFS[TABLES.GAMES])

export const getSphericalRef = (gameId: string, sphericalId: string) =>
  doc(TABLES_SUB_REFS[TABLES.SPHERICAL](gameId), sphericalId)

export const getMapRef = (gameId: string, mapId: string) =>
  doc(TABLES_SUB_REFS[TABLES.MAPS](gameId), mapId)
