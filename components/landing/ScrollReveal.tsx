"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  direction?: "up" | "down" | "left" | "right" | "fade" | "zoom";
}

export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  durationMs = 1000,
  direction = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If browser doesn't support IntersectionObserver, reveal immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (currentRef) {
      // If already in viewport on initial render, reveal immediately without scroll delay
      const rect = currentRef.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => setIsVisible(true), delayMs);
          } else {
            setIsVisible(true);
          }
          // Once it's visible, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px 60px 0px", // Reveal slightly ahead of scroll
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delayMs]);

  // Determine initial state transform classes based on direction
  const getDirectionClass = () => {
    switch (direction) {
      case "up":
        return "translate-y-8";
      case "down":
        return "-translate-y-8";
      case "left":
        return "translate-x-8";
      case "right":
        return "-translate-x-8";
      case "zoom":
        return "scale-95";
      case "fade":
      default:
        return "";
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDuration: `${durationMs}ms` }}
      className={`transform transition-all ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0 scale-100"
          : `opacity-0 pointer-events-none ${getDirectionClass()}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
