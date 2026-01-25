export const chunk = <T>(array: T[], size = 500): T[][] =>
  [...Array<T>(Math.ceil(array.length / size))].map((_, i) =>
    array.slice(i * size, i * size + size),
  )
