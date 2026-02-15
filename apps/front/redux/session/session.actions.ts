import { sessionSlice } from "@/redux/session/session.slice"

export const {
  updateSession,
  updateSessionStatus,
  updateAuthUser: updateSessionAuthUser,
} = sessionSlice.actions
