import { useMemo, useState } from "react";
import useGrammarData from "../hooks/useGrammarData";
import {
  buildGrammarSession,
  getGrammarMemory,
  recordGrammarResult,
} from "../grammarMemory";
import GrammarDashboard from "./GrammarDashboard";
import GrammarPractice from "./GrammarPractice";

export default function GrammarExperience({
  searchQuery,
  onSearchChange,
  initialSection = "today",
  initialLevel = "A2",
  selectedTopicId = null,
}) {
  const { data, loading, error } = useGrammarData();
  const [memory, setMemory] = useState(() => getGrammarMemory());
  const [session, setSession] = useState(null);
  const [level, setLevel] = useState(() => initialLevel);
  const [section, setSection] = useState(() => initialSection);

  const rulesById = useMemo(
    () =>
      data
        ? Object.fromEntries(data.rule_library.map((rule) => [rule.topic_id, rule]))
        : {},
    [data]
  );

  const aidsById = useMemo(
    () =>
      data
        ? Object.fromEntries(data.memory_aids.map((aid) => [aid.topic_id, aid]))
        : {},
    [data]
  );

  if (loading) {
    return <div className="grammar-data-state">Loading grammar practice...</div>;
  }

  if (error || !data) {
    return (
      <div className="grammar-data-state error">
        {error?.message || "Grammar data could not be loaded."}
      </div>
    );
  }

  const startSession = (topicIds) => {
    const cards = buildGrammarSession(data.cards, memory, topicIds, 10);
    if (cards.length) setSession(cards);
  };

  const handleResult = (card, correct) => {
    setMemory(recordGrammarResult(card, correct));
  };

  if (session) {
    return (
      <GrammarPractice
        cards={session}
        rulesById={rulesById}
        aidsById={aidsById}
        onResult={handleResult}
        onClose={() => setSession(null)}
      />
    );
  }

  return (
    <GrammarDashboard
      data={data}
      memory={memory}
      onStart={startSession}
      query={searchQuery}
      onQueryChange={onSearchChange}
      level={level}
      onLevelChange={setLevel}
      section={section}
      onSectionChange={setSection}
      selectedTopicId={selectedTopicId}
    />
  );
}
