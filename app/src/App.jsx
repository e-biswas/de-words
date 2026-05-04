import { useState, useEffect, useMemo, useCallback } from "react";
import { loadAllWords, getTopics, getGenderRules, applyFilters } from "./data";
import { getAllStatuses } from "./memory";
import FilterPanel from "./components/FilterPanel";
import WordGrid from "./components/WordGrid";
import GroupedView from "./components/GroupedView";
import FlashcardMode from "./components/FlashcardMode";
import PatternStats from "./components/PatternStats";
import "./App.css";

function humanize(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const TOP_LEVEL_GROUPS = [
  { value: "topic", label: "Topic" },
  { value: "gender_rule", label: "Gender Rule" },
  { value: "ending_pattern", label: "Ending" },
];

export default function App() {
  const [allWords, setAllWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    levels: ["A1"],
    articles: [],
    topics: [],
    genderRules: [],
    pos: ["noun"],
    frequencies: [],
    registers: [],
    entityTypes: [],
    learningStatus: [],
  });
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ldw-dark") === "true";
  });
  const [groupBy, setGroupBy] = useState([]);
  const [memoryVersion, setMemoryVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [groupBarOpen, setGroupBarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("ldw-dark", darkMode);
  }, [darkMode]);

  const refreshMemory = useCallback(() => {
    const statuses = getAllStatuses();
    setAllWords((words) =>
      words.map((w) => {
        const s = statuses[w.id];
        return {
          ...w,
          _status: s?.status || "new",
          _srsLevel: s?.level || 0,
          _srsLabel: s?.label || "New",
        };
      })
    );
    setMemoryVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    loadAllWords().then((words) => {
      const statuses = getAllStatuses();
      setAllWords(
        words.map((w) => {
          const s = statuses[w.id];
          return {
            ...w,
            _status: s?.status || "new",
            _srsLevel: s?.level || 0,
            _srsLabel: s?.label || "New",
          };
        })
      );
      setLoading(false);
    });
  }, []);

  const filteredWords = useMemo(() => {
    let words = applyFilters(allWords, filters);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      words = words.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          (w.meaning?.en || w.meaning_en || "").toLowerCase().includes(q) ||
          (w.noun?.singular || "").toLowerCase().includes(q)
      );
    }
    return words;
  }, [allWords, filters, searchQuery]);

  const availableTopics = useMemo(() => getTopics(allWords), [allWords]);
  const availableRules = useMemo(() => getGenderRules(allWords), [allWords]);

  const toggleFilter = useCallback((category, value) => {
    setFilters((prev) => {
      const current = prev[category];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  }, []);

  const setLevelExclusive = useCallback((level) => {
    setFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [level],
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      levels: [],
      articles: [],
      topics: [],
      genderRules: [],
      pos: [],
      frequencies: [],
      registers: [],
      entityTypes: [],
      learningStatus: [],
    });
  }, []);

  const applyPatternFilter = useCallback((category, value) => {
    setFilters((prev) => {
      if (prev[category]?.includes(value)) return prev;
      // Clear existing in that category and set the new value
      return { ...prev, [category]: [value] };
    });
    setShowStats(false);
  }, []);

  const nounWords = useMemo(
    () => filteredWords.filter((w) => w.noun),
    [filteredWords]
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading vocabulary...</p>
        <div className="skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle filters"
        >
          ☰
        </button>
        <img src="/cat.svg" alt="" className="logo-cat" width="28" height="28" />
        <h1>LDW</h1>

        <div className="search-wrap">
          <input
            type="text"
            className="global-search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <span className="word-count desk-only">
          {filteredWords.length} word{filteredWords.length !== 1 ? "s" : ""}
        </span>

        <div className="header-actions">
          <button
            className={`icon-btn ${showStats ? "active" : ""}`}
            onClick={() => setShowStats((s) => !s)}
            title="Pattern statistics"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="9" width="3" height="6" rx="0.5" />
              <rect x="6.5" y="4" width="3" height="11" rx="0.5" />
              <rect x="12" y="1" width="3" height="14" rx="0.5" />
            </svg>
          </button>

          <div className="group-control desk-only">
            <button
              className={`icon-btn ${groupBy.length > 0 ? "active" : ""}`}
              onClick={() => setGroupBy(groupBy.length > 0 ? [] : ["article"])}
              title="Group words"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="1" width="14" height="3" rx="0.5" />
                <rect x="1" y="6.5" width="14" height="3" rx="0.5" />
                <rect x="1" y="12" width="14" height="3" rx="0.5" />
              </svg>
            </button>
            {groupBy.length > 0 && (
              <>
                {TOP_LEVEL_GROUPS.map((opt) => {
                  const isActive = groupBy.includes(opt.value);
                  const topLevels = groupBy.filter((g) => g !== "article");
                  const activeIndex = topLevels.indexOf(opt.value);
                  const showNum = topLevels.length > 1 && isActive;
                  return (
                    <button
                      key={opt.value}
                      className={`group-pill ${isActive ? "active" : ""}`}
                      onClick={() => {
                        if (isActive) setGroupBy(groupBy.filter((g) => g !== opt.value));
                        else setGroupBy([...topLevels, opt.value, "article"]);
                      }}
                    >
                      {showNum && <span className="pill-num">{activeIndex + 1}</span>}
                      {opt.label}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Group toggle for mobile */}
          <button
            className="icon-btn mobile-only group-mob-btn"
            onClick={() => {
              setGroupBarOpen((o) => !o);
              if (groupBy.length === 0) setGroupBy(["article"]);
            }}
            title="Group words"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="1" width="14" height="3" rx="0.5" />
              <rect x="1" y="6.5" width="14" height="3" rx="0.5" />
              <rect x="1" y="12" width="14" height="3" rx="0.5" />
            </svg>
          </button>

          <button
            className="toggle-btn dark-toggle"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <div className={`mobile-group-bar ${groupBarOpen ? "open" : ""}`}>
        {TOP_LEVEL_GROUPS.map((opt) => {
          const isActive = groupBy.includes(opt.value);
          const topLevels = groupBy.filter((g) => g !== "article");
          const activeIndex = topLevels.indexOf(opt.value);
          const showNum = topLevels.length > 1 && isActive;
          return (
            <button
              key={opt.value}
              className={`group-pill ${isActive ? "active" : ""}`}
              onClick={() => {
                if (isActive) setGroupBy(groupBy.filter((g) => g !== opt.value));
                else setGroupBy([...topLevels, opt.value, "article"]);
              }}
            >
              {showNum && <span className="pill-num">{activeIndex + 1}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <FilterPanel
            memoryVersion={memoryVersion}
            filters={filters}
            toggleFilter={toggleFilter}
            setLevelExclusive={setLevelExclusive}
            clearAllFilters={clearAllFilters}
            availableTopics={availableTopics}
            availableRules={availableRules}
            allWords={allWords}
          />
          <button
            className="practice-btn"
            onClick={() => {
              setFlashcardOpen(true);
              setSidebarOpen(false);
            }}
            disabled={nounWords.length === 0}
          >
            Practice
            <span className="practice-count">{nounWords.length}</span>
          </button>
        </aside>

        <main className="main">
          {showStats ? (
            <PatternStats
              words={filteredWords}
              onApplyFilter={applyPatternFilter}
            />
          ) : groupBy.length > 0 ? (
            <GroupedView
              words={filteredWords}
              groupBy={groupBy}
              onSelect={setSelectedWord}
              selectedId={selectedWord?.id}
            />
          ) : (
            <WordGrid
              words={filteredWords}
              onSelect={setSelectedWord}
              selectedId={selectedWord?.id}
            />
          )}
        </main>

        {selectedWord && (
          <aside className="detail-panel">
            <WordDetail
              word={selectedWord}
              onClose={() => setSelectedWord(null)}
            />
          </aside>
        )}
      </div>

      <footer className="app-footer">
        <span>
          Built with ❤️ by{" "}
          <a href="https://github.com/e-biswas" target="_blank" rel="noopener">
            e-biswas
          </a>
        </span>
      </footer>

      {flashcardOpen && (
        <FlashcardMode
          words={nounWords}
          onClose={() => {
            setFlashcardOpen(false);
            refreshMemory();
          }}
        />
      )}
    </div>
  );
}

function WordDetail({ word, onClose }) {
  const gp = word.gender_patterns;
  const vp = word.verb_patterns;
  const ap = word.adjective_patterns;
  const n = word.noun;

  return (
    <div className="word-detail">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>

      <h2 className={`article-color article-${n?.article || "none"}`}>
        {word.display || word.word}
      </h2>
      <p className="detail-meaning">{word.meaning?.en || word.meaning_en}</p>

      <div className="detail-row">
        <span className="detail-label">Level</span>
        <span className="detail-val">
          {word._level} — L{word.lesson} P{word.page}
        </span>
      </div>

      <div className="detail-row">
        <span className="detail-label">POS</span>
        <span className="detail-val">{word.part_of_speech}</span>
      </div>

      {word.semantic?.topics?.length > 0 && (
        <div className="detail-row">
          <span className="detail-label">Topics</span>
          <span className="detail-val">
            {word.semantic.topics.map((t) => (
              <span key={t} className="topic-tag">{humanize(t)}</span>
            ))}
          </span>
        </div>
      )}

      {gp && (
        <>
          <hr />
          <div className="detail-row">
            <span className="detail-label">Gender Rule</span>
            <span className="detail-val">
              <span className="badge badge-rule">{humanize(gp.primary_rule)}</span>{" "}
              {gp.rule_detail}
            </span>
          </div>

          {gp.ending_pattern && (
            <div className="detail-row">
              <span className="detail-label">Ending</span>
              <span className="detail-val mono">{gp.ending_pattern}</span>
            </div>
          )}

          {gp.semantic_group && (
            <div className="detail-row">
              <span className="detail-label">Group</span>
              <span className="detail-val">{humanize(gp.semantic_group)}</span>
            </div>
          )}

          {gp.compound_root && (
            <div className="detail-row">
              <span className="detail-label">Compound</span>
              <span className="detail-val">
                {Array.isArray(gp.compound_parts)
                  ? gp.compound_parts.join(" + ")
                  : gp.compound_root}{" "}
                → <strong>{gp.compound_root}</strong>
              </span>
            </div>
          )}

          {gp.plural_formation && (
            <div className="detail-row">
              <span className="detail-label">Plural</span>
              <span className="detail-val">
                {n?.plural || "—"} ({gp.plural_formation})
              </span>
            </div>
          )}

          {gp.is_exception && (
            <div className="detail-row exception">
              <span className="detail-label">⚠ Exception</span>
              <span className="detail-val">Breaks: {gp.exception_to}</span>
            </div>
          )}

          <div className="detail-hint">
            {gp.learner_hint}
          </div>
        </>
      )}

      {vp && (
        <>
          <hr />
          <div className="detail-row">
            <span className="detail-label">Type</span>
            <span className="detail-val">
              {vp.prefix_type} {vp.prefix ? `(${vp.prefix})` : ""} |{" "}
              {vp.verb_category} | {vp.regularity}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Perfekt</span>
            <span className="detail-val mono">
              {vp.auxiliary} + {vp.past_participle}
            </span>
          </div>
          {vp.past_tense_3sg && (
            <div className="detail-row">
              <span className="detail-label">Prät. (3sg)</span>
              <span className="detail-val mono">{vp.past_tense_3sg}</span>
            </div>
          )}
          {(vp.complement_preposition || vp.complement_case) && (
            <div className="detail-row">
              <span className="detail-label">Complement</span>
              <span className="detail-val mono">
                {vp.complement_preposition || ""}
                {vp.complement_case ? ` (${vp.complement_case})` : ""}
              </span>
            </div>
          )}
          {vp.is_reflexive && (
            <div className="detail-row">
              <span className="detail-label">Reflexive</span>
              <span className="detail-val">
                Yes ({vp.reflexive_pronoun_case || "acc"})
              </span>
            </div>
          )}
        </>
      )}

      {ap && (
        <>
          <hr />
          <div className="detail-row">
            <span className="detail-label">Comparative</span>
            <span className="detail-val mono">
              {ap.comparative || "—"} | {ap.superlative || "—"}
              {ap.is_irregular_comparison && " ⚡irregular"}
            </span>
          </div>
          {ap.common_opposite && (
            <div className="detail-row">
              <span className="detail-label">Opposite</span>
              <span className="detail-val">{ap.common_opposite}</span>
            </div>
          )}
        </>
      )}

      <hr />
      <div className="detail-row">
        <span className="detail-label">Register</span>
        <span className="detail-val">{word.usage?.register || "—"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Frequency</span>
        <span className="detail-val">{word.usage?.frequency || "—"}</span>
      </div>
    </div>
  );
}
