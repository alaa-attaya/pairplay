"use client";

import {
  Brain,
  Layers3,
  MousePointerClick,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface HowToPlayDialogProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayDialog({ open, onClose }: HowToPlayDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className={[
        "fixed inset-0 z-[100]",
        "flex items-end justify-center",
        "bg-[#020811]/80 backdrop-blur-md",
        "sm:items-center sm:p-5",
      ].join(" ")}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        onMouseDown={(event) => event.stopPropagation()}
        className={[
          "relative flex w-full flex-col",
          "max-h-[94svh]",
          "overflow-hidden",
          "rounded-t-[24px]",
          "border border-[#405878]",
          "bg-[#14243d]",
          "shadow-[0_30px_90px_rgba(0,0,0,0.55)]",

          "sm:max-h-[88svh]",
          "sm:max-w-2xl",
          "sm:rounded-[26px]",
        ].join(" ")}
      >
        {/* Header */}
        <div
          className={[
            "relative shrink-0",
            "border-b border-[#314761]",
            "px-4 pb-4 pt-5",
            "sm:px-7 sm:pb-5 sm:pt-6",
          ].join(" ")}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className={[
              "absolute right-3 top-3",
              "grid h-9 w-9 cursor-pointer place-items-center",
              "rounded-full",
              "bg-[#203551]",
              "text-[#c4d0df]",
              "transition",
              "hover:bg-[#2b4260]",
              "hover:text-white",
              "sm:right-4 sm:top-4",
            ].join(" ")}
          >
            <X size={18} />
          </button>

          <div className="pr-12">
            <span className="text-[9px] font-extrabold tracking-[0.16em] text-[#f2c76a] sm:text-[10px]">
              HOW TO PLAY
            </span>

            <h2
              id="how-to-play-title"
              className={[
                "mt-1.5",
                "text-[26px] font-extrabold",
                "leading-[1.05]",
                "tracking-[-1px]",
                "sm:mt-2 sm:text-4xl",
              ].join(" ")}
            >
              Good cards.
              <br />
              Better memory.
            </h2>

            <p
              className={[
                "mt-2.5 max-w-xl",
                "text-[13px] leading-5",
                "text-[#adbed4]",
                "sm:mt-3 sm:text-[15px] sm:leading-6",
              ].join(" ")}
            >
              Pairplay uses a full 52-card deck. Match any two cards with the
              same rank, regardless of suit.
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className={[
            "min-h-0 flex-1 overflow-y-auto",
            "overscroll-contain",
            "px-4 py-4",
            "sm:px-7 sm:py-5",
          ].join(" ")}
        >
          <div
            className={[
              "grid grid-cols-1 gap-2.5",
              "min-[560px]:grid-cols-2",
            ].join(" ")}
          >
            <RuleCard
              number="01"
              icon={<MousePointerClick size={18} />}
              title="Reveal two cards"
              description="Choose any two face-down cards on the table."
            />

            <RuleCard
              number="02"
              icon={<Layers3 size={18} />}
              title="Match the rank"
              description="Two Aces match. Two Kings match. Their suits do not matter."
            />

            <RuleCard
              number="03"
              icon={<Trophy size={18} />}
              title="Keep matching"
              description="A correct pair scores one point and lets that player continue."
            />

            <RuleCard
              number="04"
              icon={<RotateCcw size={18} />}
              title="Remember misses"
              description="A miss turns both cards back over and passes the turn."
            />
          </div>

          <div
            className={[
              "mt-4 rounded-xl",
              "border border-[#425773]",
              "bg-[#1a304c]",
              "p-3.5",
              "sm:mt-5 sm:rounded-2xl sm:p-5",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "grid h-9 w-9 shrink-0 place-items-center",
                  "rounded-lg",
                  "bg-[#f2c76a]/10",
                  "text-[#f2c76a]",
                ].join(" ")}
              >
                <Brain size={18} />
              </div>

              <div className="min-w-0">
                <strong className="block text-[13px] font-bold text-[#f2d180] sm:text-sm">
                  The computer does not cheat
                </strong>

                <p className="mt-1 text-[12px] leading-5 text-[#9db0c8] sm:text-sm">
                  Easy remembers the last 4 revealed cards. Medium remembers 8.
                  Hard remembers every card that has actually been revealed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={[
            "shrink-0",
            "border-t border-[#314761]",
            "bg-[#14243d]",
            "px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3",
            "sm:px-7 sm:pb-5 sm:pt-4",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onClose}
            className={[
              "h-11 w-full cursor-pointer",
              "rounded-xl",
              "bg-[#f2c76a]",
              "font-bold text-[#17263c]",
              "transition",
              "hover:bg-[#ffda8a]",
            ].join(" ")}
          >
            Start playing
          </button>
        </div>
      </section>
    </div>
  );
}

interface RuleCardProps {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}

function RuleCard({ number, icon, title, description }: RuleCardProps) {
  return (
    <div
      className={[
        "rounded-xl",
        "border border-[#354c69]",
        "bg-[#192d48]",
        "p-3.5",
        "sm:p-4",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div
          className={[
            "grid h-8 w-8 place-items-center",
            "rounded-lg",
            "bg-[#263e5c]",
            "text-[#d9c083]",
            "sm:h-9 sm:w-9",
          ].join(" ")}
        >
          {icon}
        </div>

        <span className="text-[9px] font-bold tracking-widest text-[#617a99] sm:text-[10px]">
          {number}
        </span>
      </div>

      <strong className="mt-2.5 block text-[13px] font-bold text-[#e1e8f0] sm:mt-3 sm:text-sm">
        {title}
      </strong>

      <p className="mt-1 text-[11px] leading-[1.55] text-[#8fa4bf] sm:mt-1.5 sm:text-[13px] sm:leading-5">
        {description}
      </p>
    </div>
  );
}
