const isSameArray = (a: unknown[], b: unknown[]) => {
  if (a.length !== b.length) return false

  return a.every((element, index) => isEqual(element, b[index]))
}

type PlainObject = Record<PropertyKey, unknown>

const isPlainObject = (value: unknown): value is PlainObject => {
  return value?.constructor === Object
}

const isSameObject = (a: PlainObject, b: PlainObject) => {
  // check if the objects have the same keys
  const keys1 = Object.keys(a)
  const keys2 = Object.keys(b)
  if (!isEqual(keys1, keys2)) return false

  // check if the values of each key in the objects are equal
  for (const key of keys1) {
    if (!isEqual(a[key], b[key])) return false
  }

  // the objects are deeply equal
  return true
}

export const isEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true

  if (typeof a !== typeof b) return false

  if (Array.isArray(a) && Array.isArray(b)) return isSameArray(a, b)

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()

  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString()

  if (isPlainObject(a) && isPlainObject(b)) return isSameObject(a, b)

  return false
}
