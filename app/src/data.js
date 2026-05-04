const LEVELS = ["a1", "a2", "b1"];
const DATA_FILES = {
  a1: "/data/vhs_a1.json",
  a2: "/data/vhs_a2.json",
  b1: "/data/vhs_b1.json",
};

let cachedWords = null;

export async function loadAllWords() {
  if (cachedWords) return cachedWords;

  const results = await Promise.all(
    LEVELS.map(async (level) => {
      const resp = await fetch(DATA_FILES[level]);
      const data = await resp.json();
      return data.vocabulary.map((w) => ({
        ...w,
        _level: level.toUpperCase(),
      }));
    })
  );

  cachedWords = results.flat();
  return cachedWords;
}

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

export function applyFilters(words, filters) {
  return words.filter((w) => {
    // Level filter
    if (filters.levels.length > 0 && !filters.levels.includes(w._level)) {
      return false;
    }

    // Article filter (nouns only)
    if (filters.articles.length > 0) {
      const article = w.noun?.article;
      if (!article || !filters.articles.includes(article)) return false;
    }

    // Topic filter
    if (filters.topics.length > 0) {
      const topics = w.semantic?.topics || [];
      if (!filters.topics.some((t) => topics.includes(t))) return false;
    }

    // Gender rule filter (nouns only)
    if (filters.genderRules.length > 0) {
      const rule = w.gender_patterns?.primary_rule;
      if (!rule || !filters.genderRules.includes(rule)) return false;
    }

    // Part of speech filter
    if (filters.pos.length > 0 && !filters.pos.includes(w.part_of_speech)) {
      return false;
    }

    // Frequency filter
    if (
      filters.frequencies?.length > 0 &&
      !filters.frequencies.includes(w.usage?.frequency)
    ) {
      return false;
    }

    // Register filter
    if (
      filters.registers?.length > 0 &&
      !filters.registers.includes(w.usage?.register)
    ) {
      return false;
    }

    // Entity type filter
    if (
      filters.entityTypes?.length > 0 &&
      !filters.entityTypes.includes(w.semantic?.entity_type)
    ) {
      return false;
    }

    // Learning status filter
    if (
      filters.learningStatus?.length > 0 &&
      !filters.learningStatus.includes(w._status || "fresh")
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
