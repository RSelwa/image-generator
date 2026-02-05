import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { PROJECT_ID } from "@repo/common"
import admin from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"

export type { DecodedIdToken } from "firebase-admin/auth"
export type { Firestore, UpdateData } from "firebase-admin/firestore"

const getCredential = () => {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY

  if (credentialsPath) {
    return admin.credential.cert(
      JSON.parse(readFileSync(resolve(credentialsPath), "utf-8")),
    )
  }

  if (serviceAccountKey) {
    return admin.credential.cert(JSON.parse(serviceAccountKey))
  }

  return undefined
}

if (!admin.apps.length) {
  const credential = getCredential()

  admin.initializeApp({
    credential,
    storageBucket: `${PROJECT_ID}.firebasestorage.app`,
  })

  admin.firestore().settings({ ignoreUndefinedProperties: true, preferRest: true })
}

const firebaseApp = admin.app()

export const region = "europe-west3"
export const auth = getAuth(firebaseApp)
export const db = admin.firestore(firebaseApp)
export const storage = getStorage(firebaseApp)
export const functions = getFunctions(firebaseApp)
