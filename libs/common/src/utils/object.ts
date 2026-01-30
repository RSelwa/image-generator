function isSameArray(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) return false

  return a.every((element, index) => isEqual(element, b[index]))
}

type PlainObject = Record<PropertyKey, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return value?.constructor === Object
}

function isSameObject(a: PlainObject, b: PlainObject) {
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

export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (typeof a !== typeof b) return false

  if (Array.isArray(a) && Array.isArray(b)) return isSameArray(a, b)

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime()

  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString()

  if (isPlainObject(a) && isPlainObject(b)) return isSameObject(a, b)

  return false
}

export function capitalizeFirstLetter(str?: string) {
  if (!str) return str

  const words = str.split(" ")

  words
    .map((word) => {
      return word[0]?.toUpperCase() + word.substring(1)
    })
    .join(" ")
}

export function getIdFromFirestoreRef(ref: string) {
  const parts = ref.split("/")

  return parts[parts.length - 1] || ""
}

export function randomElement(array: unknown[]) {
  return array[Math.floor(Math.random() * array.length)]
}

// Export Now at format dd-mm-yyyy-hh-mm-ss
export function getNowString() {
  const now = new Date()
  const dateStr = [
    now.getDate().toString().padStart(2, "0"),
    (now.getMonth() + 1).toString().padStart(2, "0"),
    now.getFullYear(),
    now.getHours().toString().padStart(2, "0"),
    now.getMinutes().toString().padStart(2, "0"),
    now.getSeconds().toString().padStart(2, "0"),
  ].join("-")

  return dateStr
}
