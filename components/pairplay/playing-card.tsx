"use client";

import { useLayoutEffect, useRef } from "react";

import {
  CARD_BACK_PATH,
  getCardFacePath,
  getCardLabel,
} from "@/lib/pairplay/cards";

import { CARD_FLIP_MS } from "@/lib/pairplay/timing";

import type { Card } from "@/lib/pairplay/types";

interface PlayingCardProps {
  card: Card;
  index: number;

  revealed: boolean;
  matched: boolean;
  disabled: boolean;

  onFlip: () => void;
  onFlipAnimationEnd: () => void;
}

export function PlayingCard({
  card,
  index,
  revealed,
  matched,
  disabled,
  onFlip,
  onFlipAnimationEnd,
}: PlayingCardProps) {
  const rotatorRef = useRef<HTMLDivElement>(null);

  const faceUp = revealed || matched;

  const previousFaceUpRef = useRef(faceUp);

  const facePath = getCardFacePath(card);

  const cardLabel = getCardLabel(card);

  useLayoutEffect(() => {
    const element = rotatorRef.current;

    if (!element) {
      return;
    }

    const previousFaceUp = previousFaceUpRef.current;

    if (previousFaceUp === faceUp) {
      return;
    }

    previousFaceUpRef.current = faceUp;

    /*
     * Cancel any unfinished visual animation.
     *
     * React still owns the permanent final
     * rotateY state underneath.
     */
    element.getAnimations().forEach((animation) => {
      animation.cancel();
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || typeof element.animate !== "function") {
      onFlipAnimationEnd();

      return;
    }

    /*
     * Actual physical movement.
     *
     * Both SVG faces already exist.
     *
     * At 90° the card is edge-on.
     * Past 90° the reverse SVG naturally
     * becomes visible.
     */
    const keyframes: Keyframe[] = faceUp
      ? [
          {
            transform: "rotateY(0deg) translateZ(0px) scale(1)",
            offset: 0,
          },
          {
            transform: "rotateY(30deg) translateZ(4px) scale(1.008)",
            offset: 0.18,
          },
          {
            transform: "rotateY(65deg) translateZ(11px) scale(1.02)",
            offset: 0.36,
          },
          {
            transform: "rotateY(90deg) translateZ(17px) scale(1.032)",
            offset: 0.5,
          },
          {
            transform: "rotateY(115deg) translateZ(11px) scale(1.02)",
            offset: 0.64,
          },
          {
            transform: "rotateY(150deg) translateZ(4px) scale(1.008)",
            offset: 0.82,
          },
          {
            transform: "rotateY(180deg) translateZ(0px) scale(1)",
            offset: 1,
          },
        ]
      : [
          {
            transform: "rotateY(180deg) translateZ(0px) scale(1)",
            offset: 0,
          },
          {
            transform: "rotateY(150deg) translateZ(4px) scale(1.008)",
            offset: 0.18,
          },
          {
            transform: "rotateY(115deg) translateZ(11px) scale(1.02)",
            offset: 0.36,
          },
          {
            transform: "rotateY(90deg) translateZ(17px) scale(1.032)",
            offset: 0.5,
          },
          {
            transform: "rotateY(65deg) translateZ(11px) scale(1.02)",
            offset: 0.64,
          },
          {
            transform: "rotateY(30deg) translateZ(4px) scale(1.008)",
            offset: 0.82,
          },
          {
            transform: "rotateY(0deg) translateZ(0px) scale(1)",
            offset: 1,
          },
        ];

    const animation = element.animate(keyframes, {
      duration: CARD_FLIP_MS,

      easing: "cubic-bezier(0.32, 0.05, 0.18, 1)",

      /*
       * Do not let Web Animations own
       * the final state.
       *
       * React owns the permanent
       * 0° / 180° transform.
       */
      fill: "none",
    });

    animation.onfinish = () => {
      onFlipAnimationEnd();
    };

    return () => {
      animation.onfinish = null;

      animation.cancel();
    };
  }, [faceUp, onFlipAnimationEnd]);

  return (
    <button
      type="button"
      disabled={disabled || revealed || matched}
      onClick={onFlip}
      aria-label={faceUp ? cardLabel : `Face-down card ${index + 1}`}
      className={[
        "group relative block",

        "aspect-[5/7] w-full",

        "border-0 bg-transparent p-0",

        matched
          ? "pointer-events-none cursor-default"
          : disabled || faceUp
            ? "cursor-default"
            : "cursor-pointer",
      ].join(" ")}
      style={{
        perspective: "950px",

        perspectiveOrigin: "50% 50%",
      }}
    >
      {/*
       * Visual effects remain OUTSIDE
       * the preserve-3d element.
       */}
      <div
        className={[
          "absolute inset-0",

          "rounded-[5px]",

          "transition-[transform,opacity,box-shadow]",

          "duration-200",

          matched ? "scale-[0.94] opacity-0" : "scale-100 opacity-100",

          !disabled && !faceUp
            ? [
                "shadow-[0_3px_7px_rgba(0,0,0,0.42)]",
                "group-hover:-translate-y-0.5",
                "group-hover:shadow-[0_6px_12px_rgba(0,0,0,0.32)]",
              ].join(" ")
            : "shadow-[0_3px_7px_rgba(0,0,0,0.28)]",
        ].join(" ")}
      >
        {/*
         * PURE TWO-SIDED 3D OBJECT.
         */}
        <div
          ref={rotatorRef}
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",

            WebkitTransformStyle: "preserve-3d",

            transformOrigin: "50% 50%",

            /*
             * Permanent state.
             *
             * The temporary keyframe animation
             * plays over this.
             */
            transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* BACK FACE */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",

              WebkitBackfaceVisibility: "hidden",

              transform: "rotateY(0deg)",
            }}
          >
            <img
              src={CARD_BACK_PATH}
              alt=""
              draggable={false}
              loading="eager"
              decoding="async"
              className={[
                "pointer-events-none",

                "block h-full w-full",

                "select-none",

                "rounded-[5px]",
              ].join(" ")}
            />
          </div>

          {/* FRONT FACE */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",

              WebkitBackfaceVisibility: "hidden",

              transform: "rotateY(180deg)",
            }}
          >
            <img
              src={facePath}
              alt=""
              draggable={false}
              loading="eager"
              decoding="async"
              className={[
                "pointer-events-none",

                "block h-full w-full",

                "select-none",

                "rounded-[5px]",
              ].join(" ")}
            />
          </div>
        </div>
      </div>

      {matched && (
        <span
          aria-hidden="true"
          className={[
            "absolute inset-0",

            "rounded-[5px]",

            "border border-dashed border-[#385767]/60",

            "bg-[#163442]/10",
          ].join(" ")}
        />
      )}
    </button>
  );
}
