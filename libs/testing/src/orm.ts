import { type ConstantValues, TABLES } from "@repo/common"
import { db } from "@repo/providers/firebase"
import { type DocumentMapping } from "@repo/schemas"
import { FirestoreORM } from "~/firebase-orm"

export type FactoryDoc<T> = (item?: Partial<T>) => { id?: string } & T

type Tables = ConstantValues<typeof TABLES>

class AppORM<T extends Tables> extends FirestoreORM<
  T,
  Record<T, DocumentMapping[T]>
> {}

AppORM.initSetup(db)

export const testOrm = {
  userModel: new AppORM(TABLES.USERS),
  gameModel: new AppORM(TABLES.GAMES),
  sphericalModel: new AppORM(TABLES.SPHERICAL),
  mapModel: new AppORM(TABLES.MAPS),
  flatModel: new AppORM(TABLES.FLAT),
  rightsModel: new AppORM(TABLES.RIGHTS),
}
