"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmResetDialogProps {
  open: boolean;

  title: string;
  description: string;

  confirmLabel: string;

  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmResetDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmResetDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      onMouseDown={onCancel}
      className={[
        "fixed inset-0 z-[110]",

        "grid place-items-center",

        "bg-[#020811]/80",

        "p-3",

        "backdrop-blur-sm",

        "sm:p-5",
      ].join(" ")}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
        className={[
          "relative",

          "w-full max-w-[420px]",

          "rounded-2xl",

          "border border-[#405878]",

          "bg-[#14243d]",

          "p-4",

          "shadow-[0_25px_80px_rgba(0,0,0,0.55)]",

          "sm:p-5",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className={[
            "absolute right-3 top-3",

            "grid h-8 w-8 cursor-pointer place-items-center",

            "rounded-full",

            "text-[#8fa4bf]",

            "transition",

            "hover:bg-[#203551]",

            "hover:text-white",
          ].join(" ")}
        >
          <X size={17} />
        </button>

        <div
          className={[
            "grid h-10 w-10 place-items-center",

            "rounded-xl",

            "bg-[#f2c76a]/10",

            "text-[#f2c76a]",
          ].join(" ")}
        >
          <AlertTriangle size={20} />
        </div>

        <h2
          id="reset-dialog-title"
          className="mt-4 pr-8 text-xl font-bold tracking-[-0.4px] text-[#f7f3e8]"
        >
          {title}
        </h2>

        <p
          id="reset-dialog-description"
          className="mt-2 text-[13px] leading-5 text-[#98abc4] sm:text-sm"
        >
          {description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={[
              "h-10 cursor-pointer",

              "rounded-lg",

              "border border-[#3d526e]",

              "bg-[#192e49]",

              "text-sm font-semibold",

              "text-[#c3cfdd]",

              "transition",

              "hover:bg-[#203853]",

              "hover:text-white",
            ].join(" ")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={[
              "h-10 cursor-pointer",

              "rounded-lg",

              "bg-[#f2c76a]",

              "text-sm font-bold",

              "text-[#17263c]",

              "transition",

              "hover:bg-[#ffda8a]",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
