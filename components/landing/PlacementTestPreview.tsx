"use client";

import { useState } from "react";

type OptionKey = "A" | "B" | "C";

interface Option {
  key: OptionKey;
  val: string;
  isCorrect: boolean;
}

const OPTIONS: Option[] = [
  { key: "A", val: "Scarce", isCorrect: false },
  { key: "B", val: "Plentiful", isCorrect: true },
  { key: "C", val: "Minimal", isCorrect: false },
];

export default function PlacementTestPreview() {
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [shake, setShake] = useState(false);

  const handleSelect = (key: OptionKey) => {
    setSelected(key);
    const selectedOption = OPTIONS.find(o => o.key === key);
    
    if (selectedOption && !selectedOption.isCorrect) {
      // Trigger shake animation for incorrect choice
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const resetSelection = () => {
    setSelected(null);
  };

  return (
    <div className="relative">
      {/* Background glow shadow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-3xl -z-10 transform -rotate-1"></div>
      
      {/* Main card */}
      <div className={`bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm relative overflow-hidden transition-all duration-300 ${
        shake ? "animate-shake" : ""
      }`}>
        {/* Top brand line indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-teal-500"></div>
        
        {/* Card Header info */}
        <div className="flex justify-between items-center mb-8">
          <span className="font-hanken font-bold text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100/50">
            Vocabulary Section
          </span>
          <span className="font-inter text-xs text-gray-400 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-blue-500">timer</span>
            Question 5 of 20
          </span>
        </div>

        {/* Question Text */}
        <h3 className="font-hanken text-lg md:text-xl font-bold text-gray-900 mb-8 leading-relaxed">
          Choose the correct synonym for &quot;abundant&quot;.
        </h3>

        {/* Options */}
        <div className="space-y-3.5">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.key;
            let optionStyles = "border-gray-150 hover:border-teal-500/50 hover:bg-gray-50/50";
            let circleStyles = "border-gray-300";

            if (isSelected) {
              if (opt.isCorrect) {
                optionStyles = "border-green-500 bg-green-50/40 text-green-700 shadow-sm shadow-green-100";
                circleStyles = "border-green-500 bg-green-500 text-white";
              } else {
                optionStyles = "border-red-400 bg-red-50/40 text-red-700 shadow-sm shadow-red-100";
                circleStyles = "border-red-400 bg-red-400 text-white";
              }
            } else if (selected !== null) {
              // If another option is selected, dim unselected options
              optionStyles = "border-gray-100 opacity-60 bg-gray-50/20";
            }

            return (
              <button
                key={opt.key}
                disabled={selected !== null}
                onClick={() => handleSelect(opt.key)}
                className={`w-full flex items-center p-4 border-2 rounded-xl text-left transition-all duration-200 ${optionStyles} ${
                  selected === null ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-all ${circleStyles}`}>
                  {isSelected && (
                    <span className="material-symbols-outlined text-xs">
                      {opt.isCorrect ? "check" : "close"}
                    </span>
                  )}
                </div>
                <span className={`font-inter text-sm font-semibold transition-colors ${
                  isSelected 
                    ? opt.isCorrect ? "text-green-700" : "text-red-700"
                    : "text-gray-700"
                }`}>
                  {opt.val}
                </span>
              </button>
            );
          })}
        </div>

        {/* Interactive feedback panel */}
        {selected !== null && (
          <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn space-y-3">
            {selected === "B" ? (
              <div className="p-4 rounded-xl bg-green-50/50 border border-green-200/50 flex gap-3 text-left">
                <span className="material-symbols-outlined text-green-600 flex-shrink-0">check_circle</span>
                <div>
                  <h4 className="font-hanken text-xs font-bold text-green-800">Jawaban Benar!</h4>
                  <p className="font-inter text-xs text-green-700 leading-relaxed mt-0.5">
                    &quot;Plentiful&quot; artinya melimpah atau banyak, yang merupakan sinonim langsung dari kata &quot;abundant&quot;. Kerja bagus!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50 flex gap-3 text-left">
                <span className="material-symbols-outlined text-red-600 flex-shrink-0">cancel</span>
                <div>
                  <h4 className="font-hanken text-xs font-bold text-red-800">Jawaban Salah</h4>
                  <p className="font-inter text-xs text-red-700 leading-relaxed mt-0.5">
                    &quot;{OPTIONS.find(o => o.key === selected)?.val}&quot; bukan sinonim yang tepat. Sinonim dari &quot;abundant&quot; (melimpah) adalah &quot;Plentiful&quot;.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={resetSelection}
                className="inline-flex items-center gap-1 text-xs font-hanken font-bold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
