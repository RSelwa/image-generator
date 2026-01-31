import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, useStore } from "react-redux"
import { pokemonApi } from "@/redux/api"
import { adminApi } from "@/redux/api/admin"
import { authApi } from "@/redux/api/auth"
import { gameApi } from "@/redux/api/games"
import { localApi } from "@/redux/api/local"
import { mapApi } from "@/redux/api/maps"
import { sphericalApi } from "@/redux/api/spherical"
import { sessionSlice } from "@/redux/session/session.slice"

export const makeStore = () =>
  configureStore({
    reducer: {
      [pokemonApi.reducerPath]: pokemonApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      [gameApi.reducerPath]: gameApi.reducer,
      [localApi.reducerPath]: localApi.reducer,
      [mapApi.reducerPath]: mapApi.reducer,
      [sphericalApi.reducerPath]: sphericalApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(pokemonApi.middleware)
        .concat(adminApi.middleware)
        .concat(gameApi.middleware)
        .concat(localApi.middleware)
        .concat(mapApi.middleware)
        .concat(sphericalApi.middleware)
        .concat(authApi.middleware),
  })

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
