import { useEffect, useMemo, useState } from "react";
import CatLogo from "./CatLogo";
import GrammarIcon from "./GrammarIcons";
import { formatGrammarTopicId } from "../grammarTopics";
import "./GrammarPractice.css";

function normalize(value) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
}

function cardLevel(card, rule) {
  return card.level || rule?.level || "B1";
}

export default function GrammarPractice({
  cards,
  rulesById,
  aidsById,
  onResult,
  onClose,
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0, streak: 0 });

  const card = cards[index];
  const rule = card ? rulesById[card.topic_id] : null;
  const aid = card ? aidsById[card.topic_id] : null;
  const options = card?.options || [];
  const isDone = index >= cards.length;
  const progress = Math.round((index / cards.length) * 100);
  const currentAnswer = options.length ? selected : typedAnswer;

  const sessionTopics = useMemo(
    () => [...new Set(cards.map((item) => item.topic_id))],
    [cards]
  );

  const submit = (answer) => {
    if (revealed || !answer.trim()) return;
    const accepted = [card.answer, ...(card.accepted_answers || [])].map(normalize);
    const correct = accepted.includes(normalize(answer));
    setSelected(answer);
    setRevealed(true);
    setScore((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
      streak: correct ? current.streak + 1 : 0,
    }));
    onResult(card, correct);
  };

  const goNext = () => {
    setSelected("");
    setTypedAnswer("");
    setRevealed(false);
    setShowRule(false);
    setIndex((current) => current + 1);
  };

  const trySimilar = () => {
    const next = cards.findIndex(
      (item, itemIndex) => itemIndex > index && item.topic_id === card.topic_id
    );
    if (next > index) {
      setSelected("");
      setTypedAnswer("");
      setRevealed(false);
      setShowRule(false);
      setIndex(next);
    } else {
      goNext();
    }
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
      if (revealed && (event.key === "Enter" || event.key === "ArrowRight")) {
        goNext();
      }
      if (!revealed && options.length && /^[1-4]$/.test(event.key)) {
        const option = options[Number(event.key) - 1];
        if (option) submit(option);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (isDone) {
    const total = score.correct + score.wrong;
    const percentage = total ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div className="grammar-practice">
        <header className="grammar-practice-header">
          <CatLogo size={30} />
          <strong>LDW</strong>
          <span>Grammar</span>
          <button type="button" onClick={onClose}><GrammarIcon name="close" /> Close</button>
        </header>
        <main className="grammar-complete">
          <h2>Session complete</h2>
          <strong>{percentage}%</strong>
          <p>{score.correct} correct - {score.wrong} to review</p>
          <button type="button" onClick={onClose}>Back to grammar</button>
        </main>
      </div>
    );
  }

  const isCorrect =
    revealed &&
    [card.answer, ...(card.accepted_answers || [])]
      .map(normalize)
      .includes(normalize(currentAnswer));
  const reasoning = card.reasoning_steps || [card.explanation_en];

  return (
    <div className="grammar-practice">
      <header className="grammar-practice-header">
        <div className="grammar-practice-brand">
          <CatLogo size={30} />
          <strong>LDW</strong>
          <span className="grammar-desktop-label">Grammar</span>
          <span className="grammar-mobile-label">Daily grammar</span>
        </div>
        <div className="grammar-session-progress">
          <span><strong>{index + 1} / {cards.length}</strong> Progress</span>
          <i><b style={{ width: `${progress}%` }} /></i>
        </div>
        <div className="grammar-session-score">
          <span><strong>{score.correct}</strong>Correct</span>
          <span><strong>{score.wrong}</strong>Wrong</span>
          <span><strong>{score.streak}</strong>Streak</span>
        </div>
        <button type="button" className="grammar-practice-close" onClick={onClose} aria-label="Close grammar practice">
          <GrammarIcon name="close" /> <span>Close</span>
        </button>
      </header>

      <div className="grammar-practice-layout">
        <aside className="grammar-session-topics">
          <h3>Session topics</h3>
          {sessionTopics.map((topicId, topicIndex) => {
            const active = topicId === card.topic_id;
            const topicCards = cards.filter((item) => item.topic_id === topicId);
            const completed = cards
              .slice(0, index)
              .filter((item) => item.topic_id === topicId).length;
            return (
              <button type="button" key={topicId} className={active ? "active" : ""}>
                <span>{formatGrammarTopicId(topicId)}</span>
                <i>
                  {topicCards.slice(0, 4).map((_, dotIndex) => (
                    <b key={dotIndex} className={dotIndex < completed ? "done" : ""} />
                  ))}
                </i>
                {active && <GrammarIcon name="chevron" size={15} />}
                {!active && <em>{topicIndex + 1}</em>}
              </button>
            );
          })}
          <button type="button" className="grammar-session-overview">
            <GrammarIcon name="list" /> Session overview
          </button>
        </aside>

        <main className="grammar-question">
          <span className="grammar-question-topic">
            {cardLevel(card, rule)} - {formatGrammarTopicId(card.topic_id)}
          </span>
          <h2>{card.prompt}</h2>

          {options.length ? (
            <div className="grammar-options">
              {options.map((option, optionIndex) => {
                const optionCorrect = revealed && normalize(option) === normalize(card.answer);
                const optionWrong =
                  revealed &&
                  normalize(option) === normalize(selected) &&
                  !optionCorrect;
                return (
                  <button
                    key={option}
                    type="button"
                    className={`${optionCorrect ? "correct" : ""} ${optionWrong ? "wrong" : ""}`}
                    onClick={() => submit(option)}
                    disabled={revealed}
                  >
                    <span>{optionIndex + 1}</span>
                    <strong>{option}</strong>
                    {(optionCorrect || optionWrong) && (
                      <GrammarIcon name={optionCorrect ? "check" : "close"} />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form
              className="grammar-written-answer"
              onSubmit={(event) => {
                event.preventDefault();
                submit(typedAnswer);
              }}
            >
              <label htmlFor="grammar-answer">Your answer</label>
              <textarea
                id="grammar-answer"
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                disabled={revealed}
                placeholder="Write the complete answer"
                autoFocus
              />
              {!revealed && <button type="submit">Check answer</button>}
            </form>
          )}

          {revealed && (
            <section className={`grammar-feedback ${isCorrect ? "correct" : "wrong"}`}>
              <h3>
                <span><GrammarIcon name={isCorrect ? "check" : "close"} /></span>
                {isCorrect ? "Correct" : "Review this answer"}
              </h3>
              {!isCorrect && (
                <p className="grammar-correct-answer">{card.answer}</p>
              )}
              <div className="grammar-reasoning">
                {reasoning.map((step, stepIndex) => (
                  <div key={step}>
                    <span>{stepIndex + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
              {aid && (
                <p className="grammar-memory-aid">
                  <span>Remember:</span> {aid.tip_en}
                </p>
              )}
            </section>
          )}

          <div className="grammar-question-actions">
            <button type="button" onClick={() => setShowRule((value) => !value)}>
              <GrammarIcon name="book" /> Review rule
            </button>
            {revealed && (
              <>
                <button type="button" onClick={trySimilar}>
                  <GrammarIcon name="retry" /> Try a similar one
                </button>
                <button type="button" className="primary" onClick={goNext}>
                  Next <GrammarIcon name="arrow" />
                </button>
              </>
            )}
          </div>
        </main>

        <aside className={`grammar-rule-panel ${showRule ? "mobile-open" : ""}`}>
          <button
            type="button"
            className="grammar-rule-mobile-close"
            onClick={() => setShowRule(false)}
            aria-label="Close grammar rule"
          >
            <GrammarIcon name="close" />
          </button>
          <section>
            <h3>Rule</h3>
            <p>{rule?.rule_en}</p>
          </section>
          <section>
            <h3>Form</h3>
            <p className="grammar-rule-form">{rule?.form}</p>
          </section>
          <section>
            <h3>Common error</h3>
            <p>{rule?.common_error}</p>
          </section>
          <section className="grammar-mastery-change">
            <h3>Mastery change</h3>
            <div>
              <GrammarIcon name="chart" size={24} />
              <strong>{revealed ? (isCorrect ? "+3%" : "0%") : "-"}</strong>
              <span>{revealed ? "this answer" : "answer to update"}</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
