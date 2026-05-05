import { useState, useEffect, useCallback } from "react";
import { loadWords, getWords } from "../data";
import { getAllStatuses } from "../memory";

function applyStatuses(words) {
  const statuses = getAllStatuses();
  return words.map((w) => {
    const s = statuses[w.id];
    return {
      ...w,
      _status: s?.status || "new",
      _srsLevel: s?.level || 0,
      _srsLabel: s?.label || "New",
    };
  });
}

export function useWords(filters) {
  const [allWords, setAllWords] = useState(() => applyStatuses(getWords()));
  const [loading, setLoading] = useState(true);
  const [memoryVersion, setMemoryVersion] = useState(0);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    loadWords({ levels: filters.levels, pos: filters.pos })
      .then((words) => {
        if (cancelled) return;
        setAllWords(applyStatuses(words));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load words", err);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Incremental loads when level or POS filters change
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    loadWords({ levels: filters.levels, pos: filters.pos })
      .then((words) => {
        if (cancelled) return;
        setAllWords(applyStatuses(words));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load words", err);
      });
    return () => { cancelled = true; };
  }, [filters.levels, filters.pos]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshMemory = useCallback(() => {
    setAllWords((words) => applyStatuses(words));
    setMemoryVersion((v) => v + 1);
  }, []);

  return { allWords, loading, memoryVersion, refreshMemory };
}
