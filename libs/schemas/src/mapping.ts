import { type TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type LobbyDoc, type MapDoc, type RightDoc, type RoundAnswerDoc, type SeedDoc, type SphericalDoc, type UserDoc } from "~/firestore"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
  [TABLES.GAMES]: GameDoc
  [TABLES.SPHERICAL]: SphericalDoc
  [TABLES.MAPS]: MapDoc
  [TABLES.FLAT]: FlatDoc
  [TABLES.RIGHTS]: RightDoc
  [TABLES.LOBBIES]: LobbyDoc
  [TABLES.SEEDS]: SeedDoc
  [TABLES.ROUND_ANSWERS]: RoundAnswerDoc
}

export type Table = keyof DocumentMapping
