import admin from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
export type { DecodedIdToken } from "firebase-admin/auth"
export { FieldValue, Timestamp } from "firebase-admin/firestore"
export type { Firestore, UpdateData } from "firebase-admin/firestore"

if (!admin.apps.length) {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (credentialsPath) {
    const credential = admin.credential.cert(
      JSON.parse(readFileSync(resolve(credentialsPath), "utf-8")),
    )
    admin.initializeApp({ credential })
  } else {
    admin.initializeApp()
  }
}

const firebaseApp = admin.app()

export const region = "europe-west3"
export const auth = getAuth(firebaseApp)
export const db = admin.firestore(firebaseApp)
db.settings({ ignoreUndefinedProperties: true, preferRest: true })
export const storage = getStorage(firebaseApp)
export const functions = getFunctions(firebaseApp)
