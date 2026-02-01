import { type TABLES } from "@repo/common"
import { type FlatDoc, type GameDoc, type MapDoc, type RightDoc, type SphericalDoc, type UserDoc } from "~/firestore"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
  [TABLES.GAMES]: GameDoc
  [TABLES.SPHERICAL]: SphericalDoc
  [TABLES.MAPS]: MapDoc
  [TABLES.FLAT]: FlatDoc
  [TABLES.RIGHTS]: RightDoc
}

export type Table = keyof DocumentMapping
