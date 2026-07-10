const STORAGE_KEY = "ldw-grammar-memory-v1";

function readMemory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function writeMemory(memory) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
}

export function getGrammarMemory() {
  return readMemory();
}

export function recordGrammarResult(card, correct) {
  const memory = readMemory();
  const previous = memory[card.id] || {
    attempts: 0,
    correct: 0,
    streak: 0,
  };

  memory[card.id] = {
    attempts: previous.attempts + 1,
    correct: previous.correct + (correct ? 1 : 0),
    streak: correct ? previous.streak + 1 : 0,
    topicId: card.topic_id,
    lastSeen: new Date().toISOString(),
  };
  writeMemory(memory);
  return memory;
}

export function topicProgress(cards, memory, topicId) {
  const topicCards = cards.filter((card) => card.topic_id === topicId);
  const attempts = topicCards.reduce(
    (sum, card) => sum + (memory[card.id]?.attempts || 0),
    0
  );
  const correct = topicCards.reduce(
    (sum, card) => sum + (memory[card.id]?.correct || 0),
    0
  );
  const mastery = attempts ? Math.round((correct / attempts) * 100) : 0;
  const due = topicCards.filter((card) => {
    const stats = memory[card.id];
    return !stats || stats.streak < 2;
  }).length;

  return { attempts, correct, mastery, due };
}

export function buildGrammarSession(cards, memory, topicIds, limit = 10) {
  const allowed = new Set(topicIds);
  const candidates = cards.filter((card) => allowed.has(card.topic_id));

  return [...candidates]
    .sort((a, b) => {
      const aStats = memory[a.id];
      const bStats = memory[b.id];
      const aPriority = aStats ? aStats.streak * 10 + aStats.correct : -1;
      const bPriority = bStats ? bStats.streak * 10 + bStats.correct : -1;
      return aPriority - bPriority || a.difficulty - b.difficulty;
    })
    .slice(0, limit);
}
