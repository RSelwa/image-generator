"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS } from "@repo/common"
import { createMapInputSchema } from "@repo/schemas"
import { ArrowLeft } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"
import Loader from "@/components/icons/loader"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { ImageDropzone } from "@/components/ui/image-dropzone"
import { Input } from "@/components/ui/input"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import {
  useCreateMapMutation,
  useGetMapByIdQuery,
  useUpdateMapByIdMutation,
} from "@/redux/api/maps"
import { uploadFileToBucket } from "@/utils/file"

type MapFormSchema = z.input<typeof createMapInputSchema>

const KEY = MODAL_KEYS.MAP_ID

// Helper to parse combined param format: "parentId_childId"
export const parseSubcollectionParam = (
  param: string | null,
): { parentId: string, childId: string } | null => {
  if (!param) return null
  const separatorIndex = param.indexOf("_")
  if (separatorIndex === -1) return null
  const parentId = param.substring(0, separatorIndex)
  const childId = param.substring(separatorIndex + 1)
  if (!parentId || !childId) return null

  return { parentId, childId }
}

// Helper to build combined param format: "parentId_childId"
export const buildSubcollectionParam = (
  parentId: string,
  childId: string,
): string => `${parentId}_${childId}`

const MapForm = ({
  mapId,
  gameId,
  isNew,
}: {
  mapId: string
  gameId: string
  isNew: boolean
}) => {
  const { openModal } = useModal(MODAL_KEYS.MAPS_GALLERY_ID, gameId)
  const { closeModal } = useModal(MODAL_KEYS.MAP_ID)

  const { data, isLoading } = useGetMapByIdQuery(
    { gameId, id: mapId },
    { skip: isNew },
  )
  const [createMap, { isLoading: isCreating }] = useCreateMapMutation()
  const [updateMap, { isLoading: isUpdating }] = useUpdateMapByIdMutation()
  const [isUploading, setIsUploading] = useState(false)
  const [, setModalParam] = useQueryState(KEY)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<MapFormSchema>({
    resolver: zodResolver(createMapInputSchema),
    defaultValues: {
      name: "",
      imageUrl: null,
      width: null,
      height: null,
      gameId,
    },
  })

  const imageUrl = watch("imageUrl")
  const name = watch("name")

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        imageUrl: data.imageUrl ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        gameId: data.gameId,
      })
    }
  }, [data, reset])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const { url, width, height } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.MAP_IMAGES,
        title: name,
      })

      setValue("imageUrl", url, { shouldDirty: true })
      if (width) setValue("width", width, { shouldDirty: true })
      if (height) setValue("height", height, { shouldDirty: true })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setValue("imageUrl", null, { shouldDirty: true })
  }

  const onSubmit: SubmitHandler<MapFormSchema> = async (formData) => {
    const parsedData = createMapInputSchema.parse(formData)

    if (isNew) {
      const { data: createdMap, error } = await createMap({
        gameId,
        data: parsedData,
      })

      if (error) return

      toast.success("Map created successfully")
      if (createdMap?.id) {
        // Update URL to the new map's combined param
        setModalParam(buildSubcollectionParam(gameId, createdMap.id))
      }
    } else {
      // Only include image fields if they were actually changed
      const { imageUrl, width, height, ...rest } = parsedData
      const updateData = {
        ...rest,
        ...(dirtyFields.imageUrl && { imageUrl }),
        ...(dirtyFields.width && { width }),
        ...(dirtyFields.height && { height }),
      }

      const { error } = await updateMap({
        gameId,
        id: mapId,
        data: updateData,
      })

      if (error) return

      toast.success("Map updated successfully")
    }
  }

  const getBackToMapGallery = () => {
    openModal()
    closeModal()
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <div className="flex mb-6 items-center gap-6">
          <Button variant="ghost" onClick={getBackToMapGallery}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {isNew ? "Create Map" : "Edit Map"}
          </h2>
        </div>

        <div className="grid grid-cols-[1fr_220px] gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                placeholder="Map name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="width">Width</FieldLabel>
                <Input
                  id="width"
                  type="number"
                  placeholder="Width in pixels"
                  {...register("width", { valueAsNumber: true })}
                  aria-invalid={!!errors.width}
                />
                <FieldDescription>Optional width in pixels</FieldDescription>
                {errors.width && (
                  <FieldError>{errors.width.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="height">Height</FieldLabel>
                <Input
                  id="height"
                  type="number"
                  placeholder="Height in pixels"
                  {...register("height", { valueAsNumber: true })}
                  aria-invalid={!!errors.height}
                />
                <FieldDescription>Optional height in pixels</FieldDescription>
                {errors.height && (
                  <FieldError>{errors.height.message}</FieldError>
                )}
              </Field>
            </div>

            {data && (
              <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                <p>
                  <strong>ID:</strong> {data.id}
                </p>
                <p>
                  <strong>Game ID:</strong> {data.gameId}
                </p>
                <p>
                  <strong>Created:</strong>
                  {" "}
                  {data.createdAt?.toDate().toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>
                  {" "}
                  {data.updatedAt?.toDate().toLocaleString()}
                </p>
              </div>
            )}
          </FieldGroup>

          <div className="flex flex-col gap-3">
            <FieldLabel>Map Image</FieldLabel>
            <ImageDropzone
              imageUrl={imageUrl ?? null}
              onFileSelect={handleFileUpload}
              onRemove={handleRemoveImage}
              isUploading={isUploading}
              alt="Map image"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" disabled={isCreating || isUpdating || !isDirty}>
            {isCreating || isUpdating ? (
              <>
                {isNew ? "Creating" : "Saving"} <Loader />
              </>
            ) : isNew ? (
              "Create Map"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}

export const ModalMapId = () => {
  const [modalParam] = useQueryState(KEY)

  const parsed = parseSubcollectionParam(modalParam)

  if (!parsed) return <LoadingModal modalKey={KEY} />

  const { parentId: gameId, childId: mapId } = parsed
  const isNew = mapId === NEW_SEARCH_PARAM

  return <MapForm mapId={mapId} gameId={gameId} isNew={isNew} />
}

export default ModalMapId
