"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DIFFICULTIES, DOCUMENTS_STATUS, STORAGE_PATHS } from "@repo/common"
import { createSphericalInputSchema } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { useCallback, useEffect, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"
import Loader from "@/components/icons/loader"
import { MiniMap, type Position } from "@/components/mini-map"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { ReactSphere } from "@/components/providers/react-sphere"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODAL_KEYS, NEW_SEARCH_PARAM } from "@/constants/mapping"
import { useGetMapsInfiniteQuery } from "@/redux/api/maps"
import {
  useCreateSphericalMutation,
  useGetSphericalByIdQuery,
  useUpdateSphericalByIdMutation,
} from "@/redux/api/spherical"
import { uploadFileToBucket } from "@/utils/file"

type SphericalFormSchema = z.input<typeof createSphericalInputSchema>

const KEY = MODAL_KEYS.SPHERICAL_ID

// Helper to parse combined param format: "gameId_sphericalId"
export function parseSphericalModalParam(
  param: string | null,
): { gameId: string, sphericalId: string } | null {
  if (!param) return null
  const separatorIndex = param.indexOf("_")
  if (separatorIndex === -1) return null
  const gameId = param.substring(0, separatorIndex)
  const sphericalId = param.substring(separatorIndex + 1)
  if (!gameId || !sphericalId) return null

  return { gameId, sphericalId }
}

// Helper to build combined param format: "gameId_sphericalId"
export function buildSphericalModalParam(
  gameId: string,
  sphericalId: string,
): string {
  return `${gameId}_${sphericalId}`
}

const DIFFICULTY_OPTIONS = Object.values(DIFFICULTIES)
const STATUS_OPTIONS = Object.values(DOCUMENTS_STATUS)
const NO_MAP_VALUE = "__none__"

function SphericalForm({
  sphericalId,
  gameId,
  isNew,
}: {
  sphericalId: string
  gameId: string
  isNew: boolean
}) {
  const { data, isLoading } = useGetSphericalByIdQuery(
    { gameId, id: sphericalId },
    { skip: isNew },
  )
  const [createSpherical, { isLoading: isCreating }] =
    useCreateSphericalMutation()
  const [updateSpherical, { isLoading: isUpdating }] =
    useUpdateSphericalByIdMutation()
  const { data: mapsData, isLoading: isMapsLoading } = useGetMapsInfiniteQuery({
    gameId,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [, setModalParam] = useQueryState(KEY)

  const maps = mapsData?.pages.flat() ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<SphericalFormSchema>({
    resolver: zodResolver(createSphericalInputSchema),
    defaultValues: {
      gameRef: `games/${gameId}`,
      gameId,
      image: "",
      storageImage: "",
      mapId: "",
      mapPosition: { x: 50, y: 50 },
      difficulty: DIFFICULTIES.EASY,
      status: DOCUMENTS_STATUS.NEED_VERIFICATION,
      isValid: false,
      mosaics: [],
    },
  })

  const storageImage = watch("storageImage")
  const selectedMapId = watch("mapId")
  const mapPosition = watch("mapPosition")

  // Find the selected map
  const selectedMap = maps.find((map) => map.id === selectedMapId)

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

  useEffect(() => {
    if (data) {
      reset({
        gameRef: data.gameRef,
        gameId: data.gameId,
        image: data.image ?? "",
        storageImage: data.storageImage ?? "",
        mapId: data.mapId ?? "",
        mapPosition: data.mapPosition ?? { x: 50, y: 50 },
        difficulty: data.difficulty ?? DIFFICULTIES.EASY,
        status: data.status ?? DOCUMENTS_STATUS.NEED_VERIFICATION,
        isValid: data.isValid ?? false,
        mosaics: data.mosaics ?? [],
      })
    }
  }, [data, reset])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    try {
      const { url } = await uploadFileToBucket({
        file,
        bucketPath: STORAGE_PATHS.SPHERICALS,
        title: `spherical-${gameId}`,
      })

      setValue("storageImage", url, { shouldDirty: true })
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
    setValue("storageImage", "", { shouldDirty: true })
    setValue("image", "", { shouldDirty: true })
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
      // Only include image fields if they were actually changed
      const { image, storageImage, ...rest } = parsedData
      const updateData = {
        ...rest,
        ...(dirtyFields.image && { image }),
        ...(dirtyFields.storageImage && { storageImage }),
      }

      const { error } = await updateSpherical({
        gameId,
        id: sphericalId,
        data: updateData,
      })

      if (error) return

      toast.success("Spherical updated successfully")
    }
  }

  if (!isNew && isLoading) {
    return <LoadingModal modalKey={KEY} />
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <h2 className="mb-6 text-2xl font-bold">
          {isNew ? "Create Spherical" : "Edit Spherical"}
        </h2>

        <div className="grid grid-cols-[1fr_220px] gap-6">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
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

            {/* Map Position Picker */}
            {selectedMap?.imageUrl &&
              selectedMap.width &&
              selectedMap.height ? (
                  <div className="space-y-2">
                    <FieldLabel>Position on Map</FieldLabel>
                    <FieldDescription>
                      Click on the map to set the spherical position
                    </FieldDescription>
                    <MiniMap
                      inline
                      alwaysExpanded
                      mapData={{
                        mapImage: selectedMap.imageUrl,
                        size: {
                          width: selectedMap.width,
                          height: selectedMap.height,
                        },
                      }}
                      guessPosition={mapPosition ?? null}
                      onMapClick={handleMapClick}
                      showCorrectMarker={false}
                      showLine={false}
                      expandedSize={{ width: 400, height: 250 }}
                      collapsedSize={{ width: 400, height: 250 }}
                    />
                    <div className="bg-muted/50 rounded-md p-3 text-sm">
                      <p className="font-medium mb-1">Position to be stored:</p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
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
                ) : selectedMapId ? (
                  <div className="bg-muted/30 rounded-md p-4 text-center text-sm text-muted-foreground">
                    <p>Selected map has no image or dimensions.</p>
                    <p>
                      Upload an image to the map first to enable position picking.
                    </p>
                  </div>
                ) : (
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

            <div className="grid grid-cols-2 gap-2">
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
              <Field orientation="horizontal" className="items-end pb-2">
                <Controller
                  name="isValid"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isValid"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="isValid">Is Valid</FieldLabel>
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
            <FieldLabel>Spherical Image</FieldLabel>
            <ImageDropzone
              imageUrl={storageImage ?? null}
              onFileSelect={handleFileUpload}
              onRemove={handleRemoveImage}
              isUploading={isUploading}
              alt="Spherical image"
            />
            {storageImage && (
              <div className="aspect-video w-full">
                <ReactSphere src={storageImage} />
              </div>
            )}
            {errors.image && <FieldError>{errors.image.message}</FieldError>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" disabled={isCreating || isUpdating || !isDirty}>
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

export function ModalSphericalId() {
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
