import { useState, useEffect, useCallback } from "react";
import { loadAllWords, loadWords, getWords, isAllWordsLoaded } from "../data";
import { getAllStatuses } from "../memory";

const LEVEL_LOAD_PRIORITY = ["A1", "A2", "B1"];

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

function getQuickStartLevels(levels) {
  if (levels.length === 0) return [LEVEL_LOAD_PRIORITY[0]];

  const selected = new Set(levels);
  return [LEVEL_LOAD_PRIORITY.find((level) => selected.has(level)) || levels[0]];
}

export function useWords(filters) {
  const [allWords, setAllWords] = useState(() => applyStatuses(getWords()));
  const [loading, setLoading] = useState(() => getWords().length === 0);
  const [loadingAll, setLoadingAll] = useState(() => !isAllWordsLoaded());
  const [memoryVersion, setMemoryVersion] = useState(0);

  // Load one useful shard first, then the full visible slice, then everything.
  useEffect(() => {
    let cancelled = false;
    const quickStartLevels = getQuickStartLevels(filters.levels);

    async function loadVocabulary() {
      try {
        const quickWords = await loadWords({
          levels: quickStartLevels,
          pos: filters.pos,
        });
        if (!cancelled) {
          setAllWords(applyStatuses(quickWords));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load initial words", err);
          setLoading(false);
        }
      }

      try {
        const visibleWords = await loadWords({
          levels: filters.levels,
          pos: filters.pos,
        });
        if (!cancelled) {
          setAllWords(applyStatuses(visibleWords));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load selected words", err);
        }
      }

      try {
        const words = await loadAllWords();
        if (!cancelled) {
          setAllWords(applyStatuses(words));
          setLoading(false);
          setLoadingAll(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load words", err);
          setLoadingAll(false);
        }
      }
    }

    loadVocabulary();

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshMemory = useCallback(() => {
    setAllWords((words) => applyStatuses(words));
    setMemoryVersion((v) => v + 1);
  }, []);

  return { allWords, loading, loadingAll, memoryVersion, refreshMemory };
}
