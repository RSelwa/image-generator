import { METADATA_DOCS, TABLES } from "@repo/common"
import { type DocumentMapping, type GamesListDoc, type Table } from "@repo/schemas"
import { type CollectionReference, type DocumentReference } from "firebase/firestore"
import { collection, collectionGroup, doc } from "firebase/firestore"
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
  [TABLES.LOBBIES]: collection(db, TABLES.LOBBIES) as CustomCollectionRef<
    typeof TABLES.LOBBIES
  >,
  [TABLES.SEEDS]: collection(db, TABLES.SEEDS) as CustomCollectionRef<
    typeof TABLES.SEEDS
  >,
  [TABLES.SUGGESTIONS]: collection(db, TABLES.SUGGESTIONS) as CustomCollectionRef<
    typeof TABLES.SUGGESTIONS
  >,
  [TABLES.METADATA]: collection(db, TABLES.METADATA) as CustomCollectionRef<
    typeof TABLES.METADATA
  >,
  [TABLES.SOCIALS]: collection(db, TABLES.SOCIALS) as CustomCollectionRef<
    typeof TABLES.SOCIALS
  >,
  [TABLES.SOUNDS]: collection(db, TABLES.SOUNDS) as CustomCollectionRef<
    typeof TABLES.SOUNDS
  >,
} as const

export const TABLES_GROUP_REFS = {
  [TABLES.SPHERICAL]: collectionGroup(db, TABLES.SPHERICAL) as CustomCollectionRef<
    typeof TABLES.SPHERICAL
  >,
  [TABLES.FLAT]: collectionGroup(db, TABLES.FLAT) as CustomCollectionRef<
    typeof TABLES.FLAT
  >,
  [TABLES.MAPS]: collectionGroup(db, TABLES.MAPS) as CustomCollectionRef<
    typeof TABLES.MAPS
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
  [TABLES.ROUND_ANSWERS]: (lobbyId: string) =>
    collection(db, TABLES.LOBBIES, lobbyId, TABLES.ROUND_ANSWERS) as CustomCollectionRef<
      typeof TABLES.ROUND_ANSWERS
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

export const getLobbyRef = (lobbyId: string | undefined) =>
  lobbyId ? doc(TABLE_REFS[TABLES.LOBBIES], lobbyId) : doc(TABLE_REFS[TABLES.LOBBIES])

export const getSeedRef = (seedId: string | undefined) =>
  seedId ? doc(TABLE_REFS[TABLES.SEEDS], seedId) : doc(TABLE_REFS[TABLES.SEEDS])

export const getSuggestionRef = (suggestionId: string | undefined) =>
  suggestionId ? doc(TABLE_REFS[TABLES.SUGGESTIONS], suggestionId) : doc(TABLE_REFS[TABLES.SUGGESTIONS])

export const getSocialRef = (socialId: string | undefined) =>
  socialId ? doc(TABLE_REFS[TABLES.SOCIALS], socialId) : doc(TABLE_REFS[TABLES.SOCIALS])

export const getSoundRef = (socialId: string | undefined) =>
  socialId ? doc(TABLE_REFS[TABLES.SOUNDS], socialId) : doc(TABLE_REFS[TABLES.SOUNDS])

export const getRoundAnswerRef = (lobbyId: string, roundAnswerId: string) =>
  doc(TABLES_SUB_REFS[TABLES.ROUND_ANSWERS](lobbyId), roundAnswerId)

export const getGamesListRef = () =>
  doc(TABLE_REFS[TABLES.METADATA], METADATA_DOCS.GAMES_LIST)

export const getMetadataGameListRef = (): DocumentReference<GamesListDoc, GamesListDoc> =>
  doc(TABLE_REFS[TABLES.METADATA], METADATA_DOCS.GAMES_LIST)
