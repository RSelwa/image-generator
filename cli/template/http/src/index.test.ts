import type { DecodedIdToken } from "@repo/providers/firebase"
import { {{FUNCTION_NAME}} } from "./index"

import type { Request } from "firebase-functions/https"
import firebaseFunctionsTest from "firebase-functions-test"
import { describe, expect, it } from "vitest"

const test = firebaseFunctionsTest()

// ? Example of tests https://github.com/firebase/firebase-functions-test/tree/master/spec/providers

describe("http_endpoint", () => {
  it("should return a function", async () => {
    const result = await test.wrap({{FUNCTION_NAME}})({
      data: {},
      auth: { uid: "abc", token: {} as DecodedIdToken },
      rawRequest: {} as unknown as Request,
      acceptsStreaming: false
    })

    expect(result).toBeDefined()
    expect(result).toHaveProperty("env", "env test file")
  })
})
