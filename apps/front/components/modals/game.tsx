"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CARD_RARITY, CARD_TYPE, STORAGE_PATHS } from "@repo/common"
import {
  cardPropertiesSchema,
  cardRaritySchema,
  createGameInputSchema,
} from "@repo/schemas"
import { X } from "lucide-react"
import { useQueryState } from "nuqs"
import { type KeyboardEvent, useEffect, useRef, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { type z } from "zod"
import Loader from "@/components/icons/loader"
import { LoadingModal, ModalBase } from "@/components/modals/base"
import { Badge } from "@/components/ui/badge"
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
import YoutubeEmbed from "@/components/youtube-embed"
import { BASE_FIREBASE_URL } from "@/constants/db"
import {
  MODAL_KEYS,
  NEW_SEARCH_PARAM,
  NO_CARD_RARITY,
} from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { Link } from "@/i18n/routing"
import { useGetCardsQuery, useSaveCardMutation } from "@/redux/api/cards"
import {
  useCreateGameMutation,
  useGetGameByIdQuery,
  useUpdateGameByIdMutation,
} from "@/redux/api/games"
import { selectIsAdmin } from "@/redux/session/session.selectors"
import { useAppSelector } from "@/redux/store"
import { getNextCardNumber } from "@/utils/card-number"
import { uploadFileToBucket } from "@/utils/file"

const gameFormSchema = createGameInputSchema.extend({
  cardProperties: cardPropertiesSchema.optional(),
})

type GameFormSchema = z.input<typeof gameFormSchema>

const KEY = MODAL_KEYS.GAME_ID

const GameForm = ({ gameId, isNew }: { gameId: string; isNew: boolean }) => {
  const { data, isLoading } = useGetGameByIdQuery(
    { id: gameId },
    { skip: isNew },
  )
  const { data: cards, isLoading: isLoadingCards } = useGetCardsQuery()
  const isAdmin = useAppSelector(selectIsAdmin)
  const gameCard = cards?.find(
    (card) => card.type === CARD_TYPE.GAME && card.gameId === gameId,
  )
  const [createGame, { isLoading: isCreating }] = useCreateGameMutation()
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameByIdMutation()
  const [saveCard, { isLoading: isSavingCard }] = useSaveCardMutation()
  const isSaving = isCreating || isUpdating || isSavingCard
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
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      midName: "",
      alternateNames: [],
      hasSphericalImagesReady: false,
      hasSpecialImagesReady: false,
      youtubeLink: "",
    },
  })

  const image = watch("image")
  const title = watch("title")
  const youtubeLink = watch("youtubeLink")
  const cardProperties = watch("cardProperties")

  useEffect(() => {
    if (data && cards) {
      reset({
        title: data.title,
        description: data.description ?? "",
        image: data.image ?? "",
        midName: data.midName ?? "",
        alternateNames: data.alternateNames || [],
        hasSphericalImagesReady: data.hasSphericalImagesReady ?? false,
        hasSpecialImagesReady: data.hasSpecialImagesReady ?? false,
        youtubeLink: data.youtubeLink ?? "",
        cardProperties: gameCard?.cardProperties,
      })
    }
  }, [data, cards, gameCard, reset])

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

  const onSubmit: SubmitHandler<GameFormSchema> = async (formData) => {
    const { cardProperties: submittedCardProperties, ...parsedData } =
      gameFormSchema.parse(formData)

    if (isNew) {
      const { data: createdGame, error } = await createGame(parsedData)

      if (error || !createdGame) return

      const { error: cardError } = await saveCard({
        card: undefined,
        gameId: createdGame.id,
        cardProperties: submittedCardProperties,
      })

      if (cardError) {
        toast.error("Game created, but its card was not saved")
        return
      }

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

      const { error: cardError } = await saveCard({
        card: gameCard,
        gameId,
        cardProperties: submittedCardProperties,
      })

      if (cardError) {
        toast.error("Game updated, but its card was not saved")
        return
      }

      toast.success("Game updated successfully")
    }
  }

  const isLoadingForm = isLoadingCards || (!isNew && isLoading)

  if (isLoadingForm) {
    return <LoadingModal modalKey={KEY} />
  }

  const hasMissingData = !cards || (!isNew && !data)
  const savingLabel = isNew ? "Creating" : "Saving"
  const submitLabel = isNew ? "Create Game" : "Save Changes"

  if (hasMissingData) {
    return (
      <ModalBase modalKey={KEY} title="Could not load this game">
        <p className="p-6">Close the modal and try again.</p>
      </ModalBase>
    )
  }

  return (
    <ModalBase modalKey={KEY} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
        <h2 className="mb-6 text-2xl font-bold">
          {isNew ? "Create Game" : "Edit Game"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          {/* Left column - Form fields */}
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                <FieldLabel htmlFor="alternateNames">
                  Alternate Names
                </FieldLabel>
                <Controller
                  name="alternateNames"
                  control={control}
                  render={({ field }) => {
                    const inputRef = useRef<HTMLInputElement>(null)
                    const addName = (value: string) => {
                      const trimmed = value.trim()
                      if (trimmed && !(field.value || []).includes(trimmed)) {
                        field.onChange([...(field.value || []), trimmed])
                      }
                    }
                    const removeName = (index: number) => {
                      field.onChange(
                        (field.value || []).filter(
                          (_: string, i: number) => i !== index,
                        ),
                      )
                    }
                    const handleKeyDown = (
                      e: KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addName(e.currentTarget.value)
                        e.currentTarget.value = ""
                      }
                      if (
                        e.key === "Backspace" &&
                        !e.currentTarget.value &&
                        (field.value || []).length > 0
                      ) {
                        removeName((field.value || []).length - 1)
                      }
                    }

                    return (
                      <div
                        className="border-input dark:bg-input/30 flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-2 py-1 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
                        onClick={() => inputRef.current?.focus()}
                      >
                        {(field.value || []).map(
                          (name: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="gap-1 pl-2 pr-1"
                            >
                              {name}
                              <button
                                type="button"
                                onClick={() => removeName(index)}
                                className="hover:bg-muted rounded-full p-0.5"
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ),
                        )}
                        <input
                          ref={inputRef}
                          id="alternateNames"
                          placeholder={
                            (field.value || []).length === 0
                              ? "Type and press Enter"
                              : ""
                          }
                          onKeyDown={handleKeyDown}
                          className="min-w-20 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                    )
                  }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="midName">Mid Name</FieldLabel>
                <Input
                  id="midName"
                  placeholder="Mid name"
                  {...register("midName")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="youtubeLink">youtubeLink</FieldLabel>
                <Input {...register("youtubeLink")} />
                {youtubeLink && (
                  <YoutubeEmbed youtubeLink={youtubeLink || ""} />
                )}
              </Field>
            </div>

            {isAdmin && (
              <>
                <Field>
                  <FieldLabel>Card rarity</FieldLabel>
                  <Select
                    value={cardProperties?.rarity || NO_CARD_RARITY}
                    onValueChange={handleCardRarityChange}
                  >
                    <SelectTrigger
                      data-testid={SELECTORS.GAME_FORM_CARD_RARITY}
                    >
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={NO_CARD_RARITY}
                        data-testid={SELECTORS.GAME_FORM_CARD_RARITY_OPTION(
                          NO_CARD_RARITY,
                        )}
                      >
                        Not a card
                      </SelectItem>
                      {Object.values(CARD_RARITY).map((rarity) => (
                        <SelectItem
                          key={rarity}
                          value={rarity}
                          data-testid={SELECTORS.GAME_FORM_CARD_RARITY_OPTION(
                            rarity,
                          )}
                        >
                          {rarity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Games without a rarity never drop from a pack
                  </FieldDescription>
                </Field>

                {cardProperties && (
                  <Field>
                    <FieldLabel htmlFor="card-number">Card number *</FieldLabel>
                    <Input
                      id="card-number"
                      type="number"
                      data-testid={SELECTORS.GAME_FORM_CARD_NUMBER}
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
                <Link href={`${BASE_FIREBASE_URL}/${gameId}/${data.id}`}>
                  <strong>Firebase link:</strong> {data.id}
                </Link>
                <p>
                  <strong>Created:</strong>{" "}
                  {data.createdAt?.toDate().toLocaleString()}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {data.updatedAt?.toDate().toLocaleString()}
                </p>
                <p>
                  Spherical images ready{" "}
                  {data.hasSphericalImagesReady ? "✅" : "❌"}
                </p>
                <p>
                  Specials images ready{" "}
                  {data.hasSpecialImagesReady ? "✅" : "❌"}
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
          {isNew && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={createMultiple === "true"}
                onCheckedChange={(checked) =>
                  setCreateMultiple(checked ? "true" : null)
                }
              />
              Create multiple
            </label>
          )}
          <Button
            type="submit"
            disabled={isSaving || !isDirty}
            data-testid={SELECTORS.GAME_FORM_SUBMIT}
          >
            {isSaving && (
              <>
                {savingLabel} <Loader />
              </>
            )}
            {!isSaving && submitLabel}
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
