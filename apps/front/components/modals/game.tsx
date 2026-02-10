"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { STORAGE_PATHS } from "@repo/common"
import { createGameInputSchema } from "@repo/schemas"
import Link from "next/link"
import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"
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
import { ImageDropzone } from "@/components/ui/image-dropzone"
import { Input } from "@/components/ui/input"
import { BASE_FIREBASE_URL } from "@/constants/db"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import {
  useCreateGameMutation,
  useGetGameByIdQuery,
  useUpdateGameByIdMutation,
} from "@/redux/api/games"
import { uploadFileToBucket } from "@/utils/file"

type GameFormSchema = z.input<typeof createGameInputSchema>

const KEY = MODAL_KEYS.GAME_ID

const GameForm = ({ gameId, isNew }: { gameId: string, isNew: boolean }) => {
  const { data, isLoading } = useGetGameByIdQuery(
    { id: gameId },
    { skip: isNew },
  )
  const [createGame, { isLoading: isCreating }] = useCreateGameMutation()
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameByIdMutation()
  const [isUploading, setIsUploading] = useState(false)
  const [createMultiple, setCreateMultiple] = useQueryState("createMultiple")
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
      image: "",
      midName: "",
      alternateName: "",
      hasSphericalImagesReady: false,
      hasSpecialImagesReady: false,
    },
  })

  const image = watch("image")
  const title = watch("title")

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        description: data.description ?? "",
        image: data.image ?? "",
        midName: data.midName ?? "",
        alternateName: data.alternateName ?? "",
        hasSphericalImagesReady: data.hasSphericalImagesReady ?? false,
        hasSpecialImagesReady: data.hasSpecialImagesReady ?? false,
      })
    }
  }, [data, reset])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.GAME_THUMBNAILS,
        title,
      })

      setValue("image", url, { shouldDirty: true })
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
    setValue("image", "", { shouldDirty: true })
  }

  const onSubmit: SubmitHandler<GameFormSchema> = async (formData) => {
    // Parse through schema to apply defaults
    const parsedData = createGameInputSchema.parse(formData)

    if (isNew) {
      const { error } = await createGame(parsedData)

      if (error) return

      toast.success("Game created successfully")

      if (createMultiple === "true") {
        // Reset form to create another game
        reset()
      } else {
        // Close modal
        setGameId(null)
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
              <div className="text-muted-primary-foreground mt-2 space-y-1 text-xs">
                <p>
                  <strong>ID:</strong> {data.id}
                </p>
                <Link href={`${BASE_FIREBASE_URL}/${gameId}/${data.id}`}>
                  <strong>Firebase link:</strong> {data.id}
                </Link>
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

          {/* Right column - Image upload */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Game Image</FieldLabel>
            <ImageDropzone
              imageUrl={image ?? null}
              onFileSelect={handleFileUpload}
              onRemove={handleRemoveImage}
              isUploading={isUploading}
              alt="Game thumbnail"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {isNew ? (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={createMultiple === "true"}
                onCheckedChange={(checked) =>
                  setCreateMultiple(checked ? "true" : null)}
              />
              Create multiple
            </label>
          ) : (
            <div />
          )}
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
