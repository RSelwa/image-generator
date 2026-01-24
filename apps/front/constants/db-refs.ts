import { db } from "@/constants/db"
import { type CollectionReference, collection, doc } from "@firebase/firestore"
import { TABLES } from "@repo/common"
import type { UserDoc } from "@repo/schemas"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
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
}

export const getUserRef = (uid: string | undefined) =>
  uid ? doc(TABLE_REFS[TABLES.USERS], uid) : doc(TABLE_REFS[TABLES.USERS])
