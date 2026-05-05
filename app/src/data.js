const LEVELS = ["a1", "a2", "b1"];
const DATA_DIR = "/data";

// POS values that carry noun data (article, gender_patterns)
const NOUN_POS = new Set(["noun", "person_role_noun_pair", "noun_phrase"]);

// ── Incremental word cache ──────────────────────────────────────

let wordCache = [];
const loadedKeys = new Set();
const pendingRequests = new Map(); // deduplicate in-flight fetches

export function getWords() {
  return wordCache;
}

/**
 * Load words incrementally. Only fetches level+pos combinations not yet loaded.
 * @param {{ levels?: string[], pos?: string[] }} options
 * @returns {Promise<Array>} the full (updated) word list
 */
export async function loadWords({ levels = [], pos = [] } = {}) {
  const fetchPromises = [];

  // Empty pos means "show all" — load everything
  const showAll = pos.length === 0;
  const wantsNouns = showAll || pos.some((p) => NOUN_POS.has(p));
  const wantsOther = showAll || pos.some((p) => !NOUN_POS.has(p));

  for (const rawLevel of levels) {
    const level = rawLevel.toLowerCase();
    if (wantsNouns) {
      const key = `${level}_nouns`;
      if (!loadedKeys.has(key) && !pendingRequests.has(key)) {
        const file = `${DATA_DIR}/vhs_${level}_nouns.json`;
        const promise = fetchFile(level, key, file);
        pendingRequests.set(key, promise);
        fetchPromises.push(promise);
      } else if (pendingRequests.has(key)) {
        fetchPromises.push(pendingRequests.get(key));
      }
    }
    if (wantsOther) {
      const key = `${level}_other`;
      if (!loadedKeys.has(key) && !pendingRequests.has(key)) {
        const file = `${DATA_DIR}/vhs_${level}_other.json`;
        const promise = fetchFile(level, key, file);
        pendingRequests.set(key, promise);
        fetchPromises.push(promise);
      } else if (pendingRequests.has(key)) {
        fetchPromises.push(pendingRequests.get(key));
      }
    }
  }

  if (fetchPromises.length === 0) return wordCache;

  await Promise.all(fetchPromises);
  return wordCache;
}

async function fetchFile(level, key, file) {
  const resp = await fetch(file);
  const data = await resp.json();
  const words = data.vocabulary.map((w) => ({
    ...w,
    _level: level.toUpperCase(),
  }));
  // Only merge once — deduplicated concurrent callers share the same promise
  if (!loadedKeys.has(key)) {
    wordCache = [...wordCache, ...words];
    loadedKeys.add(key);
  }
  pendingRequests.delete(key);
  return words;
}

/**
 * For backward compat during transition. Returns all currently loaded words.
 */
export async function loadAllWords() {
  return loadWords({ levels: LEVELS, pos: [] });
}

// ── Derived data queries ────────────────────────────────────────

export function getTopics(words) {
  const topicSet = new Set();
  for (const w of words) {
    const topics = w.semantic?.topics || [];
    topics.forEach((t) => topicSet.add(t));
  }
  return [...topicSet].sort();
}

export function getGenderRules(words) {
  const rules = new Set();
  for (const w of words) {
    const rule = w.gender_patterns?.primary_rule;
    if (rule) rules.add(rule);
  }
  return [...rules].sort();
}

// ── Filtering ───────────────────────────────────────────────────

export function applyFilters(words, filters) {
  return words.filter((w) => {
    if (filters.levels.length > 0 && !filters.levels.includes(w._level)) {
      return false;
    }

    if (filters.articles.length > 0) {
      const article = w.noun?.article;
      if (!article || !filters.articles.includes(article)) return false;
    }

    if (filters.topics.length > 0) {
      const topics = w.semantic?.topics || [];
      if (!filters.topics.some((t) => topics.includes(t))) return false;
    }

    if (filters.genderRules.length > 0) {
      const rule = w.gender_patterns?.primary_rule;
      if (!rule || !filters.genderRules.includes(rule)) return false;
    }

    if (filters.pos.length > 0 && !filters.pos.includes(w.part_of_speech)) {
      return false;
    }

    if (
      filters.frequencies?.length > 0 &&
      !filters.frequencies.includes(w.usage?.frequency)
    ) {
      return false;
    }

    if (
      filters.registers?.length > 0 &&
      !filters.registers.includes(w.usage?.register)
    ) {
      return false;
    }

    if (
      filters.entityTypes?.length > 0 &&
      !filters.entityTypes.includes(w.semantic?.entity_type)
    ) {
      return false;
    }

    if (
      filters.learningStatus?.length > 0 &&
      !filters.learningStatus.includes(w._status || "new")
    ) {
      return false;
    }

    return true;
  });
}

export function getNounCounts(words, articles) {
  const counts = { der: 0, die: 0, das: 0 };
  for (const w of words) {
    const art = w.noun?.article;
    if (art && articles.has(art)) counts[art] = (counts[art] || 0) + 1;
  }
  return counts;
}
