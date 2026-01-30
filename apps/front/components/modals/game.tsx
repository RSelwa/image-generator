"use client"

import Loader from "@/components/icons/loader"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  useCreateGameMutation,
  useGetGameByIdQuery,
  useUpdateGameByIdMutation,
} from "@/redux/api/games"
import { uploadFileToBucket } from "@/utils/file"
import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS } from "@repo/common"
import { createGameInputSchema } from "@repo/schemas"
import { ImageIcon, UploadIcon, XIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useRef, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

type GameFormSchema = z.input<typeof createGameInputSchema>

const KEY = MODAL_KEYS.GAME_ID

const GameForm = ({ gameId, isNew }: { gameId: string; isNew: boolean }) => {
  const { data, isLoading } = useGetGameByIdQuery(
    { id: gameId },
    { skip: isNew },
  )
  const [createGame, { isLoading: isCreating }] = useCreateGameMutation()
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameByIdMutation()
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, setGameId] = useQueryState(KEY)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<GameFormSchema>({
    resolver: zodResolver(createGameInputSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnailUrl: "",
      storageImage: "",
      midName: "",
      alternateName: "",
      hasSphericalImagesReady: false,
      hasSpecialImagesReady: false,
    },
  })

  const storageImage = watch("storageImage")
  const title = watch("title")

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description ?? "",
        thumbnailUrl: data.thumbnailUrl ?? "",
        storageImage: data.storageImage ?? "",
        midName: data.midName ?? "",
        alternateName: data.alternateName ?? "",
        hasSphericalImagesReady: data.hasSphericalImagesReady ?? false,
        hasSpecialImagesReady: data.hasSpecialImagesReady ?? false,
      })
    }
  }, [data, reset])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload via proxy API using FormData
    setIsUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.GAME_THUMBNAILS,
        title: title,
      })

      setValue("storageImage", url, { shouldDirty: true })
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
    setValue("storageImage", "", { shouldDirty: true })
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit: SubmitHandler<GameFormSchema> = async (formData) => {
    // Parse through schema to apply defaults
    const parsedData = createGameInputSchema.parse(formData)

    if (isNew) {
      const { data: createdGame, error } = await createGame(parsedData)

      if (error) return

      toast.success("Game created successfully")
      // Redirect to the created game's edit page
      if (createdGame?.id) {
        setGameId(createdGame.id)
      }
    } else {
      const { error } = await updateGame({ id: gameId, data: parsedData })

      if (error) return

      toast.success("Game updated successfully")
    }
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  const displayImage = previewUrl || storageImage

  return (
    <ModalBase modalKey={KEY} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <h2 className="mb-6 text-2xl font-bold">
          {isNew ? "Create Game" : "Edit Game"}
        </h2>

        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Left column - Form fields */}
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="title">Title *</FieldLabel>
                <Input
                  id="title"
                  placeholder="Game title"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="alternateName">Alternate Name</FieldLabel>
                <Input
                  id="alternateName"
                  placeholder="Alternate name"
                  {...register("alternateName")}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="Game description (max 500 characters)"
                {...register("description")}
                aria-invalid={!!errors.description}
              />
              <FieldDescription>
                Optional description for the game (max 500 characters)
              </FieldDescription>
              {errors.description && (
                <FieldError>{errors.description.message}</FieldError>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="midName">Mid Name</FieldLabel>
                <Input
                  id="midName"
                  placeholder="Mid name"
                  {...register("midName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="thumbnailUrl">Thumbnail URL</FieldLabel>
                <Input
                  id="thumbnailUrl"
                  placeholder="https://..."
                  {...register("thumbnailUrl")}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field orientation="horizontal">
                <Controller
                  name="hasSphericalImagesReady"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasSphericalImagesReady"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="hasSphericalImagesReady">
                  Spherical Images Ready
                </FieldLabel>
              </Field>

              <Field orientation="horizontal">
                <Controller
                  name="hasSpecialImagesReady"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="hasSpecialImagesReady"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="hasSpecialImagesReady">
                  Special Images Ready
                </FieldLabel>
              </Field>
            </div>

            {data && (
              <div className="text-muted-foreground mt-2 space-y-1 text-xs">
                <p>
                  <strong>ID:</strong> {data.id}
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

          {/* Right column - Image upload */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Game Image</FieldLabel>
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
                    alt="Game thumbnail"
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
              id="imageUpload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <UploadIcon className="mr-2 size-4" />
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
              "Create Game"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}

export const ModalGame = () => {
  const [gameId] = useQueryState(KEY)

  if (!gameId) return <LoadingModal modalKey={KEY} />

  return <GameForm gameId={gameId} isNew={gameId === NEW_SEARCH_PARAM} />
}
