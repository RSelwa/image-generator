import { initializeFirestore } from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFunctions } from "firebase/functions"
import { getStorage } from "firebase/storage"

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

export const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}.firebaseio.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId,
  appId,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const functions = getFunctions(app, "europe-west3")
export const storage = getStorage(app)
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
