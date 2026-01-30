import { createSlice } from "@reduxjs/toolkit"
import { SESSION_STATUS } from "@/constants/mapping"
import { sessionReducers } from "@/redux/session/session.reducers"
import { type Session } from "@/schemas/session"

const initialState: Session = {
  disconnected: false,
  token: null,
  status: SESSION_STATUS.LOADING,
  authUser: null,
  user: null,
}

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: sessionReducers,
})
