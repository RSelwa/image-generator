import { type MapDocWithId } from "@repo/schemas"

const CARD_NUMBER_DIGITS = 3

const getCardNumbers = (maps: MapDocWithId[]) =>
  maps.flatMap(({ cardProperties }) =>
    cardProperties ? [cardProperties.number] : [],
  )

export const getNextCardNumber = (maps: MapDocWithId[]) =>
  Math.max(0, ...getCardNumbers(maps)) + 1

export const getCardNumberIssues = (maps: MapDocWithId[]) => {
  const numbers = getCardNumbers(maps)
  const usedNumbers = new Set(numbers)
  const maxNumber = Math.max(0, ...numbers)

  return {
    duplicates: [...usedNumbers]
      .filter(
        (number) => numbers.indexOf(number) !== numbers.lastIndexOf(number),
      )
      .toSorted((first, second) => first - second),
    gaps: Array.from({ length: maxNumber }, (_, index) => index + 1).filter(
      (number) => !usedNumbers.has(number),
    ),
  }
}

export const formatCardNumber = (number: number) =>
  `#${String(number).padStart(CARD_NUMBER_DIGITS, "0")}`
