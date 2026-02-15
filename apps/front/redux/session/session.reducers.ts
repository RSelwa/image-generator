import { type PayloadAction } from "@reduxjs/toolkit"
import { type Session } from "@/schemas/session"

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
}
