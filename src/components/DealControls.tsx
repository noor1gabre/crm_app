"use client";

import { updateDealStage, deleteDeal } from "@/lib/actions";
import { useTransition } from "react";

const STAGES = ["prospecting", "qualified", "proposal", "won", "lost"];

const STAGE_STYLES: Record<string, string> = {
  prospecting: "bg-[var(--accent-soft)] text-[var(--accent)]",
  qualified: "bg-[var(--accent-soft)] text-[var(--accent)]",
  proposal: "bg-[var(--amber-soft)] text-[var(--amber)]",
  won: "bg-[var(--accent-soft)] text-[var(--accent)]",
  lost: "bg-[var(--red-soft)] text-[var(--red)]",
};

export function DealStageControl({
  dealId,
  stage,
}: {
  dealId: number;
  stage: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={stage}
      disabled={isPending}
      onChange={(e) => {
        const newStage = e.target.value;
        startTransition(() => {
          updateDealStage(dealId, newStage);
        });
      }}
      className={`text-xs font-mono-data rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer disabled:opacity-50 ${
        STAGE_STYLES[stage] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function DeleteDealButton({ dealId }: { dealId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this deal? This is a DELETE event your CDC pipeline should capture.")) {
          startTransition(() => {
            deleteDeal(dealId);
          });
        }
      }}
      className="text-xs text-[var(--slate)] hover:text-[var(--red)] transition-colors disabled:opacity-50"
    >
      delete
    </button>
  );
}
