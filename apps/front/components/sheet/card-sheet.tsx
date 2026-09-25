"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type CardProperties, cardPropertiesSchema } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { CardPropertiesFields } from "@/components/card-properties-fields"
import { EmptySheet } from "@/components/sheet/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { QUERY_PARAMS } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useSaveCardMutation } from "@/redux/api/cards"
import { type AdminCardRow } from "@/utils/admin-card-rows"
import { formatCardNumber } from "@/utils/card-number"

const CardForm = ({ row }: { row: AdminCardRow }) => {
  const { card } = row
  const [, setCardId] = useQueryState(QUERY_PARAMS.CARD_ID)
  const [saveCard, { isLoading }] = useSaveCardMutation()
  const form = useForm<CardProperties>({
    resolver: zodResolver(cardPropertiesSchema),
    defaultValues: card.cardProperties,
  })

  const onSubmit: SubmitHandler<CardProperties> = async (cardProperties) => {
    const { error } = await saveCard({
      card,
      gameId: card.gameId,
      cardProperties,
    })

    if (error) {
      toast.error("Could not save the card")
      return
    }

    toast.success("Card saved")
  }

  const handleDelete = async () => {
    const { error } = await saveCard({
      card,
      gameId: card.gameId,
      cardProperties: undefined,
    })

    if (error) {
      toast.error("Could not delete the card")
      return
    }

    setCardId(null)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col h-full"
    >
      <SheetHeader>
        <SheetTitle>
          {formatCardNumber(card.cardProperties.number)} -{" "}
          {row.name || `Missing ${card.type}`}
        </SheetTitle>
        <SheetDescription>
          {card.type} card of {row.gameTitle || card.gameId}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <CardPropertiesFields form={form} />
      </div>

      <SheetFooter>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid={SELECTORS.CARD_FORM_SUBMIT}
        >
          {isLoading && "Saving..."}
          {!isLoading && "Save"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="marathon-destructive"
              data-testid={SELECTORS.CARD_DELETE}
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this card?</AlertDialogTitle>
              <AlertDialogDescription>
                It stops dropping from packs. Users who pulled it keep their
                copy. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="marathon-outline" asChild>
                <Button>No, keep it</Button>
              </AlertDialogCancel>
              <AlertDialogAction
                variant="marathon-destructive"
                asChild
                onClick={handleDelete}
              >
                <Button data-testid={SELECTORS.CARD_DELETE_CONFIRM}>
                  Yes, delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetFooter>
    </form>
  )
}

export const CardSheet = ({ rows }: { rows: AdminCardRow[] }) => {
  const [cardId, setCardId] = useQueryState(QUERY_PARAMS.CARD_ID)
  const row = rows.find(({ card }) => card.id === cardId)

  return (
    <Sheet
      open={Boolean(cardId)}
      onOpenChange={(open) => !open && setCardId(null)}
    >
      {!row && <EmptySheet />}
      {row && (
        <SheetContent className="flex flex-col">
          <CardForm key={row.card.id} row={row} />
        </SheetContent>
      )}
    </Sheet>
  )
}
