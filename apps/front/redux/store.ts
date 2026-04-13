import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, useStore } from "react-redux"
import { adminApi } from "@/redux/api/admin"
import { authApi } from "@/redux/api/auth"
import { cloudFunctionsApi } from "@/redux/api/cloud-functions"
import { dailyChallengeApi } from "@/redux/api/daily-challenge"
import { deathRunApi } from "@/redux/api/death-run"
import { flatApi } from "@/redux/api/flat"
import { gameApi } from "@/redux/api/games"
import { gratitudeApi } from "@/redux/api/gratitude"
import { lobbyApi } from "@/redux/api/lobby"
import { localApi } from "@/redux/api/local"
import { mapApi } from "@/redux/api/maps"
import { marathonSeedApi } from "@/redux/api/marathon-seed"
import { messagesApi } from "@/redux/api/messages"
import { raceApi } from "@/redux/api/race"
import { seedApi } from "@/redux/api/seed"
import { seedMakerApi } from "@/redux/api/seed-maker"
import { socialsApi } from "@/redux/api/socials"
import { soundsApi } from "@/redux/api/sounds"
import { sphericalApi } from "@/redux/api/spherical"
import { suggestionsApi } from "@/redux/api/suggestions"
import { userApi } from "@/redux/api/user"
import { sessionSlice } from "@/redux/session/session.slice"

export const makeStore = () =>
  configureStore({
    reducer: {
      [adminApi.reducerPath]: adminApi.reducer,
      [messagesApi.reducerPath]: messagesApi.reducer,
      [gameApi.reducerPath]: gameApi.reducer,
      [suggestionsApi.reducerPath]: suggestionsApi.reducer,
      [userApi.reducerPath]: userApi.reducer,
      [localApi.reducerPath]: localApi.reducer,
      [mapApi.reducerPath]: mapApi.reducer,
      [sphericalApi.reducerPath]: sphericalApi.reducer,
      [flatApi.reducerPath]: flatApi.reducer,
      [gratitudeApi.reducerPath]: gratitudeApi.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [seedApi.reducerPath]: seedApi.reducer,
      [lobbyApi.reducerPath]: lobbyApi.reducer,
      [seedMakerApi.reducerPath]: seedMakerApi.reducer,
      [socialsApi.reducerPath]: socialsApi.reducer,
      [soundsApi.reducerPath]: soundsApi.reducer,
      [sessionSlice.name]: sessionSlice.reducer,
      [dailyChallengeApi.reducerPath]: dailyChallengeApi.reducer,
      [cloudFunctionsApi.reducerPath]: cloudFunctionsApi.reducer,
      [marathonSeedApi.reducerPath]: marathonSeedApi.reducer,
      [raceApi.reducerPath]: raceApi.reducer,
      [deathRunApi.reducerPath]: deathRunApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(adminApi.middleware)
        .concat(messagesApi.middleware)
        .concat(userApi.middleware)
        .concat(seedApi.middleware)
        .concat(lobbyApi.middleware)
        .concat(gameApi.middleware)
        .concat(localApi.middleware)
        .concat(mapApi.middleware)
        .concat(sphericalApi.middleware)
        .concat(flatApi.middleware)
        .concat(gratitudeApi.middleware)
        .concat(authApi.middleware)
        .concat(seedMakerApi.middleware)
        .concat(socialsApi.middleware)
        .concat(soundsApi.middleware)
        .concat(suggestionsApi.middleware)
        .concat(dailyChallengeApi.middleware)
        .concat(cloudFunctionsApi.middleware)
        .concat(marathonSeedApi.middleware)
        .concat(raceApi.middleware)
        .concat(deathRunApi.middleware),
  })

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
