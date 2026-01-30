import { USERS_RIGHTS } from "@repo/common"
import { type RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user

export const selectSessionStatus = ({ session }: RootState) => session.status

export function selectIsAdmin({ session }: RootState) {
  return session.user?.rights?.includes(USERS_RIGHTS.ADMIN) ?? false
}
