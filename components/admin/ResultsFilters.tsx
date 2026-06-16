"use client";

import React from "react";

interface ResultsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cohortFilter: string;
  onCohortFilterChange: (value: string) => void;
  majorFilter: string;
  onMajorFilterChange: (value: string) => void;
  availableCohorts: string[];
  availableMajors: string[];
}

export default function ResultsFilters({
  searchTerm,
  onSearchChange,
  cohortFilter,
  onCohortFilterChange,
  majorFilter,
  onMajorFilterChange,
  availableCohorts,
  availableMajors,
}: ResultsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
      {/* Search input */}
      <div className="relative w-full sm:w-64">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          search
        </span>
        <input
          type="text"
          placeholder="Cari nama atau email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-xs font-inter transition-all bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Cohort select dropdown */}
      <select
        value={cohortFilter}
        onChange={(e) => onCohortFilterChange(e.target.value)}
        className="w-full sm:w-40 px-3 py-2.5 text-xs font-inter rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">Semua Angkatan</option>
        {availableCohorts.map((c) => (
          <option key={c} value={c}>
            Cohort {c}
          </option>
        ))}
      </select>

      {/* Major select dropdown */}
      <select
        value={majorFilter}
        onChange={(e) => onMajorFilterChange(e.target.value)}
        className="w-full sm:w-48 px-3 py-2.5 text-xs font-inter rounded-xl border border-gray-250 dark:border-gray-750 focus:outline-none focus:ring-2 focus:ring-blue-600/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">Semua Jurusan</option>
        {availableMajors.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
