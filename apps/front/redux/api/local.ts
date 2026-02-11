import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { type ConstantValues, type STORAGE_PATHS } from "@repo/common"
import { ENDPOINTS_BASE } from "@/constants/api"
import { auth } from "@/constants/db"
import { lobbyApi } from "@/redux/api/lobby"
import { applySeedPayload } from "@/schemas/api"

type UploadImageInput = {
  file: File
  bucketPath: ConstantValues<typeof STORAGE_PATHS>
  title: string
}

type UploadImageResult = {
  url: string
  width: number | null
  height: number | null
}

type ProxyImageResult = ArrayBuffer

export const localApi = createApi({
  reducerPath: "localApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/", prepareHeaders: async (headers) => {
    const token = await auth.currentUser?.getIdToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return headers
  } }),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadImageResult, UploadImageInput>({
      queryFn: async ({ file, bucketPath, title }) => {
        try {
          const token = await auth.currentUser?.getIdToken()
          const formData = new FormData()
          formData.append("file", file)
          formData.append("gameName", title)
          formData.append("bucketPath", bucketPath)

          const response = await fetch(ENDPOINTS_BASE.UPLOAD_IMAGE, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const { url, width, height } = await response.json()

          return { data: { url, width, height } }
        } catch (error) {
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : "Upload failed",
            },
          }
        }
      },
    }),
    proxyImage: builder.query<ProxyImageResult, { url: string }>({
      queryFn: async ({ url }) => {
        try {
          const response = await fetch(
            `${ENDPOINTS_BASE.PROXY_IMAGE}?url=${encodeURIComponent(url)}`,
          )

          if (!response.ok) {
            throw new Error("Failed to fetch image")
          }

          const buffer = await response.arrayBuffer()

          return { data: buffer }
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to fetch image",
            },
          }
        }
      },
    }),
    applySeedToLobby: builder.mutation<null, { lobbyId: string, seedId: string }>({
      queryFn: async (b, { dispatch }) => {
        try {
          const body = applySeedPayload.parse(b)

          if (!body.seedId && body.lobbyId) {
            await dispatch(lobbyApi.endpoints.updateLobby.initiate({
              id: body.lobbyId,
              data: {
                seedId: ""
              }
            }))

            return { data: null }
          }

          const response = await fetch(ENDPOINTS_BASE.APPLY_SEED, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            throw new Error("Failed to apply seed")
          }

          return { data: null }
        } catch (error) {
          console.error("Error applying seed:", error)

          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to apply seed",
            },
          }
        }
      }
    })
  }),
})

export const { useUploadImageMutation, useProxyImageQuery, useApplySeedToLobbyMutation } = localApi
