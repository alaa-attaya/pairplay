/*
 * These values are global game presentation timings.
 *
 * Easy / Medium / Hard MUST NOT alter any of them.
 */

export const CARD_FLIP_MS = 650;

/*
 * Safety fallback only.
 *
 * Normally PlayingCard explicitly tells the game
 * when its actual animation has completed.
 */
export const CARD_FLIP_FALLBACK_MS = CARD_FLIP_MS + 200;

/*
 * Once the second card is completely face-up,
 * keep both cards visible for this long.
 */
export const RESULT_VISIBLE_MS = 1400;

/*
 * Resolving begins immediately when card #2
 * is selected, so include its opening animation.
 */
export const RESULT_RESOLVE_MS = CARD_FLIP_MS + RESULT_VISIBLE_MS;

/*
 * Computer pacing.
 *
 * These values are identical on Easy,
 * Medium and Hard.
 */
export const COMPUTER_FIRST_FLIP_DELAY_MS = 550;

export const COMPUTER_SECOND_FLIP_DELAY_MS = CARD_FLIP_MS + 250;
