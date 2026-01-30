export function chunk<T>(array: T[], size = 500): T[][] {
  return [...Array.from({ length: Math.ceil(array.length / size) })].map(
    (_, i) => array.slice(i * size, i * size + size),
  )
}
