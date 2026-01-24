import { USERS_RIGHTS } from "@repo/common"
import type { RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user

export const selectSessionStatus = ({ session }: RootState) => session.status

export const selectIsAdmin = ({ session }: RootState) =>
  session.user?.rights?.includes(USERS_RIGHTS.ADMIN) ?? false
