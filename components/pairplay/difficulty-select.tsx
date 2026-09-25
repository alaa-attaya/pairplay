"use client";

import { Check, ChevronDown } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { DIFFICULTIES } from "@/lib/pairplay/ai";

import type { Difficulty } from "@/lib/pairplay/types";

interface DifficultySelectProps {
  value: Difficulty;

  onChange: (value: Difficulty) => void;
}

const LEVELS = Object.keys(DIFFICULTIES) as Difficulty[];

export function DifficultySelect({ value, onChange }: DifficultySelectProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function choose(level: Difficulty) {
    setOpen(false);

    onChange(level);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex h-8 w-full cursor-pointer items-center justify-between",

          "gap-2",

          "rounded-lg",

          "border border-[#455a78]",

          "bg-[#1b304b]",

          "px-2.5",

          "text-left",

          "text-[11px] font-semibold",

          "text-[#f2d180]",

          "transition",

          "hover:border-[#667b98]",

          "hover:bg-[#213852]",

          "sm:h-9",

          "sm:px-3.5",

          "sm:text-[12px]",

          open ? "border-[#f2c76a]/70 ring-2 ring-[#f2c76a]/10" : "",
        ].join(" ")}
      >
        <span className="truncate">{DIFFICULTIES[value].label}</span>

        <ChevronDown
          size={14}
          className={[
            "shrink-0",

            "text-[#d4ba7d]",

            "transition-transform duration-150",

            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Computer difficulty"
          className={[
            "absolute left-0 top-[calc(100%+7px)] z-50",

            "w-[190px]",

            "overflow-hidden",

            "rounded-xl",

            "border border-[#415672]",

            "bg-[#142740]",

            "p-1.5",

            "shadow-[0_18px_45px_rgba(0,0,0,0.45)]",
          ].join(" ")}
        >
          {LEVELS.map((level) => {
            const active = level === value;

            return (
              <button
                key={level}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => choose(level)}
                className={[
                  "flex w-full cursor-pointer items-center justify-between",

                  "gap-3",

                  "rounded-lg",

                  "px-3 py-2.5",

                  "text-left",

                  "transition",

                  active
                    ? "bg-[#f2c76a] text-[#16263b]"
                    : "text-[#d3deeb] hover:bg-[#203753]",
                ].join(" ")}
              >
                <span className="min-w-0">
                  <strong className="block text-[12px] font-semibold">
                    {DIFFICULTIES[level].label}
                  </strong>

                  <span
                    className={[
                      "mt-0.5 block whitespace-nowrap",

                      "text-[10px]",

                      active ? "text-[#58523d]" : "text-[#879bb6]",
                    ].join(" ")}
                  >
                    {level === "easy" && "Remembers 4 cards"}

                    {level === "medium" && "Remembers 8 cards"}

                    {level === "hard" && "Remembers everything"}
                  </span>
                </span>

                {active && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
