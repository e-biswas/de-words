import { memo } from "react";
import humanize from "../utils/humanize";
import "./WordGrid.css";

const LEVEL_DOTS = ["", "·", "··", "···", "✦", "★"];

function WordGrid({ words, onSelect, selectedId }) {
  const animateCards = words.length <= 40;

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
        const shouldAnimate = animateCards && i < 12;

        return (
          <button
            key={w.id}
            className={`word-card ${isSelected ? "selected" : ""} ${shouldAnimate ? "card-animate" : ""}`}
            onClick={() => onSelect(w)}
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

export default memo(WordGrid);
