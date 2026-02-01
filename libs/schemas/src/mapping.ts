import { type TABLES } from "@repo/common"
import { type GameDoc, type MapDoc, type SphericalDoc, type UserDoc } from "~/firestore"

export type DocumentMapping = {
  [TABLES.USERS]: UserDoc
  [TABLES.GAMES]: GameDoc
  [TABLES.SPHERICAL]: SphericalDoc
  [TABLES.MAPS]: MapDoc
  [TABLES.FLAT]: any // TODO Fix the types
  [TABLES.RIGHTS]: any // TODO Fix the types
}

export type Table = keyof DocumentMapping
