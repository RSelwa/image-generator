import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, useStore } from "react-redux"
import { adminApi } from "@/redux/api/admin"
import { authApi } from "@/redux/api/auth"
import { flatApi } from "@/redux/api/flat"
import { gameApi } from "@/redux/api/games"
import { lobbyApi } from "@/redux/api/lobby"
import { localApi } from "@/redux/api/local"
import { mapApi } from "@/redux/api/maps"
import { seedApi } from "@/redux/api/seed"
import { seedMakerApi } from "@/redux/api/seed-maker"
import { sphericalApi } from "@/redux/api/spherical"
import { userApi } from "@/redux/api/user"
import { sessionSlice } from "@/redux/session/session.slice"

export const makeStore = () =>
  configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer,
      [gameApi.reducerPath]: gameApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [localApi.reducerPath]: localApi.reducer,
      [mapApi.reducerPath]: mapApi.reducer,
      [sphericalApi.reducerPath]: sphericalApi.reducer,
      [flatApi.reducerPath]: flatApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [seedApi.reducerPath]: seedApi.reducer,
      [lobbyApi.reducerPath]: lobbyApi.reducer,
      [seedMakerApi.reducerPath]: seedMakerApi.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(adminApi.middleware)
        .concat(userApi.middleware)
        .concat(seedApi.middleware)
        .concat(lobbyApi.middleware)
        .concat(gameApi.middleware)
        .concat(localApi.middleware)
        .concat(mapApi.middleware)
        .concat(sphericalApi.middleware)
        .concat(flatApi.middleware)
        .concat(authApi.middleware)
        .concat(seedMakerApi.middleware),
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
