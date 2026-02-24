import { type DocumentReference } from "@firebase/firestore"
import { PROJECT_ID } from "@repo/common"

export const getFirestoreDocumentUrl = (docRef: DocumentReference) => {
  const encodedPath = docRef.path.split("/").join("~2F")

  return `https://console.firebase.google.com/u/1/project/${PROJECT_ID}/firestore/data/~2F${encodedPath}`
}
