import { memo, useState, useMemo } from "react";
import humanize from "../utils/humanize";
import "./WordGrid.css";
import "./GroupedView.css";

const ARTICLE_ORDER = { der: 0, die: 1, das: 2 };

function getKey(word, level) {
  switch (level) {
    case "article":
      return word.noun?.article || null;
    case "gender_rule":
      return word.gender_patterns?.primary_rule || null;
    case "ending_pattern":
      return word.gender_patterns?.ending_pattern || null;
    case "topic":
      return word.semantic?.topics?.[0] || null;
    default:
      return null;
  }
}

function buildTree(words, levels) {
  // levels is e.g. ["topic","article"] or ["topic","gender_rule","article"]
  // Strip "article" from end if present, it's always the leaf
  const topLevels = levels.filter((l) => l !== "article");
  const hasArticle = levels.includes("article");

  if (topLevels.length === 0 && hasArticle) {
    return buildArticleGroups(words);
  }
  if (topLevels.length === 0) {
    return { type: "flat", words };
  }

  return buildNestedGroups(words, topLevels, 0, hasArticle);
}

function buildNestedGroups(words, levels, depth, hasArticle) {
  if (depth >= levels.length) {
    if (hasArticle) return buildArticleGroups(words);
    return { type: "flat", words };
  }

  const level = levels[depth];
  const groups = new Map();

  for (const w of words) {
    let key = getKey(w, level);
    const keys =
      level === "topic"
        ? w.semantic?.topics?.length
          ? w.semantic.topics
          : [null]
        : [key];

    for (const k of keys) {
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(w);
    }
  }

  let entries = [...groups.entries()];
  entries.sort((a, b) => {
    if (a[0] === null) return 1;
    if (b[0] === null) return -1;
    return b[1].length - a[1].length;
  });

  return {
    type: "group",
    level,
    children: entries.map(([key, groupWords]) => ({
      key: key || "other",
      label: key ? humanize(key) : `No ${humanize(level)}`,
      count: groupWords.length,
      isOther: !key,
      child: depth + 1 < levels.length || hasArticle
        ? buildNestedGroups(groupWords, levels, depth + 1, hasArticle)
        : null,
      words: (depth + 1 >= levels.length && !hasArticle) ? groupWords : null,
    })),
    total: words.length,
  };
}

function buildArticleGroups(words) {
  const groups = new Map();
  const noArticle = [];

  for (const w of words) {
    const art = w.noun?.article;
    if (art && Object.prototype.hasOwnProperty.call(ARTICLE_ORDER, art)) {
      if (!groups.has(art)) groups.set(art, []);
      groups.get(art).push(w);
    } else {
      noArticle.push(w);
    }
  }

  let entries = [...groups.entries()];
  entries.sort(
    (a, b) => (ARTICLE_ORDER[a[0]] ?? 99) - (ARTICLE_ORDER[b[0]] ?? 99)
  );

  const children = entries.map(([art, artWords]) => ({
    key: art,
    label: art,
    count: artWords.length,
    words: artWords,
  }));

  if (noArticle.length > 0) {
    children.push({
      key: "noarticle",
      label: "No Article",
      count: noArticle.length,
      words: noArticle,
    });
  }

  return { type: "articleList", children };
}

const LEVEL_DOTS = ["", "·", "··", "···", "✦", "★"];

function WordCards({ words, onSelect, selectedId }) {
  const animateCards = words.length <= 40;

  return (
    <div className="group-words">
      {words.map((w, i) => {
        const article = w.noun?.article;
        const sel = w.id === selectedId;
        const shouldAnimate = animateCards && i < 12;
        return (
          <button
            key={w.id}
            className={`word-card ${sel ? "selected" : ""} ${shouldAnimate ? "card-animate" : ""}`}
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

function ArticleGroup({ child, onSelect, selectedId }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`nest-section ${collapsed ? "collapsed" : ""}`}>
      <button
        className={`nest-header article-${child.key}`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="nest-arrow">{collapsed ? "▸" : "▾"}</span>
        <span className="nest-label">{child.label}</span>
        <span className="nest-count">{child.count}</span>
      </button>
      {!collapsed && (
        <WordCards
          words={child.words}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      )}
    </div>
  );
}

function ArticleList({ node, depth, onSelect, selectedId }) {
  return (
    <div className={`nest-group depth-${depth}`}>
      {node.children.map((child) => (
        <ArticleGroup
          key={child.key}
          child={child}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

function NestedSection({ child, depth, onSelect, selectedId }) {
  const [collapsed, setCollapsed] = useState(false);
  const isArticleLevel = child.child?.type === "articleList";

  return (
    <div
      className={`nest-section ${collapsed ? "collapsed" : ""} ${
        child.isOther ? "is-other" : ""
      } depth-${depth}`}
    >
      <button
        className={`nest-header ${isArticleLevel ? "" : "top-header"} ${
          depth > 1 ? `article-${child.key}` : ""
        }`}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="nest-arrow">{collapsed ? "▸" : "▾"}</span>
        <span className="nest-label">{child.label}</span>
        <span className="nest-count">{child.count}</span>
      </button>
      {!collapsed && child.child && child.child.type === "articleList" && (
        <div className="nest-children">
          <ArticleList
            node={child.child}
            depth={depth + 1}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        </div>
      )}
      {!collapsed && child.child && child.child.type === "group" && (
        <div className="nest-children">
          {child.child.children.map((subChild) => (
            <NestedSection
              key={subChild.key}
              child={subChild}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
      {!collapsed && child.words && (
        <WordCards words={child.words} onSelect={onSelect} selectedId={selectedId} />
      )}
    </div>
  );
}

function GroupedView({ words, groupBy, onSelect, selectedId }) {
  const tree = useMemo(
    () => buildTree(words, groupBy),
    [words, groupBy]
  );

  if (words.length === 0) {
    return <div className="empty-state">No words match your filters.</div>;
  }

  if (tree.type === "flat") {
    return (
      <WordCards words={tree.words} onSelect={onSelect} selectedId={selectedId} />
    );
  }

  if (tree.type === "articleList") {
    return (
      <div className="grouped-view">
        <div className="grouped-summary">
          {tree.children.length} group{tree.children.length !== 1 ? "s" : ""} ·{" "}
          {words.length} word{words.length !== 1 ? "s" : ""}
        </div>
        <ArticleList
          node={tree}
          depth={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      </div>
    );
  }

  const topCount = tree.children?.length || 0;

  return (
    <div className="grouped-view">
      <div className="grouped-summary">
        {topCount} group{topCount !== 1 ? "s" : ""} ·{" "}
        {words.length} word{words.length !== 1 ? "s" : ""}
      </div>
      {tree.children.map((child) => (
        <NestedSection
          key={child.key}
          child={child}
          depth={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

export default memo(GroupedView);
