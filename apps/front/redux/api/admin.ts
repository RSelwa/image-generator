import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
// Need to use the React-specific entry point to import createApi
import { type GlobalError } from "@/utils/error"

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fakeBaseQuery<GlobalError>(),
  endpoints: () => ({}),
})
