import { TABLES } from "@repo/common"
import { describe, expect, it, vi } from "vitest"
import { shouldFinishInsteadOfAbandon } from "~/should-finish"

const createMockSubRefs = (roundData: { answers: { uid: string }[] } | null) => ({
  [TABLES.ROUND_ANSWERS]: vi.fn().mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: vi.fn().mockResolvedValue({
        exists: roundData !== null,
        data: () => roundData,
      }),
    }),
  }),
}) as any

describe("shouldFinishInsteadOfAbandon", () => {
  it("should return true when at last round and all players answered", async () => {
    const subRefs = createMockSubRefs({
      answers: [{ uid: "p1" }, { uid: "p2" }],
    })

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 12,
      numberOfRounds: 12,
      playersCount: 2,
      subRefs,
    })

    expect(result).toBe(true)
    expect(subRefs[TABLES.ROUND_ANSWERS]).toHaveBeenCalledWith("lobby1")
  })

  it("should return false when not at last round", async () => {
    const subRefs = createMockSubRefs({
      answers: [{ uid: "p1" }, { uid: "p2" }],
    })

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 10,
      numberOfRounds: 12,
      playersCount: 2,
      subRefs,
    })

    expect(result).toBe(false)
  })

  it("should return false when at last round but not all players answered", async () => {
    const subRefs = createMockSubRefs({
      answers: [{ uid: "p1" }],
    })

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 12,
      numberOfRounds: 12,
      playersCount: 3,
      subRefs,
    })

    expect(result).toBe(false)
  })

  it("should return false when round document does not exist", async () => {
    const subRefs = createMockSubRefs(null)

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 12,
      numberOfRounds: 12,
      playersCount: 2,
      subRefs,
    })

    expect(result).toBe(false)
  })

  it("should return false when playersCount is 0", async () => {
    const subRefs = createMockSubRefs({
      answers: [],
    })

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 12,
      numberOfRounds: 12,
      playersCount: 0,
      subRefs,
    })

    expect(result).toBe(false)
  })

  it("should return true when more answers than players (edge case)", async () => {
    const subRefs = createMockSubRefs({
      answers: [{ uid: "p1" }, { uid: "p2" }, { uid: "p3" }],
    })

    const result = await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 5,
      numberOfRounds: 5,
      playersCount: 2,
      subRefs,
    })

    expect(result).toBe(true)
  })

  it("should fetch the correct round document by currentRound number", async () => {
    const subRefs = createMockSubRefs({
      answers: [{ uid: "p1" }],
    })

    await shouldFinishInsteadOfAbandon({
      lobbyId: "lobby1",
      currentRound: 7,
      numberOfRounds: 7,
      playersCount: 1,
      subRefs,
    })

    expect(subRefs[TABLES.ROUND_ANSWERS]("lobby1").doc).toHaveBeenCalledWith("7")
  })
})
