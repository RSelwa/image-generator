import firebaseFunctionsTest from "firebase-functions-test"
import { describe, it } from "vitest"

const test = firebaseFunctionsTest()

const randomString = () => Math.random().toString(36).substring(2, 15)

describe("Create a party", () => {
  it.skip("should create a party", () => {})
})
