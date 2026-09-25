import { createDeck } from "@/lib/pairplay/deck";
import type { GameMode, GameState, Player } from "@/lib/pairplay/types";

export const TOTAL_CARDS = 52;
export const TOTAL_PAIRS = 26;

export function createGame(mode: GameMode): GameState {
  return {
    deck: createDeck(),
    revealed: [],
    matched: [],

    currentPlayer: 0,

    scores: [0, 0],

    attempts: 0,

    phase: "playing",

    lastOutcome: null,

    round: Date.now(),
  };
}

export function canFlipCard(
  state: GameState,
  index: number,
  player: Player,
  mode: GameMode,
): boolean {
  if (state.phase !== "playing") {
    return false;
  }

  if (index < 0 || index >= state.deck.length) {
    return false;
  }

  if (state.revealed.includes(index)) {
    return false;
  }

  if (state.matched.includes(index)) {
    return false;
  }

  if (mode === "computer" && state.currentPlayer !== player) {
    return false;
  }

  return true;
}

export function flipCard(
  state: GameState,
  index: number,
  player: Player,
  mode: GameMode,
): GameState {
  if (!canFlipCard(state, index, player, mode)) {
    return state;
  }

  const revealed = [...state.revealed, index];

  if (revealed.length === 1) {
    return {
      ...state,
      revealed,
      lastOutcome: null,
    };
  }

  return {
    ...state,
    revealed,
    attempts: state.attempts + 1,
    phase: "resolving",
    lastOutcome: null,
  };
}

export function resolveTurn(state: GameState, mode: GameMode): GameState {
  if (state.phase !== "resolving") {
    return state;
  }

  if (state.revealed.length !== 2) {
    return state;
  }

  const [firstIndex, secondIndex] = state.revealed;

  const first = state.deck[firstIndex];
  const second = state.deck[secondIndex];

  const matched = first.rank === second.rank;

  if (matched) {
    const nextMatched = [...state.matched, firstIndex, secondIndex];

    const nextScores: [number, number] = [...state.scores];

    nextScores[state.currentPlayer] += 1;

    const finished = nextMatched.length === TOTAL_CARDS;

    return {
      ...state,

      revealed: [],
      matched: nextMatched,

      scores: nextScores,

      phase: finished ? "finished" : "playing",

      lastOutcome: "match",
    };
  }

  return {
    ...state,

    revealed: [],

    currentPlayer:
      mode === "computer" ? (state.currentPlayer === 0 ? 1 : 0) : 0,

    phase: "playing",

    lastOutcome: "miss",
  };
}
