"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DIFFICULTIES, DOCUMENTS_STATUS, STORAGE_PATHS } from "@repo/common"
import { createFlatInputSchema } from "@repo/schemas"
import { ArrowLeft } from "lucide-react"
import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useModal } from "@/hooks/use-modal"
import {
  useCreateFlatMutation,
  useGetFlatByIdQuery,
  useUpdateFlatByIdMutation,
} from "@/redux/api/flat"
import { useGetAllGamesNamesQuery } from "@/redux/api/games"
import { uploadFileToBucket } from "@/utils/file"

type FlatFormSchema = z.input<typeof createFlatInputSchema>

const KEY = MODAL_KEYS.FLAT_ID

export const parseFlatModalParam = (
  param: string | null,
): { gameId: string, flatId: string } | null => {
  if (!param) return null
  const separatorIndex = param.indexOf("_")
  if (separatorIndex === -1) return null
  const gameId = param.substring(0, separatorIndex)
  const flatId = param.substring(separatorIndex + 1)
  if (!gameId || !flatId) return null

  return { gameId, flatId }
}

export const buildFlatModalParam = (
  gameId: string,
  flatId: string,
): string => `${gameId}_${flatId}`

const DIFFICULTY_OPTIONS = Object.values(DIFFICULTIES)
const STATUS_OPTIONS = Object.values(DOCUMENTS_STATUS)

const FlatForm = ({
  flatId,
  gameId: initialGameId,
  isNew,
}: {
  flatId: string
  gameId: string
  isNew: boolean
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FlatFormSchema>({
    resolver: zodResolver(createFlatInputSchema),
    defaultValues: {
      gameId: initialGameId,
      image: "",
      difficulty: DIFFICULTIES.EASY,
      status: DOCUMENTS_STATUS.WAITING,
      thumbnail: "",
    },
  })

  const gameId = watch("gameId")
  const image = watch("image")
  const thumbnail = watch("thumbnail")

  const { openModal } = useModal(MODAL_KEYS.FLAT_GALLERY_ID, gameId)
  const { closeModal } = useModal(MODAL_KEYS.FLAT_ID, flatId)

  const { data: gamesData, isLoading: isGamesLoading } = useGetAllGamesNamesQuery()
  const { data, isLoading } = useGetFlatByIdQuery(
    { gameId, id: flatId },
    { skip: isNew || !gameId },
  )
  const [createFlat, { isLoading: isCreating }] = useCreateFlatMutation()
  const [updateFlat, { isLoading: isUpdating }] = useUpdateFlatByIdMutation()

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [, setModalParam] = useQueryState(KEY)

  useEffect(() => {
    if (data) {
      reset({
        gameId: data.gameId,
        image: data.image || "",
        difficulty: data.difficulty || DIFFICULTIES.EASY,
        status: data.status || DOCUMENTS_STATUS.WAITING,
        thumbnail: data.thumbnail || "",
      })
    }
  }, [data, reset])

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.FLAT_IMAGES,
        title: `flat-image-${gameId}`,
      })

      setValue("image", url, { shouldDirty: true })
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload image")
      throw error
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    setIsUploadingThumbnail(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.FLAT_THUMBNAILS,
        title: `flat-thumbnail-${gameId}`,
      })

      setValue("thumbnail", url, { shouldDirty: true })
      toast.success("Thumbnail uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload thumbnail")
      throw error
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const handleRemoveImage = () => {
    setValue("image", "", { shouldDirty: true })
  }

  const handleRemoveThumbnail = () => {
    setValue("thumbnail", "", { shouldDirty: true })
  }

  const onSubmit: SubmitHandler<FlatFormSchema> = async (formData) => {
    const parsedData = createFlatInputSchema.parse(formData)

    if (isNew) {
      const { data: createdFlat, error } = await createFlat({
        gameId,
        data: parsedData,
      })

      if (error) return

      toast.success("Flat created successfully")
      if (createdFlat?.id) {
        setModalParam(buildFlatModalParam(gameId, createdFlat.id))
      }
    } else {
      const { error } = await updateFlat({
        gameId,
        id: flatId,
        data: parsedData,
      })

      if (error) return

      toast.success("Flat updated successfully")
    }
  }

  const getBackToFlatGallery = () => {
    openModal()
    closeModal()
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={getBackToFlatGallery}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {isNew ? "Create Flat" : "Edit Flat"}
          </h2>
        </div>
        {isNew && (
          <Field className="mb-6">
            <FieldLabel htmlFor="gameId">Game</FieldLabel>
            <Controller
              name="gameId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isGamesLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {gamesData?.map((game) => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isGamesLoading && (
              <FieldDescription>Loading games...</FieldDescription>
            )}
            {!gameId && (
              <FieldDescription>Select a game to create the flat in</FieldDescription>
            )}
          </Field>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Image</FieldLabel>
              <FieldDescription>Main flat image</FieldDescription>
              <ImageDropzone
                imageUrl={image || null}
                onFileSelect={handleImageUpload}
                onRemove={handleRemoveImage}
                isUploading={isUploadingImage}
                alt="Flat image"
              />
              {errors.image && <FieldError>{errors.image.message}</FieldError>}
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Thumbnail</FieldLabel>
              <FieldDescription>Thumbnail preview image</FieldDescription>
              <ImageDropzone
                imageUrl={thumbnail || null}
                onFileSelect={handleThumbnailUpload}
                onRemove={handleRemoveThumbnail}
                isUploading={isUploadingThumbnail}
                alt="Flat thumbnail"
              />
              {errors.thumbnail && (
                <FieldError>{errors.thumbnail.message}</FieldError>
              )}
            </Field>
          </div>
        </div>

        <FieldGroup className="mt-6">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          {data && (
            <div className="text-muted-foreground mt-4 space-y-1 text-xs">
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

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating || !isDirty || (isNew && !gameId)}>
            {isCreating || isUpdating ? (
              <>
                {isNew ? "Creating" : "Saving"} <Loader />
              </>
            ) : isNew ? (
              "Create Flat"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}

export const ModalFlatId = () => {
  const [modalParam] = useQueryState(KEY)

  const parsed = parseFlatModalParam(modalParam)

  if (!parsed) return <LoadingModal modalKey={KEY} />

  const { gameId, flatId } = parsed
  const isNew = flatId === NEW_SEARCH_PARAM

  return <FlatForm flatId={flatId} gameId={gameId} isNew={isNew} />
}

export default ModalFlatId
