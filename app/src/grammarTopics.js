export const GRAMMAR_TOPIC_NAMES = {
  "word-order-main": "Main-clause word order",
  "word-order-subordinate": "Subordinate clauses",
  "connectors-causal": "Reasons and results",
  "connectors-concessive": "Contrast and concession",
  "connectors-purpose": "Purpose clauses",
  "connectors-paired": "Paired connectors",
  "temporal-clauses": "Temporal clauses",
  "indirect-questions": "Indirect questions",
  "relative-clauses": "Relative clauses",
  "infinitive-zu": "Infinitives with zu",
  "konjunktiv-ii": "Konjunktiv II",
  passive: "Passive",
  "past-tenses": "Past tenses",
  future: "Future and assumptions",
  "modal-verbs": "Modal verbs",
  cases: "Cases",
  "adjective-endings": "Adjective endings",
  genitive: "Genitive",
  "n-declension": "N-declension",
  "verbs-prepositions": "Verbs with prepositions",
  "pronominal-adverbs": "Pronominal adverbs",
  negation: "Negation",
  comparison: "Comparison",
  participles: "Participles",
  nominalization: "Nominalization",
  "word-formation": "Word formation",
  lassen: "Lassen",
  "indirect-speech": "Reported speech",
  "ordinal-numbers": "Ordinal numbers",
  "werden-uses": "Uses of werden",
  "possessive-determiners": "Possessive determiners",
  diminutives: "Diminutives",
  "relative-wo-was": "Relative wo and was",
  "adversative-connectors": "Adversative connectors",
  "temporal-prepositions": "Temporal prepositions",
  "integrated-multi-rule": "Mixed grammar",
};

export function formatGrammarTopicId(topicId) {
  if (GRAMMAR_TOPIC_NAMES[topicId]) return GRAMMAR_TOPIC_NAMES[topicId];

  return topicId
    .replace(/^a[12]-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
