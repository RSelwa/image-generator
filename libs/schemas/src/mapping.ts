import { type TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type GamesListDoc, type LobbyDoc, type MapDoc, type RightDoc, type RoundAnswerDoc, type SeedDoc, type SocialDoc, type SphericalDoc, type SuggestionDoc, type UserDoc } from "~/firestore"

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
  [TABLES.SUGGESTIONS]: SuggestionDoc
  [TABLES.METADATA]: GamesListDoc
  [TABLES.SOCIALS]: SocialDoc
}

export type Table = keyof DocumentMapping
