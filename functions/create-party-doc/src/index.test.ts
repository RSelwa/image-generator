import firebaseFunctionsTest from "firebase-functions-test"
import { describe, expect, it } from "vitest"

const test = firebaseFunctionsTest()

const randomString = () => Math.random().toString(36).substring(2, 15)

describe("Create a party", () => {
  it("should create a party", () => {
    expect(1).toBe(1)
  })
})
