"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CARD_RARITY, CARD_TYPE } from "@repo/common"
import {
  type CardDocWithId,
  type CardFields,
  cardFieldsSchema,
} from "@repo/schemas"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { CardFieldsInputs } from "@/components/card-fields-inputs"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MODAL_KEYS } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useModal } from "@/hooks/use-modal"
import { useGetCardsQuery, useSaveCardMutation } from "@/redux/api/cards"
import { useGetAllGamesQuery } from "@/redux/api/games"
import { useGetMapsByGameIdQuery } from "@/redux/api/maps"
import { getNextCardNumber } from "@/utils/card-number"

const KEY = MODAL_KEYS.NEW_CARD
const CREATE_ERROR_MESSAGE = "Could not create the card"

const cardTypeSchema = z.enum(CARD_TYPE)

type CardType = z.infer<typeof cardTypeSchema>

const NewCardForm = ({ cards }: { cards: CardDocWithId[] }) => {
  const { closeModal } = useModal(KEY)
  const [type, setType] = useState<CardType>(CARD_TYPE.MAP)
  const [gameId, setGameId] = useState("")
  const [mapId, setMapId] = useState("")
  const isMapCard = type === CARD_TYPE.MAP
  const shouldSkipMaps = !gameId || !isMapCard
  const { data: games } = useGetAllGamesQuery()
  const { data: maps } = useGetMapsByGameIdQuery(
    { gameId },
    { skip: shouldSkipMaps },
  )
  const [saveCard, { isLoading }] = useSaveCardMutation()
  const form = useForm<CardFields>({
    resolver: zodResolver(cardFieldsSchema),
    defaultValues: {
      rarity: CARD_RARITY.COMMON,
      number: getNextCardNumber(cards),
    },
  })

  const cardedMapIds = new Set(
    cards.flatMap((card) => (card.type === CARD_TYPE.MAP ? [card.mapId] : [])),
  )
  const cardlessMaps = maps?.filter(({ id }) => !cardedMapIds.has(id)) || []
  const hasGameCard = cards.some(
    (card) => card.type === CARD_TYPE.GAME && card.gameId === gameId,
  )
  const isGameCardTaken = !isMapCard && hasGameCard
  const isSubjectMissing = !gameId || (isMapCard && !mapId)
  const isSubmitDisabled = isLoading || isSubjectMissing || isGameCardTaken

  const handleTypeChange = (value: string) => {
    const cardType = cardTypeSchema.safeParse(value).data
    if (!cardType) return

    setType(cardType)
    setMapId("")
  }

  const handleGameChange = (value: string) => {
    setGameId(value)
    setMapId("")
  }

  const onSubmit: SubmitHandler<CardFields> = async (cardFields) => {
    const { error } = await saveCard({
      card: undefined,
      gameId,
      mapId: isMapCard ? mapId : undefined,
      cardFields,
    })

    if (error) {
      toast.error(CREATE_ERROR_MESSAGE)
      return
    }

    toast.success("Card created")
    closeModal()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <Field>
        <FieldLabel>Type</FieldLabel>
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger data-testid={SELECTORS.CARD_FORM_TYPE}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CARD_TYPE).map((cardType) => (
              <SelectItem
                key={cardType}
                value={cardType}
                data-testid={SELECTORS.CARD_FORM_TYPE_OPTION(cardType)}
              >
                {cardType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Game</FieldLabel>
        <Select value={gameId} onValueChange={handleGameChange}>
          <SelectTrigger data-testid={SELECTORS.CARD_FORM_GAME}>
            <SelectValue placeholder="Select a game" />
          </SelectTrigger>
          <SelectContent>
            {games?.map((game) => (
              <SelectItem
                key={game.id}
                value={game.id}
                data-testid={SELECTORS.CARD_FORM_GAME_OPTION(game.id)}
              >
                {game.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isGameCardTaken && (
          <FieldError>This game already has a card</FieldError>
        )}
      </Field>
      {isMapCard && (
        <Field>
          <FieldLabel>Map</FieldLabel>
          <Select value={mapId} onValueChange={setMapId} disabled={!gameId}>
            <SelectTrigger data-testid={SELECTORS.CARD_FORM_MAP}>
              <SelectValue placeholder="Select a map without a card" />
            </SelectTrigger>
            <SelectContent>
              {cardlessMaps.map((map) => (
                <SelectItem
                  key={map.id}
                  value={map.id}
                  data-testid={SELECTORS.CARD_FORM_MAP_OPTION(map.id)}
                >
                  {map.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <CardFieldsInputs form={form} />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="marathon-outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          data-testid={SELECTORS.CARD_FORM_SUBMIT}
        >
          {isLoading && "Creating..."}
          {!isLoading && "Create"}
        </Button>
      </div>
    </form>
  )
}

export const NewCard = () => {
  const { data: cards } = useGetCardsQuery()

  return (
    <ModalBase modalKey={KEY} title="New Card" className="lg:max-w-2xl">
      {!cards && <p className="text-muted-foreground">Loading cards...</p>}
      {cards && <NewCardForm cards={cards} />}
    </ModalBase>
  )
}
