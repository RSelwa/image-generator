import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { PROJECT_ID } from "@repo/common"
import admin from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { getFunctions } from "firebase-admin/functions"
import { getDatabase } from "firebase-admin/database"
import { getStorage } from "firebase-admin/storage"

export type { DecodedIdToken } from "firebase-admin/auth"
export type { Firestore, UpdateData } from "firebase-admin/firestore"

const getCredential = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY

  if (credentialsPath) {
    const base = process.env.INIT_CWD || process.cwd()
    return admin.credential.cert(
      JSON.parse(readFileSync(resolve(base, credentialsPath), "utf-8")),
    )
  }

  if (serviceAccountKey) {
    return admin.credential.cert(JSON.parse(serviceAccountKey))
  }

  return admin.credential.applicationDefault()
}

if (!admin.apps.length) {
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: PROJECT_ID,
      databaseURL: `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST || "127.0.0.1:9000"}?ns=${PROJECT_ID}-default-rtdb`,
    })
  } else {
    const credential = getCredential()
    admin.initializeApp({
      credential,
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
      databaseURL: `https://${PROJECT_ID}-default-rtdb.firebasedatabase.app`,
    })
  }

  admin.firestore().settings({ ignoreUndefinedProperties: true, preferRest: true })
}

const firebaseApp = admin.app()

export const region = "europe-west3"
export const auth = getAuth(firebaseApp)
export const db = admin.firestore(firebaseApp)
export const storage = getStorage(firebaseApp)
export const rtdb = getDatabase(firebaseApp)
export const functions = getFunctions(firebaseApp)
