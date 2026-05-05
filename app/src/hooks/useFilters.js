import { useState, useCallback } from "react";

const DEFAULT_FILTERS = {
  levels: ["A1"],
  articles: [],
  topics: [],
  genderRules: [],
  pos: ["noun"],
  frequencies: [],
  registers: [],
  entityTypes: [],
  learningStatus: [],
};

export function useFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const toggleFilter = useCallback((category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  }, []);

  const toggleLevel = useCallback((level) => {
    setFilters((prev) => {
      const current = prev.levels;
      const next = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level];
      return { ...prev, levels: next };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      levels: [],
      articles: [],
      topics: [],
      genderRules: [],
      pos: [],
      frequencies: [],
      registers: [],
      entityTypes: [],
      learningStatus: [],
    });
  }, []);

  const applyPatternFilter = useCallback((category, value) => {
    setFilters((prev) => {
      if (prev[category]?.includes(value)) return prev;
      return { ...prev, [category]: [value] };
    });
  }, []);

  return { filters, setFilters, toggleFilter, toggleLevel, clearAllFilters, applyPatternFilter };
}
