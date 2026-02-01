import { auth } from "@repo/providers/firebase"
import {
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type OrderByDirection,
  type UpdateData,
  type WithFieldValue,
} from "firebase-admin/firestore"

type ORMAuth = {
  email: string
  password?: string
  photoURL?: string | null
  emailVerified?: boolean
  uid?: string
}

type ORMDataOptionalId<T> = WithFieldValue<T> & { id?: string }

export class FirestoreORM<T extends string, M extends DocumentData> {
  private static firestoreInstance: Firestore | null = null
  private firestore: Firestore
  private collectionName: T
  private isSubCollection?: boolean
  private collection?: CollectionReference

  static initSetup(firestore: Firestore) {
    FirestoreORM.firestoreInstance = firestore
  }

  constructor(collectionName: T) {
    if (!FirestoreORM.firestoreInstance) {
      throw new Error(
        "FirestoreORM: Firestore instance not initialized. Call FirestoreORM.initSetup(firestore) before instantiation.",
      )
    }

    this.firestore = FirestoreORM.firestoreInstance
    this.collectionName = collectionName
    this.isSubCollection = collectionName.includes("/")

    if (!this.isSubCollection) {
      this.collection = this.firestore.collection(
        this.collectionName,
      ) as CollectionReference<M[T], M[T]>
    }
  }

  async create(data: ORMDataOptionalId<M[T]>, parentRef?: DocumentReference) {
    const collectionRef = this._getCollectionRef(parentRef)
    const id = (data as { id?: string }).id

    if ("id" in data && id) {
      const ref = collectionRef.doc(id)
      await ref.set(data)

      return { data, id: ref.id, ref }
    }

    const ref = await collectionRef.add(data)

    return { data, id: ref.id, ref }
  }

  async createMany(
    data: (WithFieldValue<M[T]> & { id?: string })[],
    parentRef?: DocumentReference,
  ) {
    return Promise.all(data.map((item) => this.create(item, parentRef)))
  }

  async createManyUsers(data: ORMDataOptionalId<M[T]>[]) {
    const users = []

    for await (const item of data) {
      const user = await this.createUser(item)

      users.push(user)
    }

    return users
  }

  async getAll(docId?: DocumentReference<M[T], M[T]>) {
    if (this.isSubCollection && !docId) {
      throw new Error("Doc Id must be provided for sub-collections")
    }
    if (!this.isSubCollection && !this.collection) {
      throw new Error("Root collection reference not initialized")
    }

    const colRef = this._getCollectionRef(docId)
    const querySnapshot = await colRef.get()

    return querySnapshot.docs.map((doc) => ({
      data: doc.data(),
      id: doc.id,
      ref: doc.ref,
    }))
  }

  async update(
    id: string,
    data: UpdateData<M[T]>,
    parentRef?: DocumentReference<M[T], M[T]>,
  ) {
    const colRef = this._getCollectionRef(parentRef)
    const docRef = colRef.doc(id)

    await docRef.update(data)
  }

  async delete(id: string, parentRef?: DocumentReference) {
    const colRef = this._getCollectionRef(parentRef)
    const docRef = colRef.doc(id)

    await docRef.delete()
  }

  async drop(parentRef?: DocumentReference) {
    const colRef = this._getCollectionRef(parentRef)
    const querySnapshot = await colRef.get()

    const deleting = querySnapshot.docs.map((docSnapshot) =>
      colRef.doc(docSnapshot.id).delete(),
    )

    await Promise.all(deleting)
  }

  async findOne<K extends keyof M[T]>(
    field: K,
    value: M[T][K],
    parentRef?: DocumentReference<M[T], M[T]>,
  ) {
    const colRef = this._getCollectionRef(parentRef)

    const q = colRef.where(field as string, "==", value).limit(1)

    const querySnapshot = await q.get()

    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]

    if (!doc) return null

    return {
      data: doc.data(),
      id: doc.id,
      ref: doc.ref,
    }
  }

  async findBy(
    criteria: Partial<M[T]>,
    definedFields?: string[],
    parentRef?: DocumentReference<M[T], M[T]>,
  ) {
    const colRef = this._getCollectionRef(parentRef)

    const q = colRef

    Object.entries(criteria).map(([field, value]) =>
      q.where(field, "==", value),
    )

    ;(definedFields ?? []).map((field) => q.where(field, "!=", null))

    const querySnapshot = await q.get()

    return querySnapshot.docs.map((doc) => ({
      data: doc.data(),
      id: doc.id,
      ref: doc.ref,
    }))
  }

  async findById(id: string, parentRef?: DocumentReference<M[T], M[T]>) {
    const colRef = this._getCollectionRef(parentRef)
    const docRef = colRef.doc(id)

    const docSnap = await docRef.get()

    if (!docSnap.exists) return null

    const data = docSnap.data()

    if (!data) return null

    return { data, id: docSnap.id, ref: docSnap.ref }
  }

  async findAll(
    options: {
      limit?: number
      orderByField?: keyof M[T]
      orderDirection?: OrderByDirection
    } = {},
    parentRef?: DocumentReference<M[T], M[T]>,
  ) {
    const colRef = this._getCollectionRef(parentRef)
    const q = colRef

    if (options.orderByField) {
      q.orderBy(options.orderByField as string, options.orderDirection || "asc")
    }

    if (options.limit) q.limit(options.limit)

    const querySnapshot = await q.get()

    return querySnapshot.docs.map((doc) => ({
      data: doc.data(),
      id: doc.id,
      ref: doc.ref,
    }))
  }

  async createUser(user: ORMDataOptionalId<M[T] & ORMAuth>) {
    const { email, password, emailVerified, photoURL } = user as ORMAuth
    const pass = password || email

    if (!email) {
      throw new Error("User must have an email to create an account")
    }

    const cred = await auth.createUser({
      email,
      password: pass,
      photoURL,
      emailVerified,
    })

    const res = await fetch(
      `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake_kay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: pass,
          returnSecureToken: true,
        }),
      },
    )

    const data = (await res.json()) as { idToken: string }

    if (!cred) {
      throw new Error("Error creating user in Firebase Auth")
    }

    const authUser = {
      ...user,
      id: cred.uid,
      uid: cred.uid,
      email: email || cred.email,
      emailVerified: emailVerified ?? cred.emailVerified,
      photoURL: photoURL ?? cred.photoURL,
    }

    return { ...(await this.create(authUser)), token: data.idToken }
  }

  private _getCollectionRef<T extends DocumentData>(
    parentRef?: DocumentReference<T, T>,
  ) {
    if (!this.isSubCollection) {
      if (!this.collection) {
        throw new Error("Root collection reference not initialized")
      }

      return this.collection as CollectionReference<T, T>
    }

    if (!parentRef) {
      throw new Error("parentRef is required for sub-collections")
    }

    const segments = this.collectionName.split("/")
    const subCollectionName = segments[segments.length - 1]

    if (!subCollectionName) {
      throw new Error("Invalid sub-collection name")
    }

    return parentRef.collection(subCollectionName) as CollectionReference<T, T>
  }
}
