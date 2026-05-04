import { useMemo } from "react";

function humanize(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function PatternStats({ words, onApplyFilter }) {
  const endingStats = useMemo(() => {
    const stats = new Map();
    const nouns = words.filter((w) => w.noun && w.gender_patterns?.ending_pattern);

    for (const w of nouns) {
      const ending = w.gender_patterns.ending_pattern;
      const article = w.noun.article;
      if (!ending) continue;

      if (!stats.has(ending)) {
        stats.set(ending, { total: 0, articles: {} });
      }
      const s = stats.get(ending);
      s.total += 1;
      s.articles[article] = (s.articles[article] || 0) + 1;
    }

    // Filter to endings with >= 3 words and sort by reliability
    const entries = [...stats.entries()]
      .filter(([, s]) => s.total >= 3)
      .map(([ending, s]) => {
        const dominant = Object.entries(s.articles).sort(
          (a, b) => b[1] - a[1]
        )[0];
        const pct = Math.round((dominant[1] / s.total) * 100);
        return { ending, total: s.total, articles: s.articles, dominant: dominant[0], pct };
      })
      .sort((a, b) => b.total - a.total);

    return entries;
  }, [words]);

  const ruleStats = useMemo(() => {
    const stats = new Map();
    const nouns = words.filter((w) => w.noun);

    for (const w of nouns) {
      const rule = w.gender_patterns?.primary_rule || "unknown";
      if (!stats.has(rule)) stats.set(rule, 0);
      stats.set(rule, stats.get(rule) + 1);
    }

    return [...stats.entries()].sort((a, b) => b[1] - a[1]);
  }, [words]);

  if (endingStats.length === 0) {
    return <div className="empty-state"><p>No pattern data for current filters</p></div>;
  }

  return (
    <div className="pattern-stats">
      <h3>Gender Patterns</h3>
      <p className="pattern-subtitle">
        {words.filter((w) => w.noun).length} nouns analyzed
      </p>

      <div className="pattern-section">
        <h4>Suffix → Gender</h4>
        <div className="pattern-list">
          {endingStats.slice(0, 20).map(({ ending, total, dominant, pct, articles }) => (
            <button
              key={ending}
              className={`pattern-row ${pct >= 90 ? "reliable" : ""}`}
              onClick={() => onApplyFilter("ending_pattern", ending)}
              title={Object.entries(articles)
                .map(([a, c]) => `${a}: ${c}`)
                .join(", ")}
            >
              <span className="pattern-ending mono">{ending}</span>
              <div className="pattern-bar-wrap">
                <div
                  className={`pattern-bar article-${dominant}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`pattern-pct article-color article-${dominant}`}>
                {pct}% {dominant}
              </span>
              <span className="pattern-count">{total}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pattern-section">
        <h4>Rule Distribution</h4>
        <div className="pattern-list">
          {ruleStats.map(([rule, count]) => {
            const pct = Math.round((count / words.filter((w) => w.noun).length) * 100);
            return (
              <button
                key={rule}
                className="pattern-row"
                onClick={() => onApplyFilter("gender_rule", rule)}
              >
                <span className={`badge badge-${rule}`}>{humanize(rule)}</span>
                <div className="pattern-bar-wrap">
                  <div
                    className="pattern-bar"
                    style={{ width: `${pct}%`, background: "var(--accent)" }}
                  />
                </div>
                <span className="pattern-pct">{pct}%</span>
                <span className="pattern-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
