import { IS_PLAYWRIGHT_EMULATOR } from "@/constants/mapping"
import { initializeApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, initializeFirestore } from "firebase/firestore"
import { connectFunctionsEmulator, getFunctions } from "firebase/functions"
import { connectStorageEmulator, getStorage } from "firebase/storage"

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

if (IS_PLAYWRIGHT_EMULATOR) {
  connectAuthEmulator(auth, process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || "http://localhost:9099")
  connectFirestoreEmulator(db, "localhost", 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
  connectStorageEmulator(storage, "localhost", 9199)
}

export const BASE_FIREBASE_URL = `https://console.firebase.google.com/u/1/project/tiktok-generator-fa261/firestore/databases/-default-/data`
