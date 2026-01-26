import { db } from "@/constants/db"
import { TABLES } from "@repo/common"
import type { GameDoc, SphericalDoc, UserDoc } from "@repo/schemas"
import { type CollectionReference, collection, doc } from "firebase/firestore"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
  [TABLES.GAMES]: GameDoc
  [TABLES.SPHERICAL]: SphericalDoc
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
}

export const getUserRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.USERS], uid) : doc(TABLE_REFS[TABLES.USERS])

export const getGameRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.GAMES], uid) : doc(TABLE_REFS[TABLES.GAMES])

export const getSphericalRef = (uid: string | undefined) =>
  uid
    ? doc(TABLE_REFS[TABLES.SPHERICAL], uid)
    : doc(TABLE_REFS[TABLES.SPHERICAL])
