"use client";

import { useState, useRef } from "react";

type HighlightRange = {
  start: number;
  end: number;
};

type HighlightableTextProps = {
  text: string;
};

export default function HighlightableText({ text }: HighlightableTextProps) {
  const [highlights, setHighlights] = useState<HighlightRange[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [pendingRange, setPendingRange] = useState<HighlightRange | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to find the plain text offset of the selection
  const getSelectionOffsets = (element: HTMLElement) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;

    const range = sel.getRangeAt(0);
    
    // Ensure selection is inside the container
    if (!element.contains(range.commonAncestorContainer)) return null;

    // We clone the range and calculate offsets relative to the text content
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;

    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = preCaretRange.toString().length;

    return { start, end };
  };

  const handleMouseUp = () => {
    if (!containerRef.current) return;
    const offsets = getSelectionOffsets(containerRef.current);

    if (offsets && offsets.start !== offsets.end) {
      const sel = window.getSelection();
      const range = sel?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to container
        setTooltipPos({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 45,
        });
        setPendingRange(offsets);
        setShowTooltip(true);
      }
    } else {
      setShowTooltip(false);
      setPendingRange(null);
    }
  };

  const addHighlight = () => {
    if (!pendingRange) return;

    setHighlights((prev) => {
      const next = [...prev, pendingRange];
      // Sort and merge overlapping ranges
      next.sort((a, b) => a.start - b.start);
      const merged: HighlightRange[] = [];
      for (const range of next) {
        if (merged.length === 0) {
          merged.push(range);
        } else {
          const last = merged[merged.length - 1];
          if (range.start <= last.end) {
            last.end = Math.max(last.end, range.end);
          } else {
            merged.push(range);
          }
        }
      }
      return merged;
    });

    // Clear selection
    window.getSelection()?.removeAllRanges();
    setShowTooltip(false);
    setPendingRange(null);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };



  if (!text) return null;

  // Render text with highlight spans
  const renderContent = () => {
    if (highlights.length === 0) return text;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((range, idx) => {
      // Non-highlighted text before the highlight
      if (range.start > lastIndex) {
        nodes.push(text.substring(lastIndex, range.start));
      }

      // Highlighted text
      nodes.push(
        <mark
          key={idx}
          onClick={() => removeHighlight(idx)}
          className="bg-yellow-200 dark:bg-yellow-500/40 text-gray-900 dark:text-white rounded px-0.5 cursor-pointer hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors select-text"
          title="Klik untuk menghapus highlight"
        >
          {text.substring(range.start, range.end)}
        </mark>
      );

      lastIndex = range.end;
    });

    // Remainder of text
    if (lastIndex < text.length) {
      nodes.push(text.substring(lastIndex));
    }

    return nodes;
  };

  return (
    <div className="relative">
      <h3 className="font-hanken text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <span className="material-symbols-outlined text-teal-600">menu_book</span>
        Reading Passage
      </h3>
      
      {/* Floating Highlight Button */}
      {showTooltip && (
        <button
          onClick={addHighlight}
          style={{
            position: "absolute",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translateX(-50%)",
          }}
          className="z-30 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-inter text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 transition-all hover:scale-105 border border-yellow-300 cursor-pointer animate-fade-in"
        >
          <span className="material-symbols-outlined text-sm">border_color</span>
          Highlight
        </button>
      )}

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="font-inter text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line select-text"
      >
        {renderContent()}
      </div>
      
      <p className="text-[10px] text-gray-400 dark:text-gray-500 italic mt-6 flex items-center gap-1.5 select-none">
        <span className="material-symbols-outlined text-sm">info</span>
        Tips: Sorot teks dengan mouse lalu klik tombol &quot;Highlight&quot; untuk menandai kata kunci. Klik teks berwarna kuning untuk menghapusnya.
      </p>
    </div>
  );
}
