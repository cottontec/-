import { QUIZ_MODE_LABELS } from "@/app/lib/types";
import type { QuizMode } from "@/app/lib/types";

const STYLE: Record<QuizMode, string> = {
  full: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  reading: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  listening: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  writing: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export default function ModeBadge({ mode, size = "md" }: { mode: QuizMode; size?: "sm" | "md" }) {
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span className={`rounded-full font-medium ${pad} ${STYLE[mode]}`}>
      {QUIZ_MODE_LABELS[mode]}
    </span>
  );
}
