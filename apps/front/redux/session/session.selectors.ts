import { USER_RIGHT } from "@repo/common"
import { type RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user

export const selectSessionStatus = ({ session }: RootState) => session.status

export const selectUserRights = ({ session }: RootState) =>
  session.user?.rights

export const selectHasRightToDashBoard = ({ session }: RootState) => {
  const right = session.user?.rights

  return right === USER_RIGHT.ADMIN || right === USER_RIGHT.ICONOGRAPH
}

export const selectIsAdmin = ({ session }: RootState) =>
  session.user?.rights?.includes(USER_RIGHT.ADMIN) ?? false

export const selectIsIconograph = ({ session }: RootState) =>
  session.user?.rights?.includes(USER_RIGHT.ICONOGRAPH) ?? false
