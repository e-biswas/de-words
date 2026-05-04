const STORAGE_KEY = "ldw-memory";
const OLD_KEYS = ["ldw-learning-memory-v2", "ldw-learning-memory"];

// ── SRS Levels ─────────────────────────────────────────────────
// Level 0: New (never seen)
// Level 1: Seen, not yet correct
// Level 2: Correct 1-2 times
// Level 3: Correct 3+ times, interval 1 day
// Level 4: Interval 3 days
// Level 5: Mastered, interval 7 days

const INTERVALS = {
  0: 0,             // new — show anytime
  1: 3600000,       // 1 hour
  2: 4 * 3600000,   // 4 hours
  3: 86400000,      // 1 day
  4: 259200000,     // 3 days
  5: 604800000,     // 7 days
};

const LEVEL_LABELS = {
  0: "New",
  1: "Seen",
  2: "Learning",
  3: "Familiar",
  4: "Known",
  5: "Mastered",
};

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && Object.keys(data).length > 0) return data;
  } catch { /* corrupt data, continue */ }

  // Migrate from old keys
  for (const oldKey of OLD_KEYS) {
    try {
      const old = JSON.parse(localStorage.getItem(oldKey));
      if (old && Object.keys(old).length > 0) {
        save(old);
        // Don't delete old keys so user can go back if needed
        return old;
      }
    } catch { /* skip */ }
  }

  return {};
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage full or disabled — silently fail, data just won't persist
    console.warn("ldw: failed to save learning data", e);
  }
}

function makeEntry() {
  return {
    level: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: 0,
    nextReview: 0,
    history: [],
  };
}

// ── Core SRS: record a practice result ─────────────────────────

export function recordResult(wordId, wasCorrect) {
  const mem = load();
  const entry = mem[wordId] || makeEntry();

  entry.lastSeen = Date.now();
  entry.history.push({ ts: Date.now(), correct: wasCorrect });
  // Keep last 20 history entries
  if (entry.history.length > 20) entry.history = entry.history.slice(-20);

  if (wasCorrect) {
    entry.correct += 1;
    entry.streak = Math.max(0, entry.streak) + 1;

    // First correct → level 1 (seen). Each subsequent correct → level up (max 5).
    if (entry.level === 0 && entry.correct >= 1) {
      entry.level = 1;
    } else if (entry.level < 5 && entry.streak >= 2) {
      entry.level += 1;
      entry.streak = 0;
    }
  } else {
    entry.wrong += 1;
    entry.streak = 0;

    // Level down on wrong answer (min 0)
    if (entry.level > 1) {
      entry.level -= 1;
    } else if (entry.level === 1) {
      entry.level = 0;
    }
  }

  // Set next review time based on new level
  entry.nextReview = Date.now() + (INTERVALS[entry.level] || 0);

  mem[wordId] = entry;
  save(mem);
}

// ── Query functions ────────────────────────────────────────────

export function getStatus(wordId) {
  const mem = load();
  const entry = mem[wordId];
  if (!entry || entry.level === 0) return "new";
  if (entry.level <= 2) return "learning";
  if (entry.level >= 5) return "mastered";
  return "familiar";
}

export function getLevel(wordId) {
  const mem = load();
  return mem[wordId]?.level || 0;
}

export function getLevelLabel(wordId) {
  return LEVEL_LABELS[getLevel(wordId)] || "New";
}

export function getStats(wordId) {
  return load()[wordId] || null;
}

export function isDueForReview(wordId) {
  const mem = load();
  const entry = mem[wordId];
  if (!entry) return true; // new words are always "due"
  return Date.now() >= entry.nextReview;
}

// ── Session builder: smart word selection ──────────────────────

export function buildSession(words, count = null) {
  const mem = load();
  const now = Date.now();

  // Attach SRS data to each word
  const enriched = words.map((w) => {
    const entry = mem[w.id];
    return {
      ...w,
      _srsLevel: entry?.level || 0,
      _srsLabel: LEVEL_LABELS[entry?.level || 0],
      _isDue: !entry || now >= entry.nextReview,
      _nextReview: entry?.nextReview || 0,
      _overdue: entry ? Math.max(0, now - entry.nextReview) : Infinity,
    };
  });

  // Sort: due words first, then by level (lower first), then by overdue time (longest overdue first)
  const sorted = [...enriched].sort((a, b) => {
    // Due words first
    if (a._isDue !== b._isDue) return a._isDue ? -1 : 1;
    // Among due: lower level first (they need more practice)
    if (a._srsLevel !== b._srsLevel) return a._srsLevel - b._srsLevel;
    // Among same level: most overdue first
    return b._overdue - a._overdue;
  });

  if (count && count < sorted.length) {
    // Take a mix: 60% due/priority words, 40% random from remaining
    const due = sorted.filter((w) => w._isDue);
    const notDue = sorted.filter((w) => !w._isDue);

    const takeDue = Math.min(due.length, Math.ceil(count * 0.7));
    const takeNotDue = count - takeDue;

    // Shuffle due words a bit (not strictly sorted)
    const shuffledDue = shuffle(due).slice(0, takeDue);
    const shuffledNotDue = shuffle(notDue).slice(0, takeNotDue);

    return shuffle([...shuffledDue, ...shuffledNotDue]);
  }

  return sorted;
}

// ── Session stats ──────────────────────────────────────────────

export function getSessionSummary(wordIds) {
  const mem = load();
  const summary = {
    leveledUp: [],
    leveledDown: [],
    mastered: [],
    total: wordIds.length,
  };

  for (const id of wordIds) {
    const entry = mem[id];
    if (!entry) continue;
    const history = entry.history || [];
    if (history.length >= 2) {
      const prev = history[history.length - 2];
      const curr = history[history.length - 1];
      if (!prev.correct && curr.correct) summary.leveledUp.push(id);
      if (prev.correct && !curr.correct) summary.leveledDown.push(id);
    }
    if (entry.level >= 5) summary.mastered.push(id);
  }

  return summary;
}

// ── Bulk export / import for all statuses ─────────────────────

export function getAllStatuses() {
  let mem;
  try {
    mem = load();
  } catch {
    return {};
  }

  const now = Date.now();
  const statuses = {};
  for (const [id, entry] of Object.entries(mem)) {
    if (!entry || typeof entry !== "object") continue;
    statuses[id] = {
      status: id in mem ? getStatus(id) : "new",
      level: entry.level ?? 0,
      label: LEVEL_LABELS[entry.level] || "New",
      isDue: !entry.nextReview || now >= entry.nextReview,
      correct: entry.correct ?? 0,
      wrong: entry.wrong ?? 0,
      streak: entry.streak ?? 0,
      lastSeen: entry.lastSeen ?? 0,
      nextReview: entry.nextReview ?? 0,
    };
  }
  return statuses;
}

// ── Debug / reset ──────────────────────────────────────────────

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getRawMemory() {
  return load();
}

// ── Helpers ────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export { LEVEL_LABELS, INTERVALS };
