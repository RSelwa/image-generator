"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type AchievementDoc, achievementDocSchema } from "@repo/schemas"
import { useQueryState } from "nuqs"
import { type SubmitHandler, useForm } from "react-hook-form"
import { AchievementFormFields } from "@/components/achievement-form-fields"
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
import {
  useDeleteAchievementMutation,
  useGetAchievementByKeyQuery,
  useUpdateAchievementMutation,
} from "@/redux/api/achievements"

const AchievementForm = ({ achievement }: { achievement: AchievementDoc }) => {
  const [, setAchievementKey] = useQueryState(QUERY_PARAMS.ACHIEVEMENT_KEY)
  const [updateAchievement, { isLoading }] = useUpdateAchievementMutation()
  const [deleteAchievement] = useDeleteAchievementMutation()
  const form = useForm<AchievementDoc>({
    resolver: zodResolver(achievementDocSchema),
    defaultValues: achievement,
  })

  const onSubmit: SubmitHandler<AchievementDoc> = async (data) => {
    await updateAchievement({ ...data, key: achievement.key })
  }

  const handleDelete = async () => {
    await deleteAchievement({ key: achievement.key })
    setAchievementKey(null)
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col h-full"
    >
      <SheetHeader>
        <SheetTitle>Achievement</SheetTitle>
        <SheetDescription>{achievement.key}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <AchievementFormFields form={form} isKeyReadOnly />
      </div>

      <SheetFooter>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid={SELECTORS.ACHIEVEMENT_FORM_SUBMIT}
        >
          {isLoading && "Saving..."}
          {!isLoading && "Save"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="marathon-destructive"
              data-testid={SELECTORS.ACHIEVEMENT_DELETE}
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this achievement?</AlertDialogTitle>
              <AlertDialogDescription>
                Users who unlocked it keep their credits. This action cannot be
                undone.
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
                <Button data-testid={SELECTORS.ACHIEVEMENT_DELETE_CONFIRM}>
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

export const AchievementSheet = () => {
  const [achievementKey, setAchievementKey] = useQueryState(
    QUERY_PARAMS.ACHIEVEMENT_KEY,
  )
  const { data: achievement } = useGetAchievementByKeyQuery(
    { key: achievementKey || "" },
    { skip: !achievementKey },
  )

  return (
    <Sheet
      open={Boolean(achievementKey)}
      onOpenChange={(open) => !open && setAchievementKey(null)}
    >
      {!achievement && <EmptySheet />}
      {achievement && (
        <SheetContent className="flex flex-col">
          <AchievementForm key={achievement.key} achievement={achievement} />
        </SheetContent>
      )}
    </Sheet>
  )
}
