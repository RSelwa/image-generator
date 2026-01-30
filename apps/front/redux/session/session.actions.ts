import { sessionSlice } from "@/redux/session/session.slice"
import { type ReturnAction } from "@/redux/store"
import { type Session } from "@/schemas/session"

const { actions } = sessionSlice

export function updateSession(session: Partial<Session>): ReturnAction {
  return (dispatch) => {
    dispatch(actions.updateSession(session))
  }
}

export function updateSessionAuthUser(
  payload: Session["authUser"],
): ReturnAction {
  return (dispatch) => {
    dispatch(actions.updateAuthUser(payload))
  }
}

export function updateSessionStatus(status: Session["status"]): ReturnAction {
  return (dispatch) => {
    dispatch(actions.updateSessionStatus(status))
  }
}

export function populateToken(token: string | null): ReturnAction {
  return (dispatch) => {
    dispatch(actions.populateToken(token))
  }
}
