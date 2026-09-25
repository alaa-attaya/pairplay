import { SUITS, type Card, type Rank } from "@/lib/pairplay/types";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function createDeck(): Card[] {
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({
        id: `${suit}-${rank}`,
        suit,
        rank: rank as Rank,
      });
    }
  }

  return shuffle(cards);
}
