export const SUITS = ["spades", "hearts", "clubs", "diamonds"] as const;

export type Suit = (typeof SUITS)[number];

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type GameMode = "solo" | "computer";

export type Difficulty = "easy" | "medium" | "hard";

export type Player = 0 | 1;

export type GamePhase = "playing" | "resolving" | "finished";

export type TurnOutcome = "match" | "miss" | null;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export interface GameState {
  deck: Card[];
  revealed: number[];
  matched: number[];

  currentPlayer: Player;

  scores: [number, number];

  attempts: number;

  phase: GamePhase;

  lastOutcome: TurnOutcome;

  round: number;
}

export interface MemoryEntry {
  index: number;
  rank: Rank;
}
