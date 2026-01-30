import { PROJECT_ID } from "@repo/common"
import admin from "firebase-admin"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

if (!admin.apps.length) {
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY

  if (serviceAccountKey) {
    const credential = admin.credential.cert(JSON.parse(serviceAccountKey))

    admin.initializeApp({
      credential,
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
    })
  } else {
    admin.initializeApp({
      storageBucket: `${PROJECT_ID}.firebasestorage.app`,
    })
  }
}

export const storage = getStorage()
export const auth = getAuth()
export const db = getFirestore()
