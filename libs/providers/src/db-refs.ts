import { TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type MapDoc, type SeedDoc, type SphericalDoc, type UserDoc } from "@repo/schemas"
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
  [TABLES.SEEDS]: db.collection(TABLES.SEEDS) as CollectionReference<
    SeedDoc,
    SeedDoc
  >,
}

export const collectionGroupRefs = {
  [TABLES.SPHERICAL]: db.collectionGroup(TABLES.SPHERICAL) as CollectionGroup<
    SphericalDoc,
    SphericalDoc
  >,
  [TABLES.FLAT]: db.collectionGroup(TABLES.FLAT) as CollectionGroup<
    FlatDoc,
    FlatDoc
  >,
} as const

export const subRefs = {
  [TABLES.SPHERICAL]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.SPHERICAL}`,
    ) as CollectionReference<SphericalDoc, SphericalDoc>,
  [TABLES.MAPS]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.MAPS}`,
    ) as CollectionReference<MapDoc, MapDoc>,
} as const
