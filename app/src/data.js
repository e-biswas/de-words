const LEVELS = ["a1", "a2", "b1"];
const DATA_DIR = "/data";
const SHARD_KINDS = ["nouns", "other"];
const SHARDS = LEVELS.flatMap((level) =>
  SHARD_KINDS.map((kind) => ({
    level,
    kind,
    key: `${level}_${kind}`,
    file: `${DATA_DIR}/vhs_${level}_${kind}.json`,
  }))
);

// POS values that carry noun data (article, gender_patterns)
const NOUN_POS = new Set(["noun", "person_role_noun_pair", "noun_phrase"]);

// ── Incremental word cache ──────────────────────────────────────

let wordCache = [];
const shardCache = new Map();
const loadedKeys = new Set();
const pendingRequests = new Map(); // deduplicate in-flight fetches

export function getWords() {
  return wordCache;
}

export function isAllWordsLoaded() {
  return loadedKeys.size === SHARDS.length;
}

/**
 * Load words incrementally. Only fetches level+pos combinations not yet loaded.
 * @param {{ levels?: string[], pos?: string[] }} options
 * @returns {Promise<Array>} the full (updated) word list
 */
export async function loadWords({ levels = [], pos = [] } = {}) {
  const fetchPromises = [];

  for (const shard of resolveShards({ levels, pos })) {
    if (loadedKeys.has(shard.key)) continue;
    fetchPromises.push(queueShardRequest(shard));
  }

  if (fetchPromises.length === 0) return wordCache;

  await Promise.all(fetchPromises);
  return wordCache;
}

function queueShardRequest(shard) {
  if (!pendingRequests.has(shard.key)) {
    pendingRequests.set(shard.key, fetchFile(shard));
  }

  return pendingRequests.get(shard.key);
}

function resolveShards({ levels = [], pos = [] } = {}) {
  const selectedLevels =
    levels.length > 0
      ? new Set(levels.map((level) => level.toLowerCase()))
      : new Set(LEVELS);

  // Empty pos means "show all" — load both noun and non-noun shards.
  const showAll = pos.length === 0;
  const selectedKinds = new Set();
  if (showAll || pos.some((p) => NOUN_POS.has(p))) selectedKinds.add("nouns");
  if (showAll || pos.some((p) => !NOUN_POS.has(p))) selectedKinds.add("other");

  return SHARDS.filter(
    (shard) => selectedLevels.has(shard.level) && selectedKinds.has(shard.kind)
  );
}

async function fetchFile({ level, key, file }) {
  try {
    const resp = await fetch(file);
    if (!resp.ok) {
      throw new Error(`Failed to load ${file}: ${resp.status}`);
    }

    const data = await resp.json();
    const words = data.vocabulary.map((w) => ({
      ...w,
      _level: level.toUpperCase(),
    }));

    // Only merge once — deduplicated concurrent callers share the same promise
    if (!loadedKeys.has(key)) {
      shardCache.set(key, words);
      loadedKeys.add(key);
      rebuildWordCache();
    }

    return words;
  } finally {
    pendingRequests.delete(key);
  }
}

function rebuildWordCache() {
  wordCache = SHARDS.flatMap((shard) => shardCache.get(shard.key) || []);
}

/**
 * Load every vocabulary shard in parallel, while still sharing any in-flight
 * requests started by filtered views.
 */
export async function loadAllWords() {
  const fetchPromises = SHARDS
    .filter((shard) => !loadedKeys.has(shard.key))
    .map(queueShardRequest);

  if (fetchPromises.length === 0) return wordCache;

  const results = await Promise.allSettled(fetchPromises);
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    console.warn(`Failed to load ${failed.length} vocabulary shard(s)`, failed);
  }

  return wordCache;
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

    // Pattern stats filters (set by clicking a pattern row)
    if (filters.gender_rule?.length > 0) {
      const rule = w.gender_patterns?.primary_rule;
      if (!rule || !filters.gender_rule.includes(rule)) return false;
    }

    if (filters.ending_pattern?.length > 0) {
      const ending = w.gender_patterns?.ending_pattern;
      if (!ending || !filters.ending_pattern.includes(ending)) return false;
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
