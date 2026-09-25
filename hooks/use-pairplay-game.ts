"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  chooseComputerCard,
  forgetMatchedCards,
  rememberCard,
} from "@/lib/pairplay/ai";

import {
  canFlipCard,
  createGame,
  flipCard,
  resolveTurn,
} from "@/lib/pairplay/engine";

import {
  CARD_FLIP_FALLBACK_MS,
  COMPUTER_FIRST_FLIP_DELAY_MS,
  COMPUTER_SECOND_FLIP_DELAY_MS,
  RESULT_RESOLVE_MS,
} from "@/lib/pairplay/timing";

import type {
  Difficulty,
  GameMode,
  GameState,
  MemoryEntry,
  Player,
} from "@/lib/pairplay/types";

export function usePairplayGame() {
  const [mode, setModeState] = useState<GameMode>("solo");

  const [difficulty, setDifficultyState] = useState<Difficulty>("medium");

  /*
   * Keep randomized deck state out of SSR.
   *
   * Server and first client render both see null.
   * The shuffled game is created after hydration.
   */
  const [state, setState] = useState<GameState | null>(null);

  const [interactionLocked, setInteractionLocked] = useState(false);

  const stateRef = useRef<GameState | null>(null);

  const computerMemory = useRef<MemoryEntry[]>([]);

  const pendingAnimationsRef = useRef(0);

  const animationFallbackRef = useRef<number | null>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initial = createGame("solo");

    stateRef.current = initial;

    setState(initial);
  }, []);

  const commitState = useCallback((next: GameState) => {
    stateRef.current = next;

    setState(next);
  }, []);

  const clearAnimationFallback = useCallback(() => {
    if (animationFallbackRef.current === null) {
      return;
    }

    window.clearTimeout(animationFallbackRef.current);

    animationFallbackRef.current = null;
  }, []);

  const clearAnimationLock = useCallback(() => {
    clearAnimationFallback();

    pendingAnimationsRef.current = 0;

    setInteractionLocked(false);
  }, [clearAnimationFallback]);

  const beginCardAnimations = useCallback(
    (count: number) => {
      clearAnimationFallback();

      pendingAnimationsRef.current = count;

      setInteractionLocked(true);

      animationFallbackRef.current = window.setTimeout(() => {
        pendingAnimationsRef.current = 0;

        animationFallbackRef.current = null;

        setInteractionLocked(false);
      }, CARD_FLIP_FALLBACK_MS);
    },
    [clearAnimationFallback],
  );

  const finishCardAnimation = useCallback(() => {
    if (pendingAnimationsRef.current <= 0) {
      return;
    }

    pendingAnimationsRef.current -= 1;

    if (pendingAnimationsRef.current > 0) {
      return;
    }

    clearAnimationFallback();

    setInteractionLocked(false);
  }, [clearAnimationFallback]);

  useEffect(() => {
    return () => {
      clearAnimationFallback();
    };
  }, [clearAnimationFallback]);

  const reset = useCallback(
    (nextMode: GameMode = mode) => {
      clearAnimationLock();

      computerMemory.current = [];

      const next = createGame(nextMode);

      commitState(next);
    },
    [clearAnimationLock, commitState, mode],
  );

  const setMode = useCallback(
    (nextMode: GameMode) => {
      if (nextMode === mode) {
        return;
      }

      clearAnimationLock();

      computerMemory.current = [];

      setModeState(nextMode);

      const next = createGame(nextMode);

      commitState(next);
    },
    [clearAnimationLock, commitState, mode],
  );

  const setDifficulty = useCallback(
    (nextDifficulty: Difficulty) => {
      if (nextDifficulty === difficulty) {
        return;
      }

      clearAnimationLock();

      computerMemory.current = [];

      setDifficultyState(nextDifficulty);

      /*
       * Difficulty changes memory only.
       *
       * The game resets because changing AI
       * behavior in the middle of a match would
       * make its remembered state ambiguous.
       *
       * Animation/timing values DO NOT change.
       */
      const next = createGame(mode);

      commitState(next);
    },
    [clearAnimationLock, commitState, difficulty, mode],
  );

  const performFlip = useCallback(
    (index: number, player: Player) => {
      const current = stateRef.current;

      if (!current) {
        return;
      }

      const next = flipCard(current, index, player, mode);

      if (next === current) {
        return;
      }

      const card = current.deck[index];

      computerMemory.current = rememberCard(
        computerMemory.current,
        index,
        card.rank,
        difficulty,
      );

      commitState(next);
    },
    [commitState, difficulty, mode],
  );

  const flip = useCallback(
    (index: number) => {
      if (pendingAnimationsRef.current > 0) {
        return;
      }

      const current = stateRef.current;

      if (!current) {
        return;
      }

      if (!canFlipCard(current, index, 0, mode)) {
        return;
      }

      /*
       * Don't allow another human selection
       * until this card has physically completed
       * its opening animation.
       */
      beginCardAnimations(1);

      performFlip(index, 0);
    },
    [beginCardAnimations, mode, performFlip],
  );

  /*
   * Resolve two selected cards.
   */
  useEffect(() => {
    if (!state) {
      return;
    }

    if (state.phase !== "resolving") {
      return;
    }

    const timeout = window.setTimeout(() => {
      const current = stateRef.current;

      if (
        !current ||
        current.phase !== "resolving" ||
        current.revealed.length !== 2
      ) {
        return;
      }

      const [firstIndex, secondIndex] = current.revealed;

      const first = current.deck[firstIndex];

      const second = current.deck[secondIndex];

      const isMatch = first.rank === second.rank;

      /*
       * Both missed cards close simultaneously.
       *
       * Wait for BOTH animations before
       * accepting another human click.
       */
      if (!isMatch) {
        beginCardAnimations(2);
      }

      const next = resolveTurn(current, mode);

      computerMemory.current = forgetMatchedCards(
        computerMemory.current,
        next.matched,
      );

      commitState(next);
    }, RESULT_RESOLVE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [beginCardAnimations, commitState, mode, state]);

  /*
   * Computer turn.
   *
   * Timing is deliberately independent from
   * difficulty.
   */
  useEffect(() => {
    if (!state) {
      return;
    }

    if (
      mode !== "computer" ||
      state.phase !== "playing" ||
      state.currentPlayer !== 1
    ) {
      return;
    }

    const delay =
      state.revealed.length === 0
        ? COMPUTER_FIRST_FLIP_DELAY_MS
        : COMPUTER_SECOND_FLIP_DELAY_MS;

    const timeout = window.setTimeout(() => {
      const current = stateRef.current;

      if (
        !current ||
        current.phase !== "playing" ||
        current.currentPlayer !== 1
      ) {
        return;
      }

      const index = chooseComputerCard(current, computerMemory.current);

      const card = current.deck[index];

      computerMemory.current = rememberCard(
        computerMemory.current,
        index,
        card.rank,
        difficulty,
      );

      const next = flipCard(current, index, 1, mode);

      commitState(next);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [commitState, difficulty, mode, state]);

  return {
    state,

    mode,
    difficulty,
    interactionLocked,

    flip,
    reset,
    setMode,
    setDifficulty,

    finishCardAnimation,
  };
}
