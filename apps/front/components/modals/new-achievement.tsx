"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type AchievementDoc, achievementDocSchema } from "@repo/schemas"
import { type SubmitHandler, useForm } from "react-hook-form"
import { AchievementFormFields } from "@/components/achievement-form-fields"
import { ModalBase } from "@/components/modals/base"
import { Button } from "@/components/ui/button"
import { MODAL_KEYS } from "@/constants/mapping"
import { SELECTORS } from "@/constants/testing"
import { useModal } from "@/hooks/use-modal"
import { useCreateAchievementMutation } from "@/redux/api/achievements"
import { globalErrorSchema } from "@/utils/error"

const KEY = MODAL_KEYS.NEW_ACHIEVEMENT
const CREATE_ERROR_MESSAGE = "Could not create the achievement"

export const NewAchievement = () => {
  const { closeModal } = useModal(KEY)
  const [createAchievement, { isLoading }] = useCreateAchievementMutation()
  const form = useForm<AchievementDoc>({
    resolver: zodResolver(achievementDocSchema),
    defaultValues: { description: "", reward: 0 },
  })

  const onSubmit: SubmitHandler<AchievementDoc> = async (data) => {
    try {
      await createAchievement(data).unwrap()
      form.reset()
      closeModal()
    } catch (error) {
      form.setError("key", {
        message:
          globalErrorSchema.safeParse(error).data?.message ||
          CREATE_ERROR_MESSAGE,
      })
    }
  }

  return (
    <ModalBase modalKey={KEY} title="New Achievement" className="lg:max-w-2xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <AchievementFormFields form={form} isKeyReadOnly={false} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="marathon-outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid={SELECTORS.ACHIEVEMENT_FORM_SUBMIT}
          >
            {isLoading && "Creating..."}
            {!isLoading && "Create"}
          </Button>
        </div>
      </form>
    </ModalBase>
  )
}
