import { TABLES } from "@repo/common"
import type { UserDoc } from "@repo/schemas"
import type {
  CollectionReference,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore"
import { db } from "~/firebase"

type WithId<T> = T & { id: string }

const toFirestoreConverter = <T = unknown>({ id: _, ...item }: WithId<T>) =>
  item

export const createFirestoreConverter = <T = unknown>() => ({
  toFirestore: toFirestoreConverter<T>,
  fromFirestore: (snapshot: QueryDocumentSnapshot<T>): WithId<T> => {
    const data = snapshot.data()

    return { ...data, id: snapshot.id }
  },
})

export const refs = {
  [TABLES.USERS]: db.collection(TABLES.USERS) as CollectionReference<
    UserDoc,
    UserDoc
  >,
}
