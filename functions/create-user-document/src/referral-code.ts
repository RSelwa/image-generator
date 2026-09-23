import { generateReferralCode, USERS_FIELDS } from "@repo/common"
import { refs } from "@repo/providers/db-refs"

const isReferralCodeTaken = async (referralCode: string) => {
  const snapshot = await refs.users
    .where(USERS_FIELDS.REFERRAL_CODE, "==", referralCode)
    .limit(1)
    .get()

  return !snapshot.empty
}

export const generateUniqueReferralCode = async () => {
  let referralCode = generateReferralCode()

  while (await isReferralCodeTaken(referralCode)) {
    referralCode = generateReferralCode()
  }

  return referralCode
}
