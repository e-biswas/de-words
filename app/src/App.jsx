import { useState, useEffect, useMemo } from "react";
import { getTopics, getGenderRules, applyFilters } from "./data";
import { useFilters } from "./hooks/useFilters";
import { useWords } from "./hooks/useWords";
import FilterPanel from "./components/FilterPanel";
import WordGrid from "./components/WordGrid";
import GroupedView from "./components/GroupedView";
import FlashcardMode from "./components/FlashcardMode";
import PatternStats from "./components/PatternStats";
import WordDetail from "./components/WordDetail";
import Onboarding from "./components/Onboarding";
import "./App.css";

const TOP_LEVEL_GROUPS = [
  { value: "topic", label: "Topic" },
  { value: "gender_rule", label: "Gender Rule" },
  { value: "ending_pattern", label: "Ending" },
];

export default function App() {
  const {
    filters,
    toggleFilter,
    toggleLevel,
    clearAllFilters,
    applyPatternFilter,
  } = useFilters();

  const { allWords, loading, memoryVersion, refreshMemory } = useWords(filters);

  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ldw-dark") === "true";
  });
  const [groupBy, setGroupBy] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [groupBarOpen, setGroupBarOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    return localStorage.getItem("ldw-onboarded") !== "true";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
    localStorage.setItem("ldw-dark", darkMode);
  }, [darkMode]);

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

  const nounWords = useMemo(
    () => filteredWords.filter((w) => w.noun),
    [filteredWords]
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
            <path d="M8 11L11 3l3 7" />
            <path d="M24 11L21 3l-3 7" />
            <ellipse cx="16" cy="17" rx="9" ry="8" />
            <ellipse cx="12.5" cy="16" rx="2" ry="2.5" />
            <ellipse cx="19.5" cy="16" rx="2" ry="2.5" />
            <circle cx="12.5" cy="16" r="1" fill="currentColor" />
            <circle cx="19.5" cy="16" r="1" fill="currentColor" />
            <path d="M15 19l1 1.5l1-1.5" />
            <path d="M14 20.5q2 1.5 4 0" />
            <path d="M7 18l3.5 1M7 20l3.5 0.5" />
            <path d="M25 18l-3.5 1M25 20l-3.5 0.5" />
          </svg>
        </div>

        <div className="loading-ring">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="var(--border)" strokeWidth="2">
            <circle cx="28" cy="28" r="24" strokeDasharray="8 6" />
          </svg>
          <div className="loading-ring-inner" />
        </div>

        <div className="loading-text">
          <h2>Loading vocabulary</h2>
          <p>Preparing your words...</p>
        </div>

        <div className="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 120}ms` }} />
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
        <svg className="logo-cat" width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 11L11 3l3 7" />
          <path d="M24 11L21 3l-3 7" />
          <ellipse cx="16" cy="17" rx="9" ry="8" />
          <ellipse cx="12.5" cy="16" rx="2" ry="2.5" />
          <ellipse cx="19.5" cy="16" rx="2" ry="2.5" />
          <circle cx="12.5" cy="16" r="1" fill="currentColor" />
          <circle cx="19.5" cy="16" r="1" fill="currentColor" />
          <path d="M15 19l1 1.5l1-1.5" />
          <path d="M14 20.5q2 1.5 4 0" />
          <path d="M7 18l3.5 1M7 20l3.5 0.5" />
          <path d="M25 18l-3.5 1M25 20l-3.5 0.5" />
        </svg>
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
            className="icon-btn"
            onClick={() => setOnboardingOpen(true)}
            title="Help & guide"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M6 6.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5c0 1-1 1.3-1 2" />
              <circle cx="8" cy="11.5" r="0.7" fill="currentColor" stroke="none" />
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
          <button
            className="practice-btn"
            onClick={() => {
              setFlashcardOpen(true);
              setSidebarOpen(false);
            }}
            disabled={nounWords.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Practice
            <span className="practice-count">{nounWords.length}</span>
          </button>
          <FilterPanel
            memoryVersion={memoryVersion}
            filters={filters}
            toggleFilter={toggleFilter}
            toggleLevel={toggleLevel}
            clearAllFilters={clearAllFilters}
            availableTopics={availableTopics}
            availableRules={availableRules}
            allWords={allWords}
          />
        </aside>

        <main className="main">
          {showStats ? (
            <PatternStats
              words={filteredWords}
              onApplyFilter={(category, value) => {
                applyPatternFilter(category, value);
                setShowStats(false);
              }}
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

      {onboardingOpen && (
        <Onboarding
          onClose={() => {
            setOnboardingOpen(false);
            localStorage.setItem("ldw-onboarded", "true");
          }}
        />
      )}
    </div>
  );
}
