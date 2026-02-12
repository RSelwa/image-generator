"use client"

import { calculateDistancePoints, DEFAULT_LIVES, DEFAULT_TIME_PER_ROUND, getDistance, isSameNormalized, NUMBER_OF_ROUNDS_PER_STAGE, ROUND_POINTS, ROUND_TYPE } from "@repo/common"
import { type Round, type SpecialRoundOption } from "@repo/schemas"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import { type Position } from "@/components/mini-map"
import { DEMO_CONFIG, DEMO_MODE, DEMO_SEED_ID } from "@/constants/demo"
import { useGetSeedByIdQuery } from "@/redux/api/seed"

// --- Types ---

type DemoState = {
  currentRoundIndex: number
  score: number
  livesUsed: number
  isCorrect: boolean
  selectedOptionIndex: number | null
  mapPosition: Position | null
  hasSubmittedMap: boolean
  gamePoints: number
  distancePoints: number
  roundStartedAt: number | null // Date.now() timestamp
  optionSelectedAt: number | null
  answerSubmittedAt: number | null
  isFinished: boolean
}

type DemoAction =
  | { type: "SUBMIT_GUESS"; isCorrect: boolean; gamePoints: number }
  | { type: "INCREMENT_LIVES_USED" }
  | { type: "SELECT_OPTION"; index: number }
  | { type: "SUBMIT_MAP"; position: Position; distancePoints: number }
  | { type: "NEXT_ROUND"; totalRounds: number }
  | { type: "RESET" }
  | { type: "START_ROUND" }
  | { type: "EXPIRE" }

type DemoContextValue = {
  // State
  seed: { rounds: Round[] } | null
  isLoading: boolean
  currentRoundIndex: number
  currentRound: Round | null
  selectedOption: SpecialRoundOption | null
  score: number
  livesUsed: number
  livesRemaining: number
  isCorrect: boolean
  isExpired: boolean
  hasSelectedOption: boolean
  hasSubmittedMap: boolean
  isEliminated: boolean
  isFinished: boolean
  gamePoints: number
  distancePoints: number
  totalPoints: number
  timeRemaining: number
  stage: number
  numberOfRounds: number
  pointsDistance: number
  config: { roundDuration: number; playersLives: number | null }
  demoMode: "full" | "simplified"

  // Actions
  submitGuess: (answer: string) => void
  selectOption: (index: number) => void
  submitMapPosition: (position: Position) => void
  nextRound: () => void
  resetDemo: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export const useDemoContext = () => {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error("useDemoContext must be used within DemoProvider")
  return ctx
}

// --- Reducer ---

const initialState: DemoState = {
  currentRoundIndex: 0,
  score: 0,
  livesUsed: 0,
  isCorrect: false,
  selectedOptionIndex: null,
  mapPosition: null,
  hasSubmittedMap: false,
  gamePoints: 0,
  distancePoints: 0,
  roundStartedAt: null,
  optionSelectedAt: null,
  answerSubmittedAt: null,
  isFinished: false,
}

const demoReducer = (state: DemoState, action: DemoAction): DemoState => {
  if (action.type === "SUBMIT_GUESS") {
    return {
      ...state,
      isCorrect: action.isCorrect,
      gamePoints: action.gamePoints,
      answerSubmittedAt: action.isCorrect ? Date.now() : state.answerSubmittedAt,
    }
  }
  if (action.type === "INCREMENT_LIVES_USED") {
    return { ...state, livesUsed: state.livesUsed + 1 }
  }
  if (action.type === "SELECT_OPTION") {
    return { ...state, selectedOptionIndex: action.index, optionSelectedAt: Date.now() }
  }
  if (action.type === "SUBMIT_MAP") {
    return {
      ...state,
      mapPosition: action.position,
      hasSubmittedMap: true,
      distancePoints: action.distancePoints,
    }
  }
  if (action.type === "NEXT_ROUND") {
    const nextIndex = state.currentRoundIndex + 1
    if (nextIndex >= action.totalRounds) {
      return { ...state, isFinished: true }
    }
    return {
      ...initialState,
      currentRoundIndex: nextIndex,
      score: state.score + state.gamePoints + state.distancePoints,
      roundStartedAt: Date.now(),
    }
  }
  if (action.type === "RESET") {
    return { ...initialState, roundStartedAt: Date.now() }
  }
  if (action.type === "START_ROUND") {
    return { ...state, roundStartedAt: Date.now() }
  }
  if (action.type === "EXPIRE") {
    return state
  }
  return state
}

// --- Timer hook ---

const useDemoCountdown = (startedAt: number | null, durationSeconds: number) => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    if (!startedAt) return

    const interval = setInterval(() => forceUpdate(), 1000)
    return () => clearInterval(interval)
  }, [startedAt, durationSeconds])

  if (!startedAt) return { timeRemaining: durationSeconds, isExpired: false }

  const elapsed = (Date.now() - startedAt) / 1000
  const remaining = Math.max(0, Math.ceil(durationSeconds - elapsed))
  return { timeRemaining: remaining, isExpired: remaining <= 0 }
}

// --- Provider ---

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const { data: seed, isLoading } = useGetSeedByIdQuery({ id: DEMO_SEED_ID }, { skip: !DEMO_SEED_ID })

  const [state, dispatch] = useReducer(demoReducer, initialState)
  const hasStarted = useRef(false)

  const rounds = seed?.rounds || []
  const numberOfRounds = rounds.length
  const currentRound = rounds[state.currentRoundIndex] || null

  // In simplified mode, treat special rounds as normal using first option
  const effectiveRound = useMemo(() => {
    if (!currentRound) return null
    if (DEMO_MODE === "simplified" && currentRound.isSpecial && currentRound.options?.[0]) {
      const opt = currentRound.options[0]
      return {
        ...currentRound,
        isSpecial: false,
        type: opt.type,
        gameId: opt.gameId,
        gameTitle: opt.gameTitle,
        gameThumbnailUrl: opt.gameThumbnailUrl,
        sphericalImageUrl: opt.sphericalImage,
        flatImageUrl: opt.flatImage,
        mapId: null,
        mapPosition: null,
      } as Round
    }
    return currentRound
  }, [currentRound])

  const selectedOption = (state.selectedOptionIndex !== null && effectiveRound?.options?.[state.selectedOptionIndex]) || null

  const stage = Math.floor(state.currentRoundIndex / NUMBER_OF_ROUNDS_PER_STAGE)
  const pointsDistance = effectiveRound?.isSpecial ? 0 : (ROUND_POINTS.DISTANCE + ROUND_POINTS.DISTANCE_ADDITION * stage)

  // Timer logic
  const isWaitingForSelection = effectiveRound?.isSpecial && state.selectedOptionIndex === null
  const isMapPhase = state.isCorrect && effectiveRound?.mapPosition
  const timerStartedAt = DEMO_MODE === "simplified"
    ? null
    : (isWaitingForSelection ? null : (isMapPhase ? state.answerSubmittedAt : (state.optionSelectedAt || state.roundStartedAt)))

  const { timeRemaining, isExpired } = useDemoCountdown(
    DEMO_MODE === "full" ? timerStartedAt : null,
    DEMO_CONFIG.roundDuration,
  )

  const livesRemaining = DEMO_CONFIG.playersLives ? DEMO_CONFIG.playersLives - state.livesUsed : 0
  const isEliminated = DEMO_MODE === "full" && DEMO_CONFIG.playersLives ? livesRemaining <= 0 : false

  // Start timer on seed load
  useEffect(() => {
    if (seed && !hasStarted.current) {
      hasStarted.current = true
      dispatch({ type: "START_ROUND" })
    }
  }, [seed])

  const correctGameTitle = useMemo(() => {
    if (!effectiveRound) return ""
    return selectedOption?.gameTitle || effectiveRound.gameTitle || ""
  }, [effectiveRound, selectedOption])

  const submitGuess = useCallback((answer: string) => {
    if (!correctGameTitle || state.isCorrect || isExpired || isEliminated) return

    const isCorrect = isSameNormalized(correctGameTitle, answer)
    if (isCorrect) {
      dispatch({ type: "SUBMIT_GUESS", isCorrect: true, gamePoints: ROUND_POINTS.GAME_GUESS })
    } else {
      dispatch({ type: "SUBMIT_GUESS", isCorrect: false, gamePoints: 0 })
      if (DEMO_MODE === "full" && DEMO_CONFIG.playersLives) {
        dispatch({ type: "INCREMENT_LIVES_USED" })
      }
    }
  }, [correctGameTitle, state.isCorrect, isExpired, isEliminated])

  const selectOption = useCallback((index: number) => {
    if (state.selectedOptionIndex !== null) return
    dispatch({ type: "SELECT_OPTION", index })
  }, [state.selectedOptionIndex])

  const submitMapPosition = useCallback((position: Position) => {
    if (!effectiveRound?.mapPosition || state.hasSubmittedMap) return
    const distance = getDistance(effectiveRound.mapPosition, position)
    const pts = calculateDistancePoints(distance, pointsDistance, effectiveRound.maxDistancePoints || ROUND_POINTS.DISTANCE)
    dispatch({ type: "SUBMIT_MAP", position, distancePoints: pts })
  }, [effectiveRound, state.hasSubmittedMap, pointsDistance])

  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND", totalRounds: numberOfRounds })
  }, [numberOfRounds])

  const resetDemo = useCallback(() => {
    hasStarted.current = true
    dispatch({ type: "RESET" })
  }, [])

  const totalPoints = state.gamePoints + state.distancePoints

  const value: DemoContextValue = {
    seed: seed ? { rounds } : null,
    isLoading,
    currentRoundIndex: state.currentRoundIndex,
    currentRound: effectiveRound,
    selectedOption,
    score: state.score,
    livesUsed: state.livesUsed,
    livesRemaining,
    isCorrect: state.isCorrect,
    isExpired,
    hasSelectedOption: state.selectedOptionIndex !== null,
    hasSubmittedMap: state.hasSubmittedMap,
    isEliminated,
    isFinished: state.isFinished,
    gamePoints: state.gamePoints,
    distancePoints: state.distancePoints,
    totalPoints,
    timeRemaining,
    stage,
    numberOfRounds,
    pointsDistance,
    config: DEMO_CONFIG,
    demoMode: DEMO_MODE,
    submitGuess,
    selectOption,
    submitMapPosition,
    nextRound,
    resetDemo,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
