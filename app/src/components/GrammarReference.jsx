import { useMemo, useState } from "react";
import GrammarIcon from "./GrammarIcons";
import { grammarRuleGuides } from "../grammarRuleGuides";
import "./GrammarReference.css";

export default function GrammarReference({
  topics,
  data,
  level,
  onStart,
  selectedTopicId,
}) {
  const [selectedId, setSelectedId] = useState(selectedTopicId || topics[0]?.id || null);

  const deepNotesById = useMemo(
    () =>
      Object.fromEntries(
        (data.b1_deep_rule_notes || []).map((note) => [note.topic_id, note.details])
      ),
    [data.b1_deep_rule_notes]
  );
  const aidsById = useMemo(
    () =>
      Object.fromEntries(data.memory_aids.map((aid) => [aid.topic_id, aid.tip_en])),
    [data.memory_aids]
  );

  const selected = topics.find((topic) => topic.id === selectedId) || topics[0];
  const details = selected
    ? selected.rule?.details || deepNotesById[selected.id] || []
    : [];
  const guide = selected ? grammarRuleGuides[selected.id] : null;
  const workedExamples = useMemo(() => {
    if (!selected) return [];

    return data.cards
      .filter((card) =>
        String(card.rule_ids || card.topic_id || "")
          .split(/\s+/)
          .includes(selected.id)
      )
      .filter((card) => card.answer && card.explanation_en)
      .slice(0, 2);
  }, [data.cards, selected]);
  const teachingOrder = data.reference_content?.teaching_order || [];

  return (
    <section className="grammar-reference-view">
      <div className="grammar-reference-heading">
        <div>
          <h2>Grammar reference</h2>
          <p>{level} rules, forms, common errors, and memory aids</p>
        </div>
        <span>{topics.length} rules</span>
      </div>

      {selected ? (
        <div className="grammar-reference-layout">
          <nav className="grammar-reference-index" aria-label={`${level} grammar rules`}>
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={topic.id === selected.id ? "active" : ""}
                aria-current={topic.id === selected.id ? "true" : undefined}
                onClick={() => setSelectedId(topic.id)}
              >
                <span>{topic.name}</span>
                <small>{topic.summary}</small>
                <GrammarIcon name="chevron" size={15} />
              </button>
            ))}
          </nav>

          <article className="grammar-reference-detail">
            <header>
              <span>{selected.level}</span>
              <h3>{selected.name}</h3>
              <p>{selected.name_de}</p>
            </header>

            <section>
              <h4>Rule</h4>
              <p>{selected.rule?.rule_en}</p>
            </section>

            <section className="grammar-reference-form">
              <h4>Form</h4>
              <code>{selected.rule?.form}</code>
            </section>

            {guide && (
              <>
                <section className="grammar-reference-focus">
                  <h4>First, make this decision</h4>
                  <p>{guide.focus}</p>
                </section>

                <section>
                  <h4>Choose the right pattern</h4>
                  <div className="grammar-reference-decisions">
                    {guide.decisions.map(([meaning, question, choice]) => (
                      <div key={meaning}>
                        <strong>{meaning}</strong>
                        <span>{question}</span>
                        <code>{choice}</code>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4>Patterns and contrasts</h4>
                  <div className="grammar-reference-patterns">
                    {guide.patterns.map((pattern) => (
                      <div key={pattern.label}>
                        <h5>{pattern.label}</h5>
                        <p>{pattern.rule}</p>
                        <p><b>Correct:</b> <span lang="de">{pattern.good}</span></p>
                        <p className="grammar-reference-avoid"><b>Do not say:</b> <span lang="de">{pattern.avoid}</span></p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4>Quick self-check</h4>
                  <ul className="grammar-reference-checks">
                    {guide.checks.map((check) => <li key={check}>{check}</li>)}
                  </ul>
                </section>
              </>
            )}

            {!guide && teachingOrder.length > 0 && (
              <section>
                <h4>Apply this rule</h4>
                <ol>
                  {teachingOrder.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </section>
            )}

            {details.length > 0 && (
              <section>
                <h4>How it works</h4>
                <ol>
                  {details.map((detail) => <li key={detail}>{detail}</li>)}
                </ol>
              </section>
            )}

            {workedExamples.length > 0 && (
              <section>
                <h4>Worked examples</h4>
                <div className="grammar-reference-worked-examples">
                  {workedExamples.map((example) => (
                    <div key={example.id}>
                      <p className="grammar-reference-prompt" lang="de">{example.prompt}</p>
                      <p><b>Answer:</b> <span lang="de">{example.answer}</span></p>
                      <p>{example.explanation_en}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="grammar-reference-warning">
              <h4>Common error</h4>
              <p>{selected.rule?.common_error}</p>
            </section>

            <section className="grammar-reference-memory">
              <h4>Remember</h4>
              <p>{aidsById[selected.id]}</p>
            </section>

            <button type="button" className="grammar-reference-practice" onClick={() => onStart([selected.id])}>
              <GrammarIcon name="play" size={16} />
              Practice this rule
            </button>
          </article>
        </div>
      ) : (
        <p className="grammar-reference-empty">No rules match this search.</p>
      )}
    </section>
  );
}
