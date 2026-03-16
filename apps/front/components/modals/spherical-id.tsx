"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DIFFICULTIES, DOCUMENTS_STATUS, STORAGE_PATHS } from "@repo/common"
import { createSphericalInputSchema } from "@repo/schemas"
import { ArrowLeft, SquareArrowOutUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useQueryState } from "nuqs"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"
import Loader from "@/components/icons/loader"
import { MiniMap, type Position } from "@/components/mini-map"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { ReactSphere } from "@/components/providers/react-sphere"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import YoutubeEmbed from "@/components/youtube-embed"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { PAGES } from "@/constants/pages"
import { useModal } from "@/hooks/use-modal"
import { useGetAllGamesQuery } from "@/redux/api/games"
import { useGetMapsByGameIdQuery } from "@/redux/api/maps"
import { useCreateSocialFromSphericalIdMutation } from "@/redux/api/socials"
import {
  useCreateSphericalMutation,
  useGetSphericalByIdQuery,
  useUpdateSphericalByIdMutation,
} from "@/redux/api/spherical"
import { uploadFileToBucket } from "@/utils/file"

type SphericalFormSchema = z.input<typeof createSphericalInputSchema>

const KEY = MODAL_KEYS.EDIT_SPHERICAL_ID

// Helper to parse combined param format: "gameId_sphericalId" or just "new"
export const parseSphericalModalParam = (
  param: string | null,
): { gameId: string, sphericalId: string } | null => {
  if (!param) return null
  if (param === NEW_SEARCH_PARAM) return { gameId: "", sphericalId: NEW_SEARCH_PARAM }
  const separatorIndex = param.indexOf("_")
  if (separatorIndex === -1) return null
  const gameId = param.substring(0, separatorIndex)
  const sphericalId = param.substring(separatorIndex + 1)
  if (!gameId || !sphericalId) return null

  return { gameId, sphericalId }
}

// Helper to build combined param format: "gameId_sphericalId"
export const buildSphericalModalParam = (
  gameId: string,
  sphericalId: string,
): string => `${gameId}_${sphericalId}`

const DIFFICULTY_OPTIONS = Object.values(DIFFICULTIES)
const STATUS_OPTIONS = Object.values(DOCUMENTS_STATUS)
const NO_MAP_VALUE = "__none__"

const SphericalForm = ({
  sphericalId,
  gameId: initialGameId,
  isNew,
}: {
  sphericalId: string
  gameId: string
  isNew: boolean
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SphericalFormSchema>({
    resolver: zodResolver(createSphericalInputSchema),
    defaultValues: {
      gameId: initialGameId,
      image: "",
      mapId: "",
      mapPosition: { x: 50, y: 50 },
      difficulty: DIFFICULTIES.EASY,
      status: DOCUMENTS_STATUS.WAITING,
      thumbnail: "",
      youtubeLink: ""
    },
  })

  const gameId = watch("gameId")
  const image = watch("image")
  const selectedMapId = watch("mapId")
  const mapPosition = watch("mapPosition")
  const thumbnail = watch("thumbnail")
  const youtubeLink = watch("youtubeLink")

  const { openModal: openSphericalGallery } = useModal(MODAL_KEYS.SPHERICAL_GALLERY_ID, gameId)
  const { closeModal } = useModal(KEY, sphericalId)
  const { openModal } = useModal(MODAL_KEYS.MAP_ID, `${gameId}_${NEW_SEARCH_PARAM}`)

  const { data: gamesData, isLoading: isGamesLoading } = useGetAllGamesQuery()
  const { data, isLoading } = useGetSphericalByIdQuery(
    { gameId, id: sphericalId },
    { skip: isNew || !gameId },
  )

  const [createSocial] = useCreateSocialFromSphericalIdMutation()
  const [createSpherical, { isLoading: isCreating }] =
    useCreateSphericalMutation()
  const [updateSpherical, { isLoading: isUpdating }] =
    useUpdateSphericalByIdMutation()
  const { data: mapsData, isLoading: isMapsLoading } = useGetMapsByGameIdQuery(
    { gameId },
    { skip: !gameId },
  )

  const [isUploading, setIsUploading] = useState(false)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)
  const [, setModalParam] = useQueryState(KEY)

  const maps = mapsData ?? []

  const hasMapId = !!selectedMapId

  // Find the selected map
  const selectedMap = maps.find((map) => map.id === selectedMapId)

  // Map position picker display conditions
  const hasValidMapWithDimensions = !!selectedMap?.imageUrl && !!selectedMap.width && !!selectedMap.height
  const hasMapWithoutValidDimensions = hasMapId && !hasValidMapWithDimensions
  const shouldShowManualPositionInputs = !hasMapId

  // Handle map click to set position
  const handleMapClick = useCallback(
    (position: Position) => {
      setValue("mapPosition.x", Math.round(position.x * 100) / 100, {
        shouldDirty: true,
      })
      setValue("mapPosition.y", Math.round(position.y * 100) / 100, {
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const sortedGames = gamesData ? [...gamesData].sort((a, b) => a.title.localeCompare(b.title)) : []

  useEffect(() => {
    if (data) {
      reset({
        gameId: data.gameId,
        image: data.image || "",
        mapId: data.mapId || "",
        mapPosition: data.mapPosition || { x: 50, y: 50 },
        difficulty: data.difficulty || DIFFICULTIES.EASY,
        status: data.status || DOCUMENTS_STATUS.NEED_VERIFICATION,
        thumbnail: data.thumbnail || "",
        youtubeLink: data.youtubeLink || "",
      })
    }
  }, [data, reset])

  // Reset mapId when game changes (only for new items)
  const prevGameIdRef = useRef(gameId)
  useEffect(() => {
    if (isNew && gameId && prevGameIdRef.current !== gameId) {
      setValue("mapId", "", { shouldDirty: false })
    }
    prevGameIdRef.current = gameId
  }, [gameId, isNew, setValue])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.SPHERICALS,
        title: `spherical-${gameId}`,
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

  const handleThumbnailUpload = async (file: File) => {
    setIsThumbnailUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.SPHERICALS,
        title: `thumbnail-${gameId}`,
      })

      setValue("thumbnail", url, { shouldDirty: true })
      toast.success("Thumbnail uploaded successfully")
    } catch (error) {
      console.error("Thumbnail upload error:", error)
      toast.error("Failed to upload thumbnail")
      throw error
    } finally {
      setIsThumbnailUploading(false)
    }
  }

  const handleRemoveThumbnail = () => {
    setValue("thumbnail", "", { shouldDirty: true })
  }

  const onSubmit: SubmitHandler<SphericalFormSchema> = async (formData) => {
    const parsedData = createSphericalInputSchema.parse(formData)

    if (isNew) {
      const { data: createdSpherical, error } = await createSpherical({
        gameId,
        data: parsedData,
      })

      if (error) return

      toast.success("Spherical created successfully")
      if (createdSpherical?.id) {
        // Update URL to the new spherical's combined param
        setModalParam(buildSphericalModalParam(gameId, createdSpherical.id))
      }
    } else {
      const { error } = await updateSpherical({
        gameId,
        id: sphericalId,
        data: parsedData,
      })

      if (error) return

      toast.success("Spherical updated successfully")
    }
  }

  const handleCreateSocial = async () => {
    try {
      const { data: createdSocial } = await createSocial({
        sphericalId,
        gameId,
      })

      toast.success(`Social created successfully ${createdSocial?.id}`)
    } catch (error) {
      console.error("Error creating social from spherical ID:", error)
      toast.error("Failed to create social")
    }
  }

  const getBackToSphericalGallery = () => {
    openSphericalGallery()
    closeModal()
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8 ">
        <div className="flex mb-6 items-center gap-6">
          <Button variant="ghost" onClick={getBackToSphericalGallery}>
            <ArrowLeft className="size-4" />
          </Button>
          <h2 className=" text-2xl font-bold">
            {isNew ? "Create Spherical" : "Edit Spherical"}
          </h2>
          <Button onClick={() => {
            openModal()
            closeModal()
          }}
          >
            New map
          </Button>

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
                    {sortedGames?.map((game) => (
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
              <FieldDescription>Select a game to create the spherical in</FieldDescription>
            )}
          </Field>
        )}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="mapId">Map</FieldLabel>
                <Controller
                  name="mapId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || NO_MAP_VALUE}
                      onValueChange={(value) =>
                        field.onChange(value === NO_MAP_VALUE ? "" : value)}
                      disabled={isMapsLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No map selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_MAP_VALUE}>
                          No map selected
                        </SelectItem>
                        {maps.map((map) => (
                          <SelectItem key={map.id} value={map.id}>
                            {map.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {isMapsLoading && (
                  <FieldDescription>Loading maps...</FieldDescription>
                )}
              </Field>
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
            </div>

            {hasValidMapWithDimensions && selectedMap && (
              <div className="space-y-2">
                <FieldLabel>Position on Map</FieldLabel>
                <FieldDescription>
                  Click on the map to set the spherical position
                </FieldDescription>
                <MiniMap
                  inline
                  alwaysExpanded
                  mapData={{
                    mapImage: selectedMap.imageUrl!,
                    size: {
                      width: selectedMap.width!,
                      height: selectedMap.height!,
                    },
                  }}
                  guessPosition={mapPosition ?? null}
                  onMapClick={handleMapClick}
                  showCorrectMarker={false}
                  showLine={false}
                  expandedSize={{ width: 400, height: 250 }}
                  collapsedSize={{ width: 400, height: 250 }}
                  className="max-w-full"
                />
                <div className="bg-muted/50 rounded-md p-3 text-sm">
                  <p className="font-medium mb-1">Position to be stored:</p>
                  <div className="grid grid-cols-2 gap-2 text-muted-primary-foreground">
                    <p>
                      <strong>X:</strong> {mapPosition?.x?.toFixed(2) ?? "—"}%
                    </p>
                    <p>
                      <strong>Y:</strong> {mapPosition?.y?.toFixed(2) ?? "—"}%
                    </p>
                  </div>
                </div>
                {(errors.mapPosition?.x || errors.mapPosition?.y) && (
                  <FieldError>
                    {errors.mapPosition?.x?.message ||
                      errors.mapPosition?.y?.message}
                  </FieldError>
                )}
              </div>
            )}

            {hasMapWithoutValidDimensions && (
              <div className="bg-muted/30 rounded-md p-4 text-center text-sm text-muted-primary-foreground">
                <p>Selected map has no image or dimensions.</p>
                <p>
                  Upload an image to the map first to enable position picking.
                </p>
              </div>
            )}

            {shouldShowManualPositionInputs && (
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="mapPositionX">Map Position X</FieldLabel>
                  <Input
                    id="mapPositionX"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="X position (0-100)"
                    {...register("mapPosition.x", { valueAsNumber: true })}
                    aria-invalid={!!errors.mapPosition?.x}
                  />
                  <FieldDescription>Position X (0-100%)</FieldDescription>
                  {errors.mapPosition?.x && (
                    <FieldError>{errors.mapPosition.x.message}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="mapPositionY">Map Position Y</FieldLabel>
                  <Input
                    id="mapPositionY"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Y position (0-100)"
                    {...register("mapPosition.y", { valueAsNumber: true })}
                    aria-invalid={!!errors.mapPosition?.y}
                  />
                  <FieldDescription>Position Y (0-100%)</FieldDescription>
                  {errors.mapPosition?.y && (
                    <FieldError>{errors.mapPosition.y.message}</FieldError>
                  )}
                </Field>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
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
              <Field>
                <FieldLabel htmlFor="youtubeLink">YouTube Link</FieldLabel>
                <Input
                  {...register("youtubeLink")}
                  placeholder="https://www.youtube.com/watch?v=example"
                  aria-invalid={!!errors.youtubeLink}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
              {data && (
                <div className="text-muted-primary-foreground mt-2 space-y-1 text-xs">
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
              {youtubeLink && (
                <YoutubeEmbed youtubeLink={youtubeLink} className="h-12" />
              )}
            </div>
          </FieldGroup>

          <div className="flex flex-col gap-3">
            <Button variant="marathon-link" asChild>
              <Link href={`${PAGES.ADMIN_SPHERICAL_FULLSCREEN}/${gameId}/${sphericalId}`} target="_blank" className="flex gap-4 items-center cursor-pointer">
                Spherical Image <SquareArrowOutUpRight className="size-4" />
              </Link>
            </Button>
            <ImageDropzone
              imageUrl={image ?? null}
              onFileSelect={handleFileUpload}
              onRemove={handleRemoveImage}
              isUploading={isUploading}
              alt="Spherical image"
            />
            {image && (
              <div className="aspect-video w-full">
                <ReactSphere src={image} />
              </div>
            )}
            {errors.image && <FieldError>{errors.image.message}</FieldError>}
            <Field>
              <FieldLabel htmlFor="thumbnail">Thumbnail</FieldLabel>
              <ImageDropzone
                imageUrl={thumbnail || null}
                onFileSelect={handleThumbnailUpload}
                onRemove={handleRemoveThumbnail}
                isUploading={isThumbnailUploading}
                alt="Thumbnail image"
                className="aspect-square w-full"
              />
              {errors.thumbnail && (
                <FieldError>{errors.thumbnail.message}</FieldError>
              )}
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="marathon-outline" onClick={handleCreateSocial} type="button">Create Social</Button>
          <Button type="submit" disabled={isCreating || isUpdating || !isDirty || (isNew && !gameId)}>
            {isCreating || isUpdating ? (
              <>
                {isNew ? "Creating" : "Saving"} <Loader />
              </>
            ) : isNew ? (
              "Create Spherical"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}

export const ModalSphericalId = () => {
  const [modalParam] = useQueryState(KEY)

  const parsed = parseSphericalModalParam(modalParam)

  if (!parsed) return <LoadingModal modalKey={KEY} />

  const { gameId, sphericalId } = parsed
  const isNew = sphericalId === NEW_SEARCH_PARAM

  return (
    <SphericalForm sphericalId={sphericalId} gameId={gameId} isNew={isNew} />
  )
}

export default ModalSphericalId
