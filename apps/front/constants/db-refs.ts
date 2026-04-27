import { METADATA_DOCS, TABLES } from "@repo/common"
import { type DailyChallengeHistoryDoc, type DocumentMapping, type GamesListDoc, type Table } from "@repo/schemas"
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
  [TABLES.DAILY_CHALLENGES]: collection(db, TABLES.DAILY_CHALLENGES) as CustomCollectionRef<
    typeof TABLES.DAILY_CHALLENGES
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
  [TABLES.METADATA]: collection(db, TABLES.METADATA),
  [TABLES.SOCIALS]: collection(db, TABLES.SOCIALS) as CustomCollectionRef<
    typeof TABLES.SOCIALS
  >,
  [TABLES.SOUNDS]: collection(db, TABLES.SOUNDS) as CustomCollectionRef<
    typeof TABLES.SOUNDS
  >,
  [TABLES.MARATHON_SEEDS]: collection(db, TABLES.MARATHON_SEEDS) as CustomCollectionRef<
    typeof TABLES.MARATHON_SEEDS
  >,
  [TABLES.RACES]: collection(db, TABLES.RACES) as CustomCollectionRef<
    typeof TABLES.RACES
  >,
  [TABLES.DEATH_RUNS]: collection(db, TABLES.DEATH_RUNS) as CustomCollectionRef<
    typeof TABLES.DEATH_RUNS
  >,
  [TABLES.LEADERBOARD]: collection(db, TABLES.LEADERBOARD) as CustomCollectionRef<
    typeof TABLES.LEADERBOARD
  >,
  [TABLES.MESSAGES]: collection(db, TABLES.MESSAGES) as CustomCollectionRef<
    typeof TABLES.MESSAGES
  >,
  [TABLES.CONVERSATIONS]: collection(db, TABLES.CONVERSATIONS) as CustomCollectionRef<
    typeof TABLES.CONVERSATIONS
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
  [TABLES.DEATH_RUN_RUNS]: (deathRunId: string) =>
    collection(db, TABLES.DEATH_RUNS, deathRunId, TABLES.DEATH_RUN_RUNS) as CustomCollectionRef<
      typeof TABLES.DEATH_RUN_RUNS
    >,
  [TABLES.RACE_RUNS]: (raceId: string) =>
    collection(db, TABLES.RACES, raceId, TABLES.RACE_RUNS) as CustomCollectionRef<
      typeof TABLES.RACE_RUNS
    >,
  [TABLES.DAILY_CHALLENGE_RESULTS]: (userId: string) =>
    collection(db, TABLES.USERS, userId, TABLES.DAILY_CHALLENGE_RESULTS) as CustomCollectionRef<
      typeof TABLES.DAILY_CHALLENGE_RESULTS
    >,
  [TABLES.CONVERSATION_MESSAGES]: (conversationId: string) =>
    collection(db, TABLES.CONVERSATIONS, conversationId, TABLES.CONVERSATION_MESSAGES) as CustomCollectionRef<
      typeof TABLES.CONVERSATION_MESSAGES
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
  doc(TABLE_REFS[TABLES.METADATA], METADATA_DOCS.GAMES_LIST) as DocumentReference<GamesListDoc, GamesListDoc>

export const getDailyChallengeRef = (date: string) =>
  doc(TABLE_REFS[TABLES.DAILY_CHALLENGES], date)

export const getDailyChallengeResultRef = (uid: string, date: string) =>
  doc(TABLES_SUB_REFS[TABLES.DAILY_CHALLENGE_RESULTS](uid), date)

export const getDailyChallengeHistoryRef = (): DocumentReference<DailyChallengeHistoryDoc, DailyChallengeHistoryDoc> =>
  doc(TABLE_REFS[TABLES.METADATA], METADATA_DOCS.DAILY_CHALLENGE_HISTORY) as DocumentReference<DailyChallengeHistoryDoc, DailyChallengeHistoryDoc>

export const getMarathonSeedRef = (seedId: string) =>
  doc(TABLE_REFS[TABLES.MARATHON_SEEDS], seedId)

export const getRaceRef = (raceId: string) =>
  doc(TABLE_REFS[TABLES.RACES], raceId)

export const getRaceRunRef = (raceId: string, uid: string) =>
  doc(TABLES_SUB_REFS[TABLES.RACE_RUNS](raceId), uid)

export const getDeathRunRef = (deathRunId: string) =>
  doc(TABLE_REFS[TABLES.DEATH_RUNS], deathRunId)

export const getDeathRunRunRef = (deathRunId: string, uid: string) =>
  doc(TABLES_SUB_REFS[TABLES.DEATH_RUN_RUNS](deathRunId), uid)

export const getMessageRef = (messageId: string | undefined) =>
  messageId ? doc(TABLE_REFS[TABLES.MESSAGES], messageId) : doc(TABLE_REFS[TABLES.MESSAGES])

export const getConversationRef = (conversationId: string | undefined) =>
  conversationId ? doc(TABLE_REFS[TABLES.CONVERSATIONS], conversationId) : doc(TABLE_REFS[TABLES.CONVERSATIONS])

export const getConversationMessageRef = (conversationId: string, messageId: string) =>
  doc(TABLES_SUB_REFS[TABLES.CONVERSATION_MESSAGES](conversationId), messageId)
