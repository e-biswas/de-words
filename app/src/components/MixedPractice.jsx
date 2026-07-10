import { useCallback, useEffect, useMemo, useState } from "react";
import { buildSession, recordResult } from "../memory";
import {
  buildGrammarSession,
  getGrammarMemory,
  recordGrammarResult,
} from "../grammarMemory";
import humanize from "../utils/humanize";
import "./MixedPractice.css";

function normalize(value) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
}

function formatCardType(type) {
  return humanize(type || "grammar").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildMixedItems(words, grammarData) {
  const nounItems = buildSession(words.filter((word) => word.noun), 5).map((word) => ({
    id: `word-${word.id}`,
    type: "article",
    word,
  }));

  const topicIds = grammarData.topic_catalog.map((topic) => topic.id);
  const grammarItems = buildGrammarSession(
    grammarData.cards,
    getGrammarMemory(),
    topicIds,
    5
  ).map((card) => ({
    id: `grammar-${card.id}`,
    type: "grammar",
    card,
  }));

  const mixed = [];
  const maxLength = Math.max(nounItems.length, grammarItems.length);
  for (let index = 0; index < maxLength; index += 1) {
    if (nounItems[index]) mixed.push(nounItems[index]);
    if (grammarItems[index]) mixed.push(grammarItems[index]);
  }
  return mixed;
}

export default function MixedPractice({
  words,
  grammarData,
  onClose,
  onOpenGrammarReference,
}) {
  const items = useMemo(() => buildMixedItems(words, grammarData), [words, grammarData]);
  const rulesById = useMemo(
    () => Object.fromEntries(grammarData.rule_library.map((rule) => [rule.topic_id, rule])),
    [grammarData.rule_library]
  );
  const aidsById = useMemo(
    () => Object.fromEntries(grammarData.memory_aids.map((aid) => [aid.topic_id, aid])),
    [grammarData.memory_aids]
  );

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const item = items[index];
  const progress = items.length ? Math.round((index / items.length) * 100) : 0;
  const isArticle = item?.type === "article";
  const options = useMemo(
    () => (item ? (isArticle ? ["der", "die", "das"] : item.card.options || []) : []),
    [isArticle, item]
  );
  const correctAnswer = item
    ? isArticle
      ? item.word.noun.article
      : item.card.answer
    : "";

  const submit = useCallback((value) => {
    if (!item || revealed || !value.trim()) return;

    let correct = false;
    if (item.type === "article") {
      correct = value === item.word.noun.article;
      recordResult(item.word.id, correct);
    } else {
      const accepted = [
        item.card.answer,
        ...(item.card.accepted_answers || []),
      ].map(normalize);
      correct = accepted.includes(normalize(value));
      recordGrammarResult(item.card, correct);
    }

    setAnswer(value);
    setRevealed(true);
    setResult(correct);
    setScore((current) => ({
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
    }));
  }, [item, revealed]);

  const reveal = useCallback(() => {
    if (!item || revealed) return;

    if (item.type === "article") {
      recordResult(item.word.id, false);
    } else {
      recordGrammarResult(item.card, false);
    }

    setAnswer(correctAnswer);
    setRevealed(true);
    setResult(false);
    setScore((current) => ({
      correct: current.correct,
      wrong: current.wrong + 1,
    }));
  }, [correctAnswer, item, revealed]);

  const next = useCallback(() => {
    setAnswer("");
    setRevealed(false);
    setResult(null);
    setIndex((current) => current + 1);
  }, []);

  const restart = useCallback(() => {
    setAnswer("");
    setRevealed(false);
    setResult(null);
    setScore({ correct: 0, wrong: 0 });
    setIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const targetName = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(targetName)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (revealed) {
        if (event.key === "Enter") {
          event.preventDefault();
          next();
        } else if (
          event.key.toLowerCase() === "r" &&
          !isArticle &&
          item?.card?.topic_id &&
          onOpenGrammarReference
        ) {
          event.preventDefault();
          onOpenGrammarReference(item.card.topic_id);
        }
        return;
      }

      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) {
        event.preventDefault();
        submit(options[optionIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isArticle, item, next, onClose, onOpenGrammarReference, options, revealed, submit]);

  if (!items.length) {
    return (
      <div className="mixed-practice">
        <main className="mixed-empty">
          <h2>No mixed practice is ready yet</h2>
          <p>Try again after vocabulary and grammar data finish loading.</p>
          <button onClick={onClose}>Back to practice hub</button>
        </main>
      </div>
    );
  }

  if (index >= items.length) {
    const total = score.correct + score.wrong;
    const percent = total ? Math.round((score.correct / total) * 100) : 0;
    const articleCount = items.filter((sessionItem) => sessionItem.type === "article").length;
    const grammarCount = items.length - articleCount;
    return (
      <div className="mixed-practice">
        <main className="mixed-complete">
          <span>Mixed practice complete</span>
          <h2>{percent}%</h2>
          <p>{score.correct} correct - {score.wrong} to review</p>

          <dl className="mixed-complete-stats">
            <div>
              <dt>Total</dt>
              <dd>{items.length}</dd>
            </div>
            <div>
              <dt>Articles</dt>
              <dd>{articleCount}</dd>
            </div>
            <div>
              <dt>Grammar</dt>
              <dd>{grammarCount}</dd>
            </div>
          </dl>

          <div className="mixed-complete-actions">
            <button onClick={restart}>Practice again</button>
            <button className="secondary" onClick={onClose}>Back to practice hub</button>
          </div>
        </main>
      </div>
    );
  }

  const rule = isArticle ? null : rulesById[item.card.topic_id];
  const aid = isArticle ? null : aidsById[item.card.topic_id];
  const grammarTags = !isArticle
    ? [...(item.card.telc_skills || []), ...(item.card.tags || [])].slice(0, 4)
    : [];

  return (
    <div className="mixed-practice">
      <header className="mixed-header">
        <div>
          <strong>Mixed practice</strong>
          <span>{index + 1} / {items.length}</span>
        </div>
        <i><b style={{ width: `${progress}%` }} /></i>
        <button onClick={onClose}>Close</button>
      </header>

      <main className="mixed-card">
        <span className={`mixed-type ${isArticle ? "vocab" : "grammar"}`}>
          {isArticle ? "Article trainer" : "Grammar card"}
        </span>

        {isArticle ? (
          <>
            <h2>{item.word.noun.singular || item.word.word}</h2>
            <p>{item.word.meaning?.en || item.word.meaning_en}</p>
          </>
        ) : (
          <>
            <h2>{item.card.prompt}</h2>
            <p>{rule?.rule_en}</p>
          </>
        )}

        {options.length ? (
          <div className={isArticle ? "mixed-article-options" : "mixed-grammar-options"}>
            {options.map((option) => (
              <button
                key={option}
                className={[
                  revealed && option === correctAnswer ? "is-correct" : "",
                  revealed && option === answer ? "is-selected" : "",
                  revealed && option === answer && option !== correctAnswer ? "is-wrong" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => submit(option)}
                disabled={revealed}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <form
            className="mixed-written-answer"
            onSubmit={(event) => {
              event.preventDefault();
              submit(answer);
            }}
          >
            <label htmlFor="mixed-answer">Your answer</label>
            <textarea
              id="mixed-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={revealed}
              placeholder="Write the complete answer"
            />
            {!revealed && <button type="submit">Check answer</button>}
          </form>
        )}

        {revealed && (
          <section className={`mixed-feedback ${result ? "correct" : "wrong"}`}>
            <h3>{result ? "Correct" : "Review this one"}</h3>
            <dl className="mixed-answer-summary">
              <div>
                <dt>Your answer</dt>
                <dd>{answer || "Revealed"}</dd>
              </div>
              <div>
                <dt>Correct answer</dt>
                <dd>{correctAnswer}</dd>
              </div>
            </dl>

            {isArticle ? (
              <div>
                <p>
                  <span>{humanize(item.word.gender_patterns?.primary_rule || "rule")}</span>{" "}
                  {item.word.gender_patterns?.rule_detail}
                </p>
                {item.word.gender_patterns?.learner_hint && (
                  <em>{item.word.gender_patterns.learner_hint}</em>
                )}
              </div>
            ) : (
              <div>
                <div className="mixed-card-meta">
                  <span>{formatCardType(item.card.type)}</span>
                  {grammarTags.map((tag) => (
                    <span key={tag}>{humanize(tag)}</span>
                  ))}
                </div>
                {(item.card.reasoning_steps || [item.card.explanation_en]).map((step, stepIndex) => (
                  <p key={`${item.card.id}-${stepIndex}`}>{step}</p>
                ))}
                {item.card.rule_de && (
                  <p>
                    <span>Pattern</span> {item.card.rule_de}
                  </p>
                )}
                {aid && <em>{aid.tip_en}</em>}
                {onOpenGrammarReference && (
                  <div className="mixed-feedback-actions">
                    <button onClick={() => onOpenGrammarReference(item.card.topic_id)}>
                      Review rule
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="mixed-actions">
          {revealed ? (
            <button className="primary" onClick={next}>Next</button>
          ) : (
            <button onClick={reveal}>Reveal and review</button>
          )}
        </footer>

        <div className="mixed-shortcuts" aria-label="Keyboard shortcuts">
          {!revealed && options.length > 0 && <span><kbd>1</kbd>-<kbd>{options.length}</kbd> choose</span>}
          {revealed && <span><kbd>Enter</kbd> next</span>}
          {revealed && !isArticle && onOpenGrammarReference && <span><kbd>R</kbd> rule</span>}
          <span><kbd>Esc</kbd> close</span>
        </div>
      </main>
    </div>
  );
}
