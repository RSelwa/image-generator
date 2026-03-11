import { dateToString } from "@repo/common"
import { ITEM_HEIGHT, PADDING_Y, PATH_WIDTH, ZIGZAG_X } from "@/constants/daily-challenges"

export const generateDates = (count: number): string[] => {
  const today = new Date()

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - i)

    return dateToString(d)
  })
}

export const getPoint = (index: number) => ({
  x: (ZIGZAG_X[index % ZIGZAG_X.length] || 0.5) * PATH_WIDTH,
  y: PADDING_Y + index * ITEM_HEIGHT,
})

export const buildPath = (count: number): string =>
  Array.from({ length: count }, (_, i) => getPoint(i)).reduce((acc, pt, i, pts) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = pts[i - 1]!
    const cy = ITEM_HEIGHT * 0.6

    return `${acc} C ${prev.x} ${prev.y + cy} ${pt.x} ${pt.y - cy} ${pt.x} ${pt.y}`
  }, "")
