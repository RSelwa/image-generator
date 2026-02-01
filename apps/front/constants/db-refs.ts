import { TABLES } from "@repo/common"
import { type DocumentMapping, type Table } from "@repo/schemas"
import { collection, collectionGroup, type CollectionReference, doc } from "firebase/firestore"
import { db } from "@/constants/db"

export type CustomCollectionRef<T extends Table> = CollectionReference<
  DocumentMapping[T],
  DocumentMapping[T]
>

export const TABLE_REFS = {
  [TABLES.USERS]: collection(db, TABLES.USERS) as CustomCollectionRef<
    typeof TABLES.USERS
  >,
  [TABLES.RIGHTS]: collection(db, TABLES.RIGHTS) as CustomCollectionRef<
    typeof TABLES.RIGHTS
  >,
  [TABLES.GAMES]: collection(db, TABLES.GAMES) as CustomCollectionRef<
    typeof TABLES.GAMES
  >,
} as const

export const TABLES_GROUP_REFS = {
  [TABLES.SPHERICAL]: collectionGroup(db, TABLES.SPHERICAL) as CustomCollectionRef<
    typeof TABLES.SPHERICAL
  >,
  [TABLES.FLAT]: collectionGroup(db, TABLES.FLAT) as CustomCollectionRef<
    typeof TABLES.FLAT
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
  [TABLES.FLAT]: (gameId: string) =>
    collection(db, TABLES.GAMES, gameId, TABLES.FLAT) as CustomCollectionRef<
      typeof TABLES.FLAT
    >,
} as const

export const getUserRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.USERS], uid) : doc(TABLE_REFS[TABLES.USERS])

export const getRightRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.RIGHTS], uid) : doc(TABLE_REFS[TABLES.RIGHTS])

export const getGameRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.GAMES], uid) : doc(TABLE_REFS[TABLES.GAMES])

export const getSphericalRef = (gameId: string, sphericalId: string) =>
  doc(TABLES_SUB_REFS[TABLES.SPHERICAL](gameId), sphericalId)

export const getMapRef = (gameId: string, mapId: string) =>
  doc(TABLES_SUB_REFS[TABLES.MAPS](gameId), mapId)

export const getFlatRef = (gameId: string, flatId: string) =>
  doc(TABLES_SUB_REFS[TABLES.FLAT](gameId), flatId)
