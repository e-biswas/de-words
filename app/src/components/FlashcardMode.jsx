import { useState, useMemo, useCallback, useEffect } from "react";
import { recordResult, getStats, buildSession, LEVEL_LABELS } from "../memory";
import humanize from "../utils/humanize";
import "./FlashcardMode.css";

export default function FlashcardMode({ words, onClose }) {
  const session = useMemo(() => buildSession(words), [words]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [animating, setAnimating] = useState(false);
  const [showMeaningAlways, setShowMeaningAlways] = useState(false);
  const [peeked, setPeeked] = useState(new Set());

  const current = session[index];
  const isDone = index >= session.length;
  const progress = session.length > 0 ? ((index) / session.length) * 100 : 0;
  const prevStats = current ? getStats(current.id) : null;

  const handleGuess = useCallback(
    (article) => {
      if (revealed) return;
      const correct = article === current.noun.article;
      setGuess(article);
      setRevealed(true);

      if (correct) {
        setScore((s) => ({ ...s, correct: s.correct + 1 }));
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
        setStreak(0);
      }

      recordResult(current.id, correct);
    },
    [revealed, current]
  );

  const handleNext = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setGuess(null);
      setRevealed(false);
      setIndex((i) => i + 1);
      setAnimating(false);
    }, 200);
  }, []);

  const handleSkip = useCallback(() => {
    setSkipped((s) => new Set([...s, current.id]));
    recordResult(current.id, false);
    setAnimating(true);
    setTimeout(() => {
      setGuess(null);
      setRevealed(false);
      setIndex((i) => i + 1);
      setAnimating(false);
    }, 200);
  }, [current]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "1") handleGuess("der");
      if (e.key === "2") handleGuess("die");
      if (e.key === "3") handleGuess("das");
      if (e.key === "ArrowRight" || e.key === " ") handleNext();
      if (e.key === "s" || e.key === "S") handleSkip();
      if (e.key === "m" || e.key === "M") setShowMeaningAlways((m) => !m);
      if (e.key === "/") setPeeked((p) => new Set([...p, current.id]));
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGuess, handleNext, handleSkip, onClose, current, peeked]);

  if (isDone) {
    const total = score.correct + score.wrong;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div className="flashcard-overlay" onClick={onClose}>
        <div className="flashcard-modal results" onClick={(e) => e.stopPropagation()}>
          <h2>Session Complete!</h2>
          <div className="results-visual">
            <div
              className="results-ring"
              style={{
                background: `conic-gradient(var(--das) ${pct * 3.6}deg, var(--die) 0deg)`,
              }}
            >
              <span className="results-pct">{pct}%</span>
            </div>
          </div>
          <div className="results-stats">
            <div className="stat correct">{score.correct} correct</div>
            <div className="stat wrong">{score.wrong} wrong</div>
            <div className="stat streak">Best streak: {bestStreak}</div>
            {skipped.size > 0 && (
              <div className="stat skipped">{skipped.size} skipped</div>
            )}
          </div>
          <button className="btn-primary" onClick={onClose}>
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const gp = current.gender_patterns;

  return (
    <div className="flashcard-overlay" onClick={onClose}>
      <div className="flashcard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="flashcard-header">
          <span className="flashcard-progress">
            {index + 1} / {session.length}
            {current._srsLevel > 0 && (
              <span className="flashcard-level-tag">Lv{current._srsLevel}</span>
            )}
          </span>
          <span className="flashcard-stats">
            <span className="stat-ok">{score.correct} ✓</span>
            <span className="stat-wrong">{score.wrong} ✗</span>
            {streak >= 3 && <span className="stat-streak">🔥 {streak}</span>}
          </span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className={`flashcard-body ${animating ? "animating" : ""}`}>
          <div className="flashcard-word">
            <span className="flashcard-level">{current._level}</span>
            <h2>{current.noun?.singular || current.word}</h2>
            <div className="flashcard-meaning-area">
              {(showMeaningAlways || peeked.has(current.id)) ? (
                <p className="flashcard-meaning">
                  {current.meaning?.en || current.meaning_en}
                </p>
              ) : (
                <button
                  className="peek-btn"
                  onClick={() => setPeeked((p) => new Set([...p, current.id]))}
                >
                  peek meaning
                </button>
              )}
            </div>
          </div>

          {!revealed ? (
            <div className="flashcard-choices">
              <button className="choice-btn choice-der" onClick={() => handleGuess("der")}>der</button>
              <button className="choice-btn choice-die" onClick={() => handleGuess("die")}>die</button>
              <button className="choice-btn choice-das" onClick={() => handleGuess("das")}>das</button>
            </div>
          ) : (
            <div className="flashcard-result">
              <div className={`result-banner ${guess === current.noun.article ? "correct" : "wrong"}`}>
                {guess === current.noun.article
                  ? `✓ Correct — ${current.noun.article} ${current.noun.singular || current.word}`
                  : `✗ Wrong — it's ${current.noun.article} ${current.noun.singular || current.word}`}
              </div>

              <div className="result-detail">
                {gp && (
                  <>
                    <div className="result-pattern">
                      <span className={`badge badge-${gp.primary_rule}`}>{humanize(gp.primary_rule)}</span>{" "}
                      {gp.rule_detail}
                      {gp.ending_pattern && (
                        <span className="mono"> ({gp.ending_pattern})</span>
                      )}
                    </div>
                    {gp.learner_hint && (
                      <p className="result-hint">{gp.learner_hint}</p>
                    )}
                  </>
                )}
                {prevStats && (
                  <p className="result-history">
                    Seen {prevStats.correct + prevStats.wrong}× before —{" "}
                    {Math.round((prevStats.correct / Math.max(1, prevStats.correct + prevStats.wrong)) * 100)}% correct
                  </p>
                )}
              </div>

              <div className="flashcard-actions">
                <button className="btn-secondary" onClick={handleSkip}>Skip (s)</button>
                <button className="btn-primary" onClick={handleNext}>Next (→)</button>
              </div>
            </div>
          )}
        </div>

        <div className="flashcard-shortcuts">
          <span className="desk-only"><kbd>1</kbd> der</span>
          <span className="desk-only"><kbd>2</kbd> die</span>
          <span className="desk-only"><kbd>3</kbd> das</span>
          <span className="desk-only"><kbd>→</kbd> next</span>
          <span className="desk-only"><kbd>s</kbd> skip</span>
          <span className="desk-only"><kbd>/</kbd> peek</span>
          <button
            className={`meaning-toggle ${showMeaningAlways ? "on" : ""}`}
            onClick={() => setShowMeaningAlways((m) => !m)}
          >
            {showMeaningAlways ? "Meaning on" : "Meaning off"}
          </button>
        </div>
      </div>
    </div>
  );
}
