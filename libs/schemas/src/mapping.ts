import { type TABLES } from "@repo/common"
import { type DailyChallengeDoc, type DailyChallengeResultDoc, type DeathRunDoc, type DeathRunRunDoc, type FlatDoc, type GameDoc, type GamesListDoc, type LeaderboardDoc, type LobbyDoc, type MapDoc, type MarathonSeedDoc, type MessageDoc, type RaceDoc, type RaceRunDoc, type RightDoc, type RoundAnswerDoc, type SeedDoc, type SocialDoc, type SoundDoc, type SphericalDoc, type SuggestionDoc, type UserDoc } from "~/firestore"

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
  [TABLES.SOUNDS]: SoundDoc
  [TABLES.DAILY_CHALLENGES]: DailyChallengeDoc
  [TABLES.DAILY_CHALLENGE_RESULTS]: DailyChallengeResultDoc
  [TABLES.MARATHON_SEEDS]: MarathonSeedDoc
  [TABLES.RACES]: RaceDoc
  [TABLES.RACE_RUNS]: RaceRunDoc
  [TABLES.DEATH_RUNS]: DeathRunDoc
  [TABLES.DEATH_RUN_RUNS]: DeathRunRunDoc
  [TABLES.LEADERBOARD]: LeaderboardDoc
  [TABLES.MESSAGES]: MessageDoc
}

export type Table = keyof DocumentMapping
