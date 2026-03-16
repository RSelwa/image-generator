import { USER_RIGHT } from "@repo/common"
import { SESSION_STATUS } from "@/constants/mapping"
import { type RootState } from "@/redux/store"

export const selectUser = ({ session }: RootState) => session.user
export const selectAuthUser = ({ session }: RootState) => session.authUser

export const selectUserId = ({ session }: RootState) => session.user?.id || ""

export const selectIsAnonymous = ({ session }: RootState) => session.user?.isAnonymous || false

export const selectSessionStatus = ({ session }: RootState) => session.status
export const selectSessionIsReady = ({ session }: RootState) => session.status === SESSION_STATUS.SUCCESS

export const selectUserSteak = ({ session }: RootState) => session.user?.streak || 0

export const selectUserRights = ({ session }: RootState) =>
  session.user?.rights

export const selectHasRightToDashBoard = ({ session }: RootState) => {
  const right = session.user?.rights

  return right === USER_RIGHT.ADMIN || right === USER_RIGHT.ICONOGRAPH
}

export const selectIsAdmin = ({ session }: RootState) =>
  session.user?.rights === USER_RIGHT.ADMIN || false

export const selectIsIconograph = ({ session }: RootState) =>
  session.user?.rights === USER_RIGHT.ICONOGRAPH || false
