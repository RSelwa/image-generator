import type { QueryDocumentSnapshot } from "firebase-admin/firestore"

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

export const refs = {}
