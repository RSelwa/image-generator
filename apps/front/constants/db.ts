import { initializeFirestore } from "@firebase/firestore"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"

const apiKey = process.env.NEXT_PUBLIC_FBASE_API_KEY
const projectId = process.env.NEXT_PUBLIC_FBASE_PROJECT_ID || ""
const messagingSenderId = process.env.NEXT_PUBLIC_FBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FBASE_APP_ID
const measurementId = process.env.NEXT_PUBLIC_FBASE_MEASUREMENT_ID
export const isProd = process.env.NEXT_PUBLIC_FBASE_PROJECT_ID === "flim-prod"

export const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}.firebaseio.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId,
  appId,
  measurementId,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const functions = getFunctions(app, "europe-west3")
export const storage = getStorage(app)
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
