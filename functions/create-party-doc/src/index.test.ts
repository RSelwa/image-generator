import firebaseFunctionsTest from "firebase-functions-test"
import { describe } from "vitest"

const test = firebaseFunctionsTest()

const randomString = () => Math.random().toString(36).substring(2, 15)

describe("Create a party", () => {})
