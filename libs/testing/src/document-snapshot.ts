import { PROJECT_ID } from "@repo/common"
import {
  DocumentReference,
  type DocumentSnapshot,
  GeoPoint,
  getFirestore,
  Timestamp,
} from "firebase-admin/firestore"

const DEFAULT_DATABASE_ID = "(default)"
const NANOS_START_INDEX = 20
const NANOS_DIGITS = 9

type ValueProto = Record<string, unknown>

type SnapshotFactory = {
  snapshot_: (
    document: unknown,
    readTime: unknown,
    encoding: string,
  ) => DocumentSnapshot
}

const toTimestampProto = (timeString: string) => {
  const date = new Date(timeString)
  const seconds = Math.floor(date.getTime() / 1000)

  if (timeString.length <= NANOS_START_INDEX) return { seconds, nanos: 0 }

  const nanoString = timeString.substring(
    NANOS_START_INDEX,
    timeString.length - 1,
  )

  return {
    seconds,
    nanos:
      Number.parseInt(nanoString, 10) *
      10 ** (NANOS_DIGITS - nanoString.length),
  }
}

const isPlainObject = (value: unknown) =>
  typeof value === "object" &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype

const toValueProto = (value: unknown): ValueProto => {
  if (typeof value === "string") return { stringValue: value }
  if (typeof value === "boolean") return { booleanValue: value }
  if (typeof value === "number")
    return Number.isInteger(value)
      ? { integerValue: value }
      : { doubleValue: value }
  if (value === null || value === undefined) return { nullValue: "NULL_VALUE" }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (value instanceof Timestamp)
    return { timestampValue: value.toDate().toISOString() }
  if (value instanceof GeoPoint)
    return {
      geoPointValue: { latitude: value.latitude, longitude: value.longitude },
    }
  if (value instanceof Uint8Array) return { bytesValue: value }
  if (Array.isArray(value))
    return { arrayValue: { values: value.map(toValueProto) } }

  if (value instanceof DocumentReference) {
    return {
      referenceValue: [
        "projects",
        PROJECT_ID,
        "databases",
        DEFAULT_DATABASE_ID,
        value.path,
      ].join("/"),
    }
  }

  if (isPlainObject(value))
    return {
      mapValue: { fields: toFieldsProto(value as Record<string, unknown>) },
    }

  throw new Error(`Cannot encode ${String(value)} to a Firestore value`)
}

const toFieldsProto = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toValueProto(value)]),
  )

export const makeDocumentSnapshot = (
  data: Record<string, unknown>,
  refPath: string,
) => {
  const resource = `projects/${PROJECT_ID}/databases/${DEFAULT_DATABASE_ID}/documents/${refPath}`
  const now = new Date().toISOString()
  const isEmpty = Object.keys(data).length === 0

  const document = isEmpty
    ? resource
    : {
        fields: toFieldsProto(data),
        createTime: toTimestampProto(now),
        updateTime: toTimestampProto(now),
        name: resource,
      }

  return (getFirestore() as unknown as SnapshotFactory).snapshot_(
    document,
    toTimestampProto(now),
    "json",
  )
}
