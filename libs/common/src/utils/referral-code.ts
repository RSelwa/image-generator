import { REFERRAL_CODE_LENGTH } from "../constants/firestore"

const DIGITS_COUNT = 10

export const generateReferralCode = () =>
  Array.from({ length: REFERRAL_CODE_LENGTH }, () =>
    Math.floor(Math.random() * DIGITS_COUNT),
  ).join("")
