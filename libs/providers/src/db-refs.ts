import { TABLES } from "@repo/common"
import { type GameDoc, type MapDoc, type SphericalDoc, type UserDoc } from "@repo/schemas"
import {
  type CollectionGroup,
  type CollectionReference,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore"
import { db } from "~/firebase"

type WithId<T> = T & { id: string }

export type CustomJson = Record<string, unknown>

function toFirestoreConverter<T = unknown>({ id: _, ...item }: WithId<T>) {
  return item
}

export function createFirestoreConverter<T = unknown>() {
  return {
    toFirestore: toFirestoreConverter<T>,
    fromFirestore: (snapshot: QueryDocumentSnapshot<T>): WithId<T> => {
      const data = snapshot.data()

      return { ...data, id: snapshot.id }
    },
  }
}

export const refs = {
  [TABLES.USERS]: db.collection(TABLES.USERS) as CollectionReference<
    UserDoc,
    UserDoc
  >,
  [TABLES.GAMES]: db.collection(TABLES.GAMES) as CollectionReference<
    GameDoc,
    GameDoc
  >,
  [TABLES.MAPS]: db.collection(TABLES.MAPS) as CollectionReference<
    MapDoc,
    MapDoc
  >,
}

export const collectionGroupRefs = {
  [TABLES.SPHERICAL]: db.collectionGroup(TABLES.SPHERICAL) as CollectionGroup<
    SphericalDoc,
    SphericalDoc
  >,
} as const

export const subRefs = {
  [TABLES.SPHERICAL]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.SPHERICAL}`,
    ) as CollectionReference<SphericalDoc, SphericalDoc>,
  [TABLES.MAPS]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.SPHERICAL}`,
    ) as CollectionReference<MapDoc, MapDoc>,
} as const
