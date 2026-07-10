import { useEffect, useMemo, useRef } from "react";
import GrammarIcon from "./GrammarIcons";
import GrammarReference from "./GrammarReference";
import { topicProgress } from "../grammarMemory";
import { formatGrammarTopicId } from "../grammarTopics";
import "./GrammarDashboard.css";

const TOPIC_SUMMARIES = {
  "word-order-main": "Position 2 and sentence brackets",
  "word-order-subordinate": "weil, dass, obwohl, wenn",
  cases: "Nominative, accusative, dative, genitive",
  "adjective-endings": "Definite, indefinite, and no article",
  passive: "werden + Partizip II",
  "past-tenses": "Perfekt, Prateritum, Plusquamperfekt",
  "a2-adjective-declension": "Article type, case, and endings",
  "a2-subordinate-clauses": "weil and dass clauses",
  "a2-relative-clauses": "Pronoun case and verb position",
};

function readableName(topic) {
  return formatGrammarTopicId(topic.id);
}

function topicLevel(topic, rule) {
  return topic.level || rule?.level || "B1";
}

function summaryFor(topic, rule) {
  return TOPIC_SUMMARIES[topic.id] || rule?.form || topic.name_de;
}

export default function GrammarDashboard({
  data,
  memory,
  onStart,
  query,
  onQueryChange,
  level,
  onLevelChange,
  section,
  onSectionChange,
  selectedTopicId,
}) {
  const mainRef = useRef(null);
  const rulesById = useMemo(
    () => Object.fromEntries(data.rule_library.map((rule) => [rule.topic_id, rule])),
    [data.rule_library]
  );
  const aidsById = useMemo(
    () => Object.fromEntries(data.memory_aids.map((aid) => [aid.topic_id, aid.tip_en])),
    [data.memory_aids]
  );

  const topics = useMemo(() => {
    const filtered = data.topic_catalog
      .map((topic) => {
        const rule = rulesById[topic.id];
        return {
          ...topic,
          rule,
          level: topicLevel(topic, rule),
          name: readableName(topic),
          summary: summaryFor(topic, rule),
          memoryAid: aidsById[topic.id],
          progress: topicProgress(data.cards, memory, topic.id),
        };
      })
      .filter((topic) => topic.level === level)
      .filter((topic) => {
        const needle = query.trim().toLowerCase();
        return !needle ||
          topic.name.toLowerCase().includes(needle) ||
          (topic.name_de || "").toLowerCase().includes(needle);
      });

    if (section === "review") {
      return filtered.sort(
        (a, b) => a.progress.mastery - b.progress.mastery || b.progress.due - a.progress.due
      );
    }
    return filtered;
  }, [aidsById, data.cards, data.topic_catalog, level, memory, query, rulesById, section]);

  const levelTopicIds = topics.map((topic) => topic.id);
  const due = topics.reduce((sum, topic) => sum + topic.progress.due, 0);
  const attempted = topics.filter((topic) => topic.progress.attempts > 0);
  const mastery = attempted.length
    ? Math.round(
        attempted.reduce((sum, topic) => sum + topic.progress.mastery, 0) /
          attempted.length
      )
    : 0;
  const continueTopics = [...topics]
    .sort((a, b) => b.progress.due - a.progress.due)
    .slice(0, 3);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [level, section]);

  return (
    <div className="grammar-dashboard">
      <aside className="grammar-sidebar">
        <button
          className="grammar-start"
          type="button"
          onClick={() => onStart(levelTopicIds)}
          disabled={!levelTopicIds.length}
        >
          <GrammarIcon name="play" size={17} />
          <span>Start practice</span>
        </button>

        <div className="grammar-levels" aria-label="Grammar level">
          <span>Level</span>
          <div>
            {["A1", "A2", "B1"].map((value) => (
              <button
                key={value}
                type="button"
                className={level === value ? "active" : ""}
                onClick={() => onLevelChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <nav className="grammar-side-nav" aria-label="Grammar sections">
          <button
            type="button"
            className={section === "today" ? "active" : ""}
            onClick={() => onSectionChange("today")}
          >
            <GrammarIcon name="today" />
            Today
            <span>{Math.min(due, 99)}</span>
          </button>
          <button
            type="button"
            className={section === "topics" ? "active" : ""}
            onClick={() => onSectionChange("topics")}
          >
            <GrammarIcon name="topics" />
            Topics
          </button>
          <button
            type="button"
            className={section === "review" ? "active" : ""}
            onClick={() => onSectionChange("review")}
          >
            <GrammarIcon name="review" />
            Needs review
          </button>
        </nav>

        <button
          type="button"
          className={`grammar-reference ${section === "reference" ? "active" : ""}`}
          onClick={() => onSectionChange("reference")}
        >
          <GrammarIcon name="book" />
          Grammar reference
          <GrammarIcon name="chevron" size={15} />
        </button>
      </aside>

      <main className="grammar-main" ref={mainRef}>
        <div className="grammar-mobile-tools">
          <div className="grammar-mobile-levels">
            {["A1", "A2", "B1"].map((value) => (
              <button
                key={value}
                type="button"
                className={level === value ? "active" : ""}
                onClick={() => onLevelChange(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => onStart(levelTopicIds)}>
            <GrammarIcon name="play" size={16} /> Practice
          </button>
        </div>

        {section === "reference" ? (
          <GrammarReference
            topics={topics}
            data={data}
            level={level}
            onStart={onStart}
            selectedTopicId={selectedTopicId}
          />
        ) : (
          <>
        <div className="grammar-title-row">
          <div>
            <h2>Grammar practice</h2>
            <p>{level} grammar and cumulative review</p>
          </div>
          {query && (
            <button type="button" className="grammar-clear-search" onClick={() => onQueryChange("")}>
              Clear search
            </button>
          )}
        </div>

        <section className="grammar-metrics" aria-label="Grammar progress">
          <div>
            <GrammarIcon name="today" />
            <strong>{due}</strong>
            <span>due today</span>
          </div>
          <div>
            <GrammarIcon name="book" />
            <strong>{data.rule_library.length}</strong>
            <span>rules</span>
          </div>
          <div>
            <span className="grammar-mastery-ring" style={{ "--mastery": mastery }} />
            <strong>{mastery}%</strong>
            <span>mastery</span>
          </div>
        </section>

        {continueTopics.length > 0 && (
          <section className="grammar-continue">
            <h3>Continue learning</h3>
            <div>
              {continueTopics.map((topic, index) => (
                <button type="button" key={topic.id} onClick={() => onStart([topic.id])}>
                  <span className={`grammar-topic-symbol symbol-${index}`}>
                    <GrammarIcon name={index === 0 ? "review" : index === 1 ? "list" : "today"} />
                  </span>
                  <span>
                    <strong>{index === 0 ? "Review: " : ""}{topic.name}</strong>
                    <small>{topic.level} - {topic.progress.due} items due</small>
                  </span>
                  <GrammarIcon name="chevron" size={16} />
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="grammar-topic-list">
          <div className="grammar-list-heading">
            <h3>{section === "review" ? "Topics to review" : "All grammar topics"}</h3>
            <span>{topics.length} topics</span>
          </div>
          <div className="grammar-topic-table">
            <div className="grammar-table-head">
              <span>Topic</span>
              <span>Level</span>
              <span>Mastery</span>
              <span>Due</span>
              <span>Practice</span>
            </div>
            {topics.map((topic, index) => (
              <div className="grammar-topic-row" key={topic.id}>
                <span className={`grammar-topic-symbol symbol-${index % 4}`}>
                  <GrammarIcon name={index % 3 === 0 ? "list" : index % 3 === 1 ? "book" : "review"} />
                </span>
                <div className="grammar-topic-copy">
                  <strong>{topic.name}</strong>
                  <small>{topic.summary}</small>
                  {topic.memoryAid && (
                    <em>
                      <span>Remember:</span> {topic.memoryAid}
                    </em>
                  )}
                </div>
                <span className="grammar-level-tag">{topic.level}</span>
                <div className="grammar-row-mastery">
                  <span>{topic.progress.mastery}%</span>
                  <i>
                    <b style={{ width: `${topic.progress.mastery}%` }} />
                  </i>
                </div>
                <span className="grammar-due">{topic.progress.due}</span>
                <button type="button" className="grammar-row-practice" onClick={() => onStart([topic.id])}>
                  Practice
                </button>
              </div>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

      <nav className="grammar-bottom-nav" aria-label="Grammar mobile navigation">
        <button type="button" className={section === "today" ? "active" : ""} onClick={() => onSectionChange("today")}>
          <GrammarIcon name="today" /> Today
        </button>
        <button type="button" className={section === "topics" ? "active" : ""} onClick={() => onSectionChange("topics")}>
          <GrammarIcon name="book" /> Topics
        </button>
        <button type="button" className={section === "review" ? "active" : ""} onClick={() => onSectionChange("review")}>
          <GrammarIcon name="chart" /> Review
        </button>
        <button type="button" className={section === "reference" ? "active" : ""} onClick={() => onSectionChange("reference")}>
          <GrammarIcon name="book" /> Reference
        </button>
      </nav>
    </div>
  );
}
