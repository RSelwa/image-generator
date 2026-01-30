"use client"

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
import { Input } from "@/components/ui/input"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import {
  useCreateMapMutation,
  useGetMapByIdQuery,
  useUpdateMapByIdMutation,
} from "@/redux/api/maps"
import { uploadFileToBucket } from "@/utils/file"
import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS } from "@repo/common"
import { createMapInputSchema } from "@repo/schemas"
import { ImageIcon, XIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useRef, useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

type MapFormSchema = z.input<typeof createMapInputSchema>

const KEY = MODAL_KEYS.MAP_ID

const MapForm = ({
  mapId,
  gameId,
  isNew,
}: {
  mapId: string
  gameId: string
  isNew: boolean
}) => {
  const { data, isLoading } = useGetMapByIdQuery(
    { gameId, id: mapId },
    { skip: isNew },
  )
  const [createMap, { isLoading: isCreating }] = useCreateMapMutation()
  const [updateMap, { isLoading: isUpdating }] = useUpdateMapByIdMutation()
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setMapId] = useQueryState(KEY)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
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

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    setIsUploading(true)
    try {
      const { url, width, height } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.MAP_THUMBNAILS,
        title: name,
      })

      setValue("imageUrl", url, { shouldDirty: true })
      if (width) setValue("width", width, { shouldDirty: true })
      if (height) setValue("height", height, { shouldDirty: true })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) await uploadFile(file)
  }

  const handleRemoveImage = () => {
    setValue("imageUrl", null, { shouldDirty: true })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
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
        setMapId(createdMap.id)
      }
    } else {
      const { error } = await updateMap({
        gameId,
        id: mapId,
        data: parsedData,
      })

      if (error) return

      toast.success("Map updated successfully")
    }
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  const displayImage = previewUrl || imageUrl

  return (
    <ModalBase modalKey={KEY} className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <h2 className="mb-6 text-2xl font-bold">
          {isNew ? "Create Map" : "Edit Map"}
        </h2>

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
                  <strong>Created:</strong>{" "}
                  {data.createdAt?.toDate().toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {data.updatedAt?.toDate().toLocaleString()}
                </p>
              </div>
            )}
          </FieldGroup>

          <div className="flex flex-col gap-3">
            <FieldLabel>Map Image</FieldLabel>
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !displayImage && fileInputRef.current?.click()}
              className={`relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {displayImage ? (
                <>
                  <img
                    src={displayImage}
                    alt="Map image"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="bg-destructive text-destructive-foreground absolute top-2 right-2 rounded-full p-1"
                  >
                    <XIcon className="size-4" />
                  </button>
                </>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center">
                  <ImageIcon className="size-12 opacity-50" />
                  <p className="text-sm">
                    {isDragging
                      ? "Drop image here"
                      : "Drag & drop or click to upload"}
                  </p>
                </div>
              )}
              {isUploading && (
                <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                  <Loader className="size-4" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="mapImageUpload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
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
  const [mapId] = useQueryState(KEY)
  const [gameId] = useQueryState(MODAL_KEYS.MAPS_GALLERY_ID)

  if (!mapId || !gameId) return <LoadingModal modalKey={KEY} />

  return (
    <MapForm mapId={mapId} gameId={gameId} isNew={mapId === NEW_SEARCH_PARAM} />
  )
}

export default ModalMapId
