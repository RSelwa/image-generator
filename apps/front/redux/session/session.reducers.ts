import type { Session } from "@/schemas/session"
import type { PayloadAction } from "@reduxjs/toolkit"

export const sessionReducers = {
  updateSession: (
    state: Session,
    { payload }: PayloadAction<Partial<Session>>,
  ) => {
    state = { ...state, ...payload }

    return state
  },
  updateSessionStatus: (
    state: Session,
    { payload }: PayloadAction<Session["status"]>,
  ) => {
    state.status = payload

    return state
  },
  updateAuthUser: (
    state: Session,
    { payload }: PayloadAction<Session["authUser"]>,
  ) => {
    state.authUser = payload

    return state
  },
  populateToken: (
    state: Session,
    { payload }: PayloadAction<string | null>,
  ) => {
    state.token = payload

    return state
  },
}
