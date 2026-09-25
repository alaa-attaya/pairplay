"use client";

import Image from "next/image";

import {
  CircleHelp,
  Monitor,
  RotateCcw,
  Trophy,
  UserRound,
} from "lucide-react";

import { useState } from "react";

import { ConfirmResetDialog } from "@/components/pairplay/confirm-reset-dialog";

import { DifficultySelect } from "@/components/pairplay/difficulty-select";

import { HowToPlayDialog } from "@/components/pairplay/how-to-play-dialog";

import { PlayingCard } from "@/components/pairplay/playing-card";

import { usePairplayGame } from "@/hooks/use-pairplay-game";

import { DIFFICULTIES } from "@/lib/pairplay/ai";

import { TOTAL_PAIRS } from "@/lib/pairplay/engine";

import type { Difficulty, GameMode } from "@/lib/pairplay/types";

type PendingReset =
  | {
      type: "new";
    }
  | {
      type: "mode";
      mode: GameMode;
    }
  | {
      type: "difficulty";
      difficulty: Difficulty;
    };

export function PairplayGame() {
  const {
    state,

    mode,
    difficulty,
    interactionLocked,

    flip,
    reset,
    setMode,
    setDifficulty,

    finishCardAnimation,
  } = usePairplayGame();

  const [helpOpen, setHelpOpen] = useState(false);

  const [pendingReset, setPendingReset] = useState<PendingReset | null>(null);

  /*
   * Randomized game state is created
   * after hydration.
   */
  if (state === null) {
    return <div className="min-h-svh bg-[#0b1629]" />;
  }

  const game = state;

  const isComputerTurn = mode === "computer" && game.currentPlayer === 1;

  const pairsFound = game.matched.length / 2;

  const pairsLeft = TOTAL_PAIRS - pairsFound;

  const resolving = game.phase === "resolving";

  const revealedMatch =
    resolving &&
    game.revealed.length === 2 &&
    game.deck[game.revealed[0]].rank === game.deck[game.revealed[1]].rank;

  const boardDisabled =
    game.phase !== "playing" || isComputerTurn || interactionLocked;

  function requestNewGame() {
    setPendingReset({
      type: "new",
    });
  }

  function requestMode(nextMode: GameMode) {
    if (nextMode === mode) {
      return;
    }

    setPendingReset({
      type: "mode",
      mode: nextMode,
    });
  }

  function requestDifficulty(nextDifficulty: Difficulty) {
    if (nextDifficulty === difficulty) {
      return;
    }

    setPendingReset({
      type: "difficulty",

      difficulty: nextDifficulty,
    });
  }

  function confirmReset() {
    if (!pendingReset) {
      return;
    }

    if (pendingReset.type === "new") {
      reset();
    }

    if (pendingReset.type === "mode") {
      setMode(pendingReset.mode);
    }

    if (pendingReset.type === "difficulty") {
      setDifficulty(pendingReset.difficulty);
    }

    setPendingReset(null);
  }

  function confirmationCopy() {
    if (!pendingReset) {
      return {
        title: "",
        description: "",
        label: "",
      };
    }

    if (pendingReset.type === "new") {
      return {
        title: "Start a new game?",

        description:
          "Your current progress will be lost and the deck will be shuffled again.",

        label: "New game",
      };
    }

    if (pendingReset.type === "difficulty") {
      return {
        title: "Change difficulty?",

        description: `Switching to ${
          DIFFICULTIES[pendingReset.difficulty].label
        } will reset the current game. Difficulty changes computer memory only — game speed stays the same.`,

        label: "Change",
      };
    }

    return {
      title: "Switch game mode?",

      description: `Switching to ${
        pendingReset.mode === "solo" ? "Solo" : "Vs Computer"
      } will reset your current game and shuffle a new deck.`,

      label: "Switch mode",
    };
  }

  function statusTitle() {
    if (game.phase === "finished") {
      if (mode === "solo") {
        return "Deck cleared!";
      }

      if (game.scores[0] === game.scores[1]) {
        return "It's a tie!";
      }

      return game.scores[0] > game.scores[1] ? "You win!" : "Computer wins";
    }

    if (resolving) {
      return revealedMatch ? "Nice match." : "No match.";
    }

    if (isComputerTurn) {
      return "Computer's turn";
    }

    if (game.lastOutcome === "match") {
      return mode === "solo"
        ? "Nice memory."
        : game.currentPlayer === 0
          ? "You found a pair."
          : "Computer found a pair.";
    }

    return "Your turn";
  }

  function statusDescription() {
    if (game.phase === "finished") {
      if (mode === "solo") {
        return `${game.attempts} attempts · 26 pairs found`;
      }

      return `${game.scores[0]}–${game.scores[1]} · 26 pairs found`;
    }

    if (resolving) {
      if (revealedMatch) {
        return "Matched cards leave the table. Go again.";
      }

      return mode === "computer"
        ? "Remember those cards. The turn will pass."
        : "Remember those cards and try again.";
    }

    if (isComputerTurn) {
      return "Thinking from the cards it remembers.";
    }

    return "Find two cards with the same rank.";
  }

  const confirmCopy = confirmationCopy();

  return (
    <div className="min-h-svh bg-[#0b1629] text-[#f7f3e8]">
      {/* HEADER */}
      <header
        className={[
          "relative mx-auto",

          "flex w-full max-w-[1100px] items-center justify-between",

          "px-2.5 py-3",

          "min-[380px]:px-3",

          "sm:px-5 sm:py-5",

          "lg:px-6 lg:py-6",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={requestNewGame}
          aria-label="Start a new Pairplay game"
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 sm:gap-2.5"
        >
          <Image
            src="/favicon.svg"
            alt=""
            width={42}
            height={42}
            priority
            className="h-8 w-8 sm:h-10 sm:w-10"
          />

          <span className="text-[22px] font-extrabold tracking-[-1px] sm:text-[29px]">
            Pairplay
            <span className="text-[#f2c76a]">.</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className={[
            "flex h-9 cursor-pointer items-center gap-2",

            "rounded-lg px-2",

            "text-[#9aacc3]",

            "transition",

            "hover:bg-[#172b46]",

            "hover:text-white",

            "sm:h-10 sm:px-2.5",
          ].join(" ")}
        >
          <CircleHelp size={18} strokeWidth={1.9} />

          <span className="hidden text-sm font-semibold sm:inline">
            How to play
          </span>
        </button>
      </header>

      <main
        className={[
          "relative mx-auto",

          "w-full max-w-[1100px]",

          "px-2 pb-4",

          "min-[380px]:px-2.5",

          "sm:px-5 sm:pb-5",

          "lg:px-6",
        ].join(" ")}
      >
        {/* MODE */}
        <div
          className={[
            "mx-auto mb-2.5",

            "grid w-full max-w-[430px] grid-cols-2",

            "rounded-xl",

            "border border-[#293e59]",

            "bg-[#081427]",

            "p-1",

            "sm:mb-3",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => requestMode("solo")}
            className={[
              "flex h-9 cursor-pointer items-center justify-center",

              "gap-1.5 rounded-lg",

              "text-[12px] font-semibold",

              "transition",

              "sm:h-10 sm:text-sm",

              mode === "solo"
                ? "bg-[#f2c76a] text-[#17263c] shadow-sm"
                : "text-[#95a9c5] hover:bg-[#13253d] hover:text-white",
            ].join(" ")}
          >
            <UserRound size={15} />
            Solo
          </button>

          <button
            type="button"
            onClick={() => requestMode("computer")}
            className={[
              "flex h-9 cursor-pointer items-center justify-center",

              "gap-1.5 rounded-lg",

              "text-[12px] font-semibold",

              "transition",

              "sm:h-10 sm:text-sm",

              mode === "computer"
                ? "bg-[#f2c76a] text-[#17263c] shadow-sm"
                : "text-[#95a9c5] hover:bg-[#13253d] hover:text-white",
            ].join(" ")}
          >
            <Monitor size={15} />
            Vs Computer
          </button>
        </div>

        {/* CONTROLS */}
        <section className="mb-2.5 sm:mb-3">
          <div className="grid h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:h-11 sm:gap-2">
            <div className="min-w-0">
              <div className="w-full max-w-[148px] sm:max-w-[192px]">
                {mode === "computer" ? (
                  <DifficultySelect
                    value={difficulty}
                    onChange={requestDifficulty}
                  />
                ) : (
                  <div className="flex h-8 items-center px-2.5 text-[11px] font-semibold text-[#c9d5e4] sm:h-9 sm:px-3.5 sm:text-[12px]">
                    Memory practice
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              aria-label="New game"
              onClick={requestNewGame}
              className={[
                "flex h-8 shrink-0 cursor-pointer items-center justify-center",

                "gap-1.5",

                "whitespace-nowrap",

                "rounded-lg px-2",

                "text-[11px] font-semibold",

                "text-[#aebed3]",

                "transition",

                "hover:bg-[#182d49]",

                "hover:text-white",

                "sm:h-9 sm:px-3 sm:text-[13px]",
              ].join(" ")}
            >
              <RotateCcw size={14} />

              <span className="max-[350px]:hidden">New game</span>
            </button>
          </div>

          <div className="flex h-6 items-start sm:h-7">
            <p className="m-0 truncate text-[10px] leading-5 text-[#7f96b3] sm:text-xs">
              {mode === "computer"
                ? DIFFICULTIES[difficulty].description
                : "Clear all 26 pairs in as few attempts as possible."}
            </p>
          </div>
        </section>

        {/* SCORE */}
        <section
          className={[
            "mb-2.5 grid",

            "grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)]",

            "items-stretch gap-1",

            "min-[380px]:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)]",

            "min-[380px]:gap-1.5",

            "sm:mb-4",

            "sm:grid-cols-[minmax(0,1fr)_46px_minmax(0,1fr)]",

            "sm:gap-2",
          ].join(" ")}
        >
          {/* LEFT */}
          <div
            className={[
              "relative flex min-w-0 items-center gap-1.5",

              "rounded-lg border p-2",

              "transition",

              "min-[380px]:rounded-xl",

              "sm:min-h-[76px]",

              "sm:gap-2 sm:px-4",

              game.currentPlayer === 0 && game.phase !== "finished"
                ? "border-[#d8b761] bg-[#27394d]"
                : "border-[#31445e] bg-[#172a45]",
            ].join(" ")}
          >
            <div
              className={[
                "grid h-7 w-7 shrink-0 place-items-center",

                "rounded-full",

                "sm:h-9 sm:w-9",

                game.currentPlayer === 0 && game.phase !== "finished"
                  ? "bg-[#f2c76a] text-[#17263c]"
                  : "bg-[#29435f] text-[#b9cce4]",
              ].join(" ")}
            >
              <UserRound size={14} className="sm:h-[17px] sm:w-[17px]" />
            </div>

            <div className="min-w-0">
              <span
                className={[
                  "mb-1.5 block truncate",

                  "text-[9px] text-[#a7b7ce]",

                  "min-[380px]:text-[10px]",

                  "sm:mb-2 sm:text-sm",
                ].join(" ")}
              >
                {mode === "solo" ? "Pairs found" : "You"}
              </span>

              <strong className="flex items-baseline gap-1 text-lg leading-none sm:text-[27px]">
                {mode === "solo" ? pairsFound : game.scores[0]}

                <small className="text-[8px] font-normal text-[#8298b6] max-[360px]:hidden sm:text-xs">
                  pairs
                </small>
              </strong>
            </div>
          </div>

          {/* MIDDLE */}
          <div className="flex flex-col items-center justify-center text-center text-[10px] font-extrabold text-[#6f87a5] sm:text-xs">
            {mode === "solo" ? (
              <>
                {game.attempts}

                <small className="mt-0.5 text-[6px] tracking-wider sm:text-[7px]">
                  TRIES
                </small>
              </>
            ) : (
              "VS"
            )}
          </div>

          {/* RIGHT */}
          <div
            className={[
              "relative flex min-w-0 items-center justify-end gap-1.5",

              "rounded-lg border p-2",

              "text-right",

              "transition",

              "min-[380px]:rounded-xl",

              "sm:min-h-[76px]",

              "sm:gap-2 sm:px-4",

              mode === "computer" &&
              game.currentPlayer === 1 &&
              game.phase !== "finished"
                ? "border-[#d8b761] bg-[#27394d]"
                : "border-[#31445e] bg-[#172a45]",
            ].join(" ")}
          >
            <div className="min-w-0">
              <span
                className={[
                  "mb-1.5 block truncate",

                  "text-[9px] text-[#a7b7ce]",

                  "min-[380px]:text-[10px]",

                  "sm:mb-2 sm:text-sm",
                ].join(" ")}
              >
                {mode === "solo" ? "Left to find" : "Computer"}
              </span>

              <strong className="flex items-baseline justify-end gap-1 text-lg leading-none sm:text-[27px]">
                {mode === "solo" ? pairsLeft : game.scores[1]}

                <small className="text-[8px] font-normal text-[#8298b6] max-[360px]:hidden sm:text-xs">
                  pairs
                </small>
              </strong>
            </div>

            <div
              className={[
                "grid h-7 w-7 shrink-0 place-items-center",

                "rounded-full",

                "sm:h-9 sm:w-9",

                mode === "computer" &&
                game.currentPlayer === 1 &&
                game.phase !== "finished"
                  ? "bg-[#f2c76a] text-[#17263c]"
                  : "bg-[#29435f] text-[#b9cce4]",
              ].join(" ")}
            >
              {mode === "computer" ? (
                <Monitor size={14} className="sm:h-[17px] sm:w-[17px]" />
              ) : (
                <span className="font-serif text-base sm:text-lg">♠</span>
              )}
            </div>
          </div>
        </section>

        {/* GAME TABLE */}
        <section
          className={[
            "relative overflow-hidden",

            "rounded-xl",

            "border border-[#324963]",

            "bg-[#112c3d]",

            "p-1.5",

            "shadow-[inset_0_0_36px_rgba(4,19,31,0.32),0_12px_30px_rgba(3,8,17,0.16)]",

            "min-[380px]:p-2",

            "sm:rounded-2xl",

            "sm:p-3.5",

            "lg:p-4",
          ].join(" ")}
        >
          <div className="flex items-center justify-between px-0.5 pb-2 text-[9px] text-[#89a2b4] sm:pb-3 sm:text-xs">
            <span className="font-extrabold tracking-[0.12em] sm:tracking-[0.15em]">
              {revealedMatch ? "PAIR FOUND" : "MATCH THE RANK"}
            </span>

            <span>{pairsFound}/26</span>
          </div>

          <div
            className={[
              "grid grid-cols-6 gap-1",

              "min-[380px]:grid-cols-7",

              "min-[380px]:gap-1.5",

              "min-[560px]:grid-cols-9",

              "min-[560px]:gap-2",

              "min-[820px]:grid-cols-13",
            ].join(" ")}
          >
            {game.deck.map((card, index) => (
              <PlayingCard
                key={`${game.round}-${card.id}`}
                card={card}
                index={index}
                revealed={game.revealed.includes(index)}
                matched={game.matched.includes(index)}
                disabled={boardDisabled}
                onFlip={() => flip(index)}
                onFlipAnimationEnd={finishCardAnimation}
              />
            ))}
          </div>

          {game.phase === "finished" && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-[#071426]/90 p-3 sm:p-4">
              <div className="w-full max-w-sm rounded-2xl border border-[#766c56] bg-[#192e4a] p-5 text-center shadow-2xl sm:p-8">
                <Trophy
                  size={34}
                  className="mx-auto mb-3 text-[#f2c76a] sm:h-[38px] sm:w-[38px]"
                />

                <span className="text-[9px] font-extrabold tracking-[0.15em] text-[#91a6bd] sm:text-[10px]">
                  GAME COMPLETE
                </span>

                <h1 className="mt-2 text-2xl font-extrabold tracking-[-1px] sm:text-3xl">
                  {statusTitle()}
                </h1>

                <p className="mt-2 text-xs text-[#a9bbd1] sm:text-sm">
                  {statusDescription()}
                </p>

                <button
                  type="button"
                  onClick={() => reset()}
                  className="mt-5 h-10 w-full cursor-pointer rounded-lg bg-[#f2c76a] text-sm font-bold text-[#17263c] transition hover:bg-[#ffda8a] sm:mt-6 sm:h-11"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </section>

        {/* STATUS */}
        <section
          aria-live="polite"
          className="min-h-[58px] px-2 pt-3 text-center sm:min-h-[76px] sm:pt-4"
        >
          <strong className="block text-[13px] font-bold text-[#f7dab2] sm:text-base">
            {statusTitle()}
          </strong>

          <span className="mt-1 block text-[10px] text-[#8fa6c2] sm:text-sm">
            {statusDescription()}
          </span>
        </section>

        <footer className="flex items-center justify-center gap-2 pb-3 text-[9px] text-[#7088a6] sm:gap-2.5 sm:text-xs">
          <span className="font-serif text-xs tracking-[2px] sm:text-sm sm:tracking-[3px]">
            ♠ <i className="not-italic text-[#ad6470]">♥</i> ♣{" "}
            <i className="not-italic text-[#ad6470]">♦</i>
          </span>

          <span>A little less luck. A little more memory.</span>
        </footer>
      </main>

      <HowToPlayDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <ConfirmResetDialog
        open={pendingReset !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.label}
        onCancel={() => setPendingReset(null)}
        onConfirm={confirmReset}
      />
    </div>
  );
}
