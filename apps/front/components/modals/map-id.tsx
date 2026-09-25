"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CARD_RARITY,
  CARD_TYPE,
  DEFAULT_MAX_DISTANCE_POINTS,
  STORAGE_PATHS,
} from "@repo/common"
import {
  cardPropertiesSchema,
  cardRaritySchema,
  createMapInputSchema,
} from "@repo/schemas"
import { ArrowLeft } from "lucide-react"
import { useQueryState } from "nuqs"
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  MODAL_KEYS,
  NEW_SEARCH_PARAM,
  NO_CARD_RARITY,
} from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useModal } from "@/hooks/use-modal"
import { useGetCardsQuery, useSaveCardMutation } from "@/redux/api/cards"
import {
  useCreateMapMutation,
  useGetMapByIdQuery,
  useUpdateMapByIdMutation,
} from "@/redux/api/maps"
import { selectIsAdmin } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getNextCardNumber } from "@/utils/card-number"
import { uploadFileToBucket } from "@/utils/file"

const mapFormSchema = createMapInputSchema.extend({
  cardProperties: cardPropertiesSchema.optional(),
})

type MapFormSchema = z.input<typeof mapFormSchema>

const KEY = MODAL_KEYS.MAP_ID

// Helper to parse combined param format: "parentId_childId"
export const parseSubcollectionParam = (
  param: string | null,
): { parentId: string; childId: string } | null => {
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
  const { data: cards, isLoading: isLoadingCards } = useGetCardsQuery()
  const isAdmin = useAppSelector(selectIsAdmin)
  const mapCard = cards?.find(
    (card) => card.type === CARD_TYPE.MAP && card.mapId === mapId,
  )
  const [createMap, { isLoading: isCreating }] = useCreateMapMutation()
  const [updateMap, { isLoading: isUpdating }] = useUpdateMapByIdMutation()
  const [saveCard, { isLoading: isSavingCard }] = useSaveCardMutation()
  const isSaving = isCreating || isUpdating || isSavingCard
  const [isUploading, setIsUploading] = useState(false)
  const [clickPosition, setClickPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [, setModalParam] = useQueryState(KEY)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<MapFormSchema>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      name: "",
      imageUrl: null,
      width: null,
      height: null,
      maxDistancePoints: DEFAULT_MAX_DISTANCE_POINTS,
      gameId,
    },
  })

  const imageUrl = watch("imageUrl")
  const name = watch("name")
  const maxDistancePoints = watch("maxDistancePoints")
  const cardProperties = watch("cardProperties")

  const handleOverlayClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return
    const rect = overlayRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setClickPosition({ x, y })
  }, [])

  useEffect(() => {
    if (data && cards) {
      reset({
        name: data.name,
        imageUrl: data.imageUrl ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        maxDistancePoints:
          data.maxDistancePoints ?? DEFAULT_MAX_DISTANCE_POINTS,
        gameId: data.gameId,
        cardProperties: mapCard?.cardProperties,
      })
    }
  }, [data, cards, mapCard, reset])

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

  const handleCardRarityChange = (value: string) => {
    const rarity = cardRaritySchema.safeParse(value).data

    setValue(
      "cardProperties",
      rarity && {
        rarity,
        number: cardProperties?.number || getNextCardNumber(cards || []),
      },
      { shouldDirty: true },
    )
  }

  const handleRemoveImage = () => {
    setValue("imageUrl", null, { shouldDirty: true })
  }

  const onSubmit: SubmitHandler<MapFormSchema> = async (formData) => {
    const { cardProperties: submittedCardProperties, ...mapInput } =
      mapFormSchema.parse(formData)

    if (isNew) {
      const { data: createdMap, error } = await createMap({
        gameId,
        data: mapInput,
      })

      if (error || !createdMap) return

      const { error: cardError } = await saveCard({
        card: undefined,
        gameId,
        mapId: createdMap.id,
        cardProperties: submittedCardProperties,
      })
      setModalParam(buildSubcollectionParam(gameId, createdMap.id))

      if (cardError) {
        toast.error("Map created, but its card was not saved")
        return
      }

      toast.success("Map created successfully")
    } else {
      const { error } = await updateMap({
        gameId,
        id: mapId,
        data: mapInput,
      })

      if (error) return

      const { error: cardError } = await saveCard({
        card: mapCard,
        gameId,
        mapId,
        cardProperties: submittedCardProperties,
      })

      if (cardError) {
        toast.error("Map updated, but its card was not saved")
        return
      }

      toast.success("Map updated successfully")
    }
  }

  const getBackToMapGallery = () => {
    openModal()
    closeModal()
  }

  const isLoadingForm = isLoadingCards || (!isNew && isLoading)

  if (isLoadingForm) {
    return <LoadingModal modalKey={KEY} />
  }

  const hasMissingData = !cards || (!isNew && !data)

  if (hasMissingData) {
    return (
      <ModalBase modalKey={KEY} title="Could not load this map">
        <p className="p-6">Close the modal and try again.</p>
      </ModalBase>
    )
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

            <Field>
              <FieldLabel>
                Max Distance Points ({maxDistancePoints || 0}%)
              </FieldLabel>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[maxDistancePoints || 0]}
                onValueChange={([val]) =>
                  setValue("maxDistancePoints", val, { shouldDirty: true })
                }
              />
              <FieldDescription>
                Max distance (%) beyond which player gets 0 points
              </FieldDescription>
              {errors.maxDistancePoints && (
                <FieldError>{errors.maxDistancePoints.message}</FieldError>
              )}
            </Field>

            {isAdmin && (
              <>
                <Field>
                  <FieldLabel>Card rarity</FieldLabel>
                  <Select
                    value={cardProperties?.rarity || NO_CARD_RARITY}
                    onValueChange={handleCardRarityChange}
                  >
                    <SelectTrigger data-testid={SELECTORS.MAP_FORM_CARD_RARITY}>
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={NO_CARD_RARITY}
                        data-testid={SELECTORS.MAP_FORM_CARD_RARITY_OPTION(
                          NO_CARD_RARITY,
                        )}
                      >
                        Not a card
                      </SelectItem>
                      {Object.values(CARD_RARITY).map((rarity) => (
                        <SelectItem
                          key={rarity}
                          value={rarity}
                          data-testid={SELECTORS.MAP_FORM_CARD_RARITY_OPTION(
                            rarity,
                          )}
                        >
                          {rarity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Maps without a rarity never drop from a pack
                  </FieldDescription>
                </Field>

                {cardProperties && (
                  <Field>
                    <FieldLabel htmlFor="card-number">Card number *</FieldLabel>
                    <Input
                      id="card-number"
                      type="number"
                      data-testid={SELECTORS.MAP_FORM_CARD_NUMBER}
                      {...register("cardProperties.number", {
                        valueAsNumber: true,
                      })}
                      aria-invalid={!!errors.cardProperties?.number}
                    />
                    <FieldDescription>
                      Unique number of the card in the collection
                    </FieldDescription>
                    {errors.cardProperties?.number && (
                      <FieldError>
                        {errors.cardProperties.number.message}
                      </FieldError>
                    )}
                  </Field>
                )}
              </>
            )}

            {data && (
              <div className="text-muted-primary-foreground mt-2 space-y-1 text-xs">
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
            <div className="relative">
              <ImageDropzone
                imageUrl={imageUrl ?? null}
                onFileSelect={handleFileUpload}
                onRemove={handleRemoveImage}
                isUploading={isUploading}
                alt="Map image"
              />
              {imageUrl && (
                <div
                  ref={overlayRef}
                  className="absolute inset-0 cursor-crosshair"
                  onClick={handleOverlayClick}
                >
                  {clickPosition && maxDistancePoints && (
                    <svg className="absolute inset-0 size-full overflow-visible pointer-events-none">
                      <circle
                        cx={`${clickPosition.x}%`}
                        cy={`${clickPosition.y}%`}
                        r={`${maxDistancePoints}%`}
                        fill="rgba(239, 68, 68, 0.2)"
                        stroke="rgba(239, 68, 68, 0.6)"
                        strokeWidth={1}
                      />
                      <circle
                        cx={`${clickPosition.x}%`}
                        cy={`${clickPosition.y}%`}
                        r={`${(maxDistancePoints * 2) / 3}%`}
                        fill="rgba(234, 179, 8, 0.25)"
                        stroke="rgba(234, 179, 8, 0.6)"
                        strokeWidth={1}
                      />
                      <circle
                        cx={`${clickPosition.x}%`}
                        cy={`${clickPosition.y}%`}
                        r={`${maxDistancePoints / 3}%`}
                        fill="rgba(34, 197, 94, 0.3)"
                        stroke="rgba(34, 197, 94, 0.6)"
                        strokeWidth={1}
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            data-testid={SELECTORS.MAP_FORM_SUBMIT}
          >
            {isSaving ? (
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
