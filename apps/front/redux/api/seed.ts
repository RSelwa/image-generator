import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

export const seedApi = createApi({
  reducerPath: "seedApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (_builder) => ({}),
})
