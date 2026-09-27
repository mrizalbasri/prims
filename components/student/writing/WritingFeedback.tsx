import type { FeedbackObject } from "./types";

export default function WritingFeedback({ feedback }: { feedback: string | FeedbackObject | null | undefined }) {
  if (!feedback) return null;
  if (typeof feedback === "string") {
    return <div className="font-inter text-sm text-gray-750 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-850 p-5 rounded-xl border border-gray-150 dark:border-gray-750 shadow-sm">{feedback}</div>;
  }

  const categories: { key: keyof Omit<FeedbackObject, "suggestions">; label: string; icon: string; color: string; bg: string }[] = [
    { key: "grammar", label: "Grammar & Structure", icon: "spellcheck", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
    { key: "vocabulary", label: "Vocabulary Usage", icon: "style", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { key: "content", label: "Content & Relevance", icon: "menu_book", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
    { key: "organization", label: "Coherence & Organization", icon: "schema", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const explanation = feedback[category.key];
          if (!explanation) return null;
          return (
            <div key={category.key} className="bg-white dark:bg-gray-850 p-5 rounded-2xl border border-gray-150 dark:border-gray-750 shadow-sm space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined p-1.5 rounded-lg text-sm ${category.color} ${category.bg}`}>{category.icon}</span>
                <h4 className="font-hanken text-sm font-bold text-gray-900 dark:text-white">{category.label}</h4>
              </div>
              <p className="font-inter text-xs text-gray-650 dark:text-gray-300 leading-relaxed">{explanation}</p>
            </div>
          );
        })}
      </div>
      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 rounded-2xl p-6 space-y-3 text-left">
          <h4 className="font-hanken text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2"><span className="material-symbols-outlined">lightbulb</span>Rekomendasi Perbaikan</h4>
          <ul className="space-y-2">
            {feedback.suggestions.map((suggestion, index) => (
              <li key={`${suggestion}-${index}`} className="flex gap-2.5 items-start font-inter text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">check_circle</span><span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
