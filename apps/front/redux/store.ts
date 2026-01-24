import { pokemonApi } from "@/redux/api"
import { authApi } from "@/redux/api/auth"
import { sessionSlice } from "@/redux/session/session.slice"
import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, useStore } from "react-redux"

export const makeStore = () => {
  return configureStore({
    reducer: {
      [pokemonApi.reducerPath]: pokemonApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(pokemonApi.middleware)
        .concat(authApi.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()

export type ReturnAction = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => void | Promise<void>
