import type { ReactNode } from "react";

type FeedbackBannerProps = {
  tone: "error" | "info" | "success";
  title: string;
  children?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

const toneStyles = {
  error: {
    container: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200",
    icon: "error",
    action: "border-red-300 bg-white text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200",
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200",
    icon: "info",
    action: "border-blue-300 bg-white text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200",
  },
  success: {
    container: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-200",
    icon: "check_circle",
    action: "border-teal-300 bg-white text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-200",
  },
} as const;

export default function FeedbackBanner({
  tone,
  title,
  children,
  actionLabel,
  onAction,
}: FeedbackBannerProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${styles.container}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span className="material-symbols-outlined mt-0.5 text-xl">{styles.icon}</span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-hanken text-sm font-bold">{title}</p>
        {children && <div className="text-sm leading-relaxed opacity-90">{children}</div>}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`mt-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${styles.action}`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
