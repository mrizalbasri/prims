"use client";

export default function LogsTab() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150 dark:border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-6 w-px bg-blue-600 dark:bg-blue-400"></div>
            <h1 className="font-hanken text-3xl font-extrabold text-gray-950 dark:text-white">
              Log Aktivitas Sistem
            </h1>
          </div>
          <p className="font-inter text-sm text-gray-500 dark:text-gray-400">
            Pantau alur autentikasi, status evaluasi AI, dan kesehatan database secara real-time.
          </p>
        </div>
      </header>

      {/* Logs Viewer */}
      <div className="bg-gray-950 rounded-3xl border border-gray-850 shadow-xl overflow-hidden font-mono text-xs">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-850 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-400 font-bold">
              System Status: <span className="text-emerald-400">ONLINE</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <span className="cursor-pointer hover:text-white transition-colors">Clear Console</span>
            <span>|</span>
            <span>v2.0.1</span>
          </div>
        </div>
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto text-gray-300">
          {[
            { time: "23:20:14", type: "INFO", msg: "PrismaClient connected to PostgreSQL pool at localhost:5433" },
            { time: "23:20:18", type: "AUTH", msg: "Admin session generated successfully for user admin@president.ac.id" },
            { time: "23:22:45", type: "SCORING", msg: "Evaluation process completed for testAttemptId 'vocab_grammar_reading_0' with overallLevel: ADVANCED" },
            { time: "23:23:01", type: "API", msg: "POST /api/test/submit - status 200 OK - execution time 2410ms" },
            { time: "23:24:15", type: "DB", msg: "Successfully ran db seed for Phase 2 data (Vocabulary, Writing Prompts, Speaking Scenarios)" },
          ].map((log, i) => (
            <div
              key={i}
              className="flex items-start gap-4 hover:bg-gray-900/50 py-1 px-2 rounded transition-colors"
            >
              <span className="text-gray-650 shrink-0">{log.time}</span>
              <span
                className={`font-bold shrink-0 ${
                  log.type === "INFO"
                    ? "text-blue-400"
                    : log.type === "AUTH"
                    ? "text-purple-400"
                    : log.type === "SCORING"
                    ? "text-emerald-400"
                    : log.type === "DB"
                    ? "text-amber-400"
                    : "text-gray-400"
                }`}
              >
                [{log.type}]
              </span>
              <span className="text-gray-400 break-all">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
