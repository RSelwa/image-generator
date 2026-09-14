import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { PROJECT_ID } from "@repo/common"
import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getDatabase } from "firebase-admin/database"
import { getFirestore } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"

export type { DecodedIdToken } from "firebase-admin/auth"
export type { Firestore, UpdateData } from "firebase-admin/firestore"

const getCredential = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY

  if (credentialsPath) {
    const base = process.env.INIT_CWD || process.cwd()

    return cert(
      JSON.parse(readFileSync(resolve(base, credentialsPath), "utf-8")),
    )
  }

  if (serviceAccountKey) {
    return cert(JSON.parse(serviceAccountKey))
  }

  return applicationDefault()
}

const isEmulated = Boolean(process.env.FIRESTORE_EMULATOR_HOST)

if (!getApps().length) {
  if (isEmulated) {
    initializeApp({
      projectId: PROJECT_ID,
      databaseURL: `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST || "127.0.0.1:9000"}?ns=${PROJECT_ID}-default-rtdb`,
    })
  } else {
    const credential = getCredential()
    initializeApp({
      credential,
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
      databaseURL: `https://${PROJECT_ID}-default-rtdb.firebasedatabase.app`,
    })
  }

  getFirestore().settings({ ignoreUndefinedProperties: true, preferRest: !isEmulated })
}

const firebaseApp = getApp()

export const region = "europe-west3"
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)
export const rtdb = getDatabase(firebaseApp)
export const functions = getFunctions(firebaseApp)
