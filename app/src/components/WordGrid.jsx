import humanize from "../utils/humanize";
import "./WordGrid.css";

const LEVEL_DOTS = ["", "·", "··", "···", "✦", "★"];

export default function WordGrid({ words, onSelect, selectedId }) {
  if (words.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📖</div>
        <p>No words match your filters</p>
        <span className="empty-hint">Try removing some filters or selecting a different level</span>
      </div>
    );
  }

  return (
    <div className="word-grid">
      {words.map((w, i) => {
        const article = w.noun?.article;
        const isSelected = w.id === selectedId;

        return (
          <button
            key={w.id}
            className={`word-card ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(w)}
            style={{ animationDelay: `${i * 25}ms` }}
          >
            <div className="card-top">
              <span className={`card-article article-${article || "none"}`}>
                {article || w.part_of_speech}
              </span>
              {w._srsLevel > 0 && (
                <span className="card-level" title={`Level ${w._srsLevel}: ${w._srsLabel}`}>
                  {LEVEL_DOTS[w._srsLevel] || ""}
                </span>
              )}
            </div>
            <span className="card-word">{w.word}</span>
            <span className="card-meaning">
              {w.meaning?.simple_en || w.meaning?.en || w.meaning_en}
            </span>
            <div className="card-bottom">
              {w.gender_patterns && (
                <span className={`card-rule-badge badge-${w.gender_patterns.primary_rule}`}>
                  {humanize(w.gender_patterns.primary_rule)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
