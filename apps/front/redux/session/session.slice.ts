import { SESSION_STATUS } from "@/constants/mapping"
import { sessionReducers } from "@/redux/session/session.reducers"
import type { Session } from "@/schemas/session"
import { createSlice } from "@reduxjs/toolkit"

const initialState: Session = {
  disconnected: false,
  token: null,
  status: SESSION_STATUS.IDLE,
  authUser: null,
  user: null,
}

export const sessionSlice = createSlice({
  name: "session",
  initialState: initialState,
  reducers: sessionReducers,
})
