import type {
  Difficulty,
  GameState,
  MemoryEntry,
  Rank,
} from "@/lib/pairplay/types";

interface DifficultyConfig {
  label: string;
  description: string;
  memorySize: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    description: "Remembers the last 4 revealed cards.",
    memorySize: 4,
  },

  medium: {
    label: "Medium",
    description: "Remembers the last 8 revealed cards.",
    memorySize: 8,
  },

  hard: {
    label: "Hard",
    description: "Remembers every card that has been revealed.",
    memorySize: Infinity,
  },
};

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function rememberCard(
  memory: MemoryEntry[],
  index: number,
  rank: Rank,
  difficulty: Difficulty,
): MemoryEntry[] {
  const withoutDuplicate = memory.filter((entry) => entry.index !== index);

  const next = [
    ...withoutDuplicate,
    {
      index,
      rank,
    },
  ];

  const limit = DIFFICULTIES[difficulty].memorySize;

  if (!Number.isFinite(limit)) {
    return next;
  }

  return next.slice(-limit);
}

export function forgetMatchedCards(
  memory: MemoryEntry[],
  matched: number[],
): MemoryEntry[] {
  const matchedSet = new Set(matched);

  return memory.filter((entry) => !matchedSet.has(entry.index));
}

export function chooseComputerCard(
  state: GameState,
  memory: MemoryEntry[],
): number {
  const matchedSet = new Set(state.matched);

  const revealedSet = new Set(state.revealed);

  const available = state.deck
    .map((_card, index) => index)
    .filter((index) => !matchedSet.has(index) && !revealedSet.has(index));

  if (available.length === 0) {
    throw new Error("No cards are available for the computer to flip.");
  }

  const availableSet = new Set(available);

  const known = memory.filter((entry) => availableSet.has(entry.index));

  /*
   * Computer is choosing card #2.
   *
   * If it remembers a card matching
   * the rank of card #1, use it.
   */
  if (state.revealed.length === 1) {
    const firstIndex = state.revealed[0];

    const firstRank = state.deck[firstIndex].rank;

    const rememberedMatches = known.filter((entry) => entry.rank === firstRank);

    if (rememberedMatches.length > 0) {
      return randomChoice(rememberedMatches).index;
    }

    /*
     * No remembered match.
     *
     * Prefer an unknown card so the computer
     * learns something rather than knowingly
     * selecting a remembered mismatch.
     */
    const knownIndices = new Set(known.map((entry) => entry.index));

    const unknown = available.filter((index) => !knownIndices.has(index));

    if (unknown.length > 0) {
      return randomChoice(unknown);
    }

    return randomChoice(available);
  }

  /*
   * Computer is choosing card #1.
   *
   * If its memory contains a complete pair,
   * start with one of those cards.
   */
  const knownByRank = new Map<Rank, number[]>();

  for (const entry of known) {
    const indices = knownByRank.get(entry.rank) ?? [];

    indices.push(entry.index);

    knownByRank.set(entry.rank, indices);
  }

  const knownPairs = Array.from(knownByRank.values()).filter(
    (indices) => indices.length >= 2,
  );

  if (knownPairs.length > 0) {
    const pair = randomChoice(knownPairs);

    return randomChoice(pair);
  }

  /*
   * Otherwise prefer a card it hasn't seen.
   */
  const knownIndices = new Set(known.map((entry) => entry.index));

  const unknown = available.filter((index) => !knownIndices.has(index));

  if (unknown.length > 0) {
    return randomChoice(unknown);
  }

  return randomChoice(available);
}
