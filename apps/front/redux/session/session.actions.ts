import { sessionSlice } from "@/redux/session/session.slice"
import { type ReturnAction } from "@/redux/store"
import { type Session } from "@/schemas/session"

const { actions } = sessionSlice

export const updateSession = (session: Partial<Session>): ReturnAction =>
  (dispatch) => {
    dispatch(actions.updateSession(session))
  }

export const updateSessionAuthUser = (
  payload: Session["authUser"],
): ReturnAction =>
  (dispatch) => {
    dispatch(actions.updateAuthUser(payload))
  }

export const updateSessionStatus = (status: Session["status"]): ReturnAction =>
  (dispatch) => {
    dispatch(actions.updateSessionStatus(status))
  }

export const populateToken = (token: string | null): ReturnAction =>
  (dispatch) => {
    dispatch(actions.populateToken(token))
  }
