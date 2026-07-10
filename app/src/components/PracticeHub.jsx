import "./PracticeHub.css";

const MODE_GROUPS = [
  {
    title: "Vocabulary",
    items: ["Article recall", "Gender patterns", "Word detail review", "Spaced repetition"],
  },
  {
    title: "Grammar",
    items: ["Rule cards", "Sentence completion", "Common errors", "Reference review"],
  },
  {
    title: "Mixed Skills",
    items: ["Meaning check", "Form choice", "Explanation reading", "Weakness review"],
  },
];

export default function PracticeHub({
  wordCount,
  nounCount,
  grammarRuleCount,
  grammarLoading,
  onStartMixed,
  onStartArticles,
  onOpenVocabulary,
  onOpenPatterns,
  onOpenGrammar,
  onOpenGrammarReference,
}) {
  const dailyTarget = Math.min(20, Math.max(8, Math.ceil(nounCount * 0.01)));
  const mixedReady = nounCount > 0 && grammarRuleCount > 0 && !grammarLoading;

  return (
    <main className="practice-hub">
      <section className="practice-hero">
        <div>
          <span className="practice-eyebrow">Practice hub</span>
          <h2>Choose the skill you want to train</h2>
          <p>
            Start with the daily queue, drill one weak area, or jump into grammar
            reference when you want the rule before the exercise.
          </p>
        </div>
        <button className="practice-primary-action" onClick={onStartMixed} disabled={!mixedReady}>
          Start mixed practice
          <span>Articles + grammar in one session</span>
        </button>
      </section>

      <section className="practice-metrics" aria-label="Practice coverage">
        <div>
          <strong>{nounCount}</strong>
          <span>article cards</span>
        </div>
        <div>
          <strong>{grammarLoading ? "..." : grammarRuleCount}</strong>
          <span>grammar rules</span>
        </div>
        <div>
          <strong>{wordCount}</strong>
          <span>searchable words</span>
        </div>
      </section>

      <section className="practice-mode-grid" aria-label="Practice modes">
        <button className="practice-mode-card is-primary" onClick={onStartMixed} disabled={!mixedReady}>
          <span>01</span>
          <strong>Mixed daily review</strong>
          <p>Rotate through article recall and grammar cards so practice feels closer to real use.</p>
          <em>Best default session</em>
        </button>

        <button className="practice-mode-card" onClick={onStartArticles} disabled={!nounCount}>
          <span>02</span>
          <strong>Article trainer</strong>
          <p>Guess der, die, or das and immediately see the rule and memory hint.</p>
          <em>{dailyTarget} noun cards</em>
        </button>

        <button className="practice-mode-card" onClick={onOpenPatterns}>
          <span>03</span>
          <strong>Pattern review</strong>
          <p>Study endings and rule reliability, then filter directly into examples.</p>
          <em>Best for noticing patterns</em>
        </button>

        <button className="practice-mode-card" onClick={onOpenGrammar}>
          <span>04</span>
          <strong>Grammar practice</strong>
          <p>Work through rule cards, sentence choices, and written grammar answers.</p>
          <em>Best for sentence control</em>
        </button>

        <button className="practice-mode-card" onClick={onOpenGrammarReference}>
          <span>05</span>
          <strong>Grammar reference</strong>
          <p>Review forms, common errors, and memory aids before practicing a topic.</p>
          <em>Best before difficult topics</em>
        </button>

        <button className="practice-mode-card" onClick={onOpenVocabulary}>
          <span>06</span>
          <strong>Word browser</strong>
          <p>Search, filter, group, and inspect words when you want slower review.</p>
          <em>Best for exploration</em>
        </button>
      </section>

      <section className="practice-coverage">
        <div className="practice-section-heading">
          <h3>What you are covering</h3>
          <span>Use this as a checklist while learning</span>
        </div>
        <div className="practice-coverage-grid">
          {MODE_GROUPS.map((group) => (
            <article key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
