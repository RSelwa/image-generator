import { USER_RIGHT } from "@repo/common"
import { type RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user

export const selectSessionStatus = ({ session }: RootState) => session.status

export const selectIsAdmin = ({ session }: RootState) =>
  session.user?.rights?.includes(USER_RIGHT.ADMIN) ?? false
