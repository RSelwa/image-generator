import { TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type GamesListDoc, type LobbyDoc, type MapDoc, type RoundAnswerDoc, type SeedDoc, type SocialDoc, type SphericalDoc, type UserDoc } from "@repo/schemas"
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
  [TABLES.LOBBIES]: db.collection(TABLES.LOBBIES) as CollectionReference<
    LobbyDoc,
    LobbyDoc
  >,
  [TABLES.METADATA]: db.collection(TABLES.METADATA) as CollectionReference<
    GamesListDoc,
    GamesListDoc
  >,
  [TABLES.SOCIALS]: db.collection(TABLES.SOCIALS) as CollectionReference<
    SocialDoc,
    SocialDoc
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
  [TABLES.MAPS]: db.collectionGroup(TABLES.MAPS) as CollectionGroup<
    MapDoc,
    MapDoc
  >,
} as const

export const subRefs = {
  [TABLES.SPHERICAL]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.SPHERICAL}`,
    ) as CollectionReference<SphericalDoc, SphericalDoc>,
  [TABLES.FLAT]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.FLAT}`,
    ) as CollectionReference<FlatDoc, FlatDoc>,
  [TABLES.MAPS]: (id: string) =>
    db.collection(
      `${TABLES.GAMES}/${id}/${TABLES.MAPS}`,
    ) as CollectionReference<MapDoc, MapDoc>,
  [TABLES.ROUND_ANSWERS]: (id: string) =>
    db.collection(
      `${TABLES.LOBBIES}/${id}/${TABLES.ROUND_ANSWERS}`,
    ) as CollectionReference<RoundAnswerDoc, RoundAnswerDoc>,
} as const
