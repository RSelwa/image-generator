import { TABLES } from "@repo/common"
import { type subRefs as SubRefs } from "@repo/providers/db-refs"

export const shouldFinishInsteadOfAbandon = async ({
  lobbyId,
  currentRound,
  numberOfRounds,
  playersCount,
  subRefs,
}: {
  lobbyId: string
  currentRound: number
  numberOfRounds: number
  playersCount: number
  subRefs: typeof SubRefs
}) => {
  if (currentRound !== numberOfRounds || playersCount === 0) return false

  const lastRoundDoc = await subRefs[TABLES.ROUND_ANSWERS](lobbyId)
    .doc(String(currentRound))
    .get()

  if (!lastRoundDoc.exists) return false

  const lastRoundData = lastRoundDoc.data()
  const answersCount = lastRoundData?.answers?.length || 0

  return answersCount >= playersCount
}
