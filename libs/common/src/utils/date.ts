export const dateToString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export const stringToDate = (dateString: string): Date => {
  const parts = dateString.split("-")

  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

export const getYesterday = (dateStr: string): string => {
  const date = stringToDate(dateStr)
  date.setDate(date.getDate() - 1)

  return dateToString(date)
}
