import type { Card, Rank } from "@/lib/pairplay/types";

const RANK_FILES: Record<Rank, string> = {
  1: "a",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "j",
  12: "q",
  13: "k",
};

export const CARD_BACK_PATH = "/cards/back.svg";

export function getCardFacePath(card: Card) {
  return `/cards/${card.suit}/${RANK_FILES[card.rank]}.svg`;
}

export function getCardLabel(card: Card) {
  const rank =
    card.rank === 1
      ? "Ace"
      : card.rank === 11
        ? "Jack"
        : card.rank === 12
          ? "Queen"
          : card.rank === 13
            ? "King"
            : String(card.rank);

  return `${rank} of ${card.suit}`;
}
