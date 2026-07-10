import { useState, useEffect, useMemo } from "react";
import { getTopics, getGenderRules, applyFilters } from "./data";
import { useFilters } from "./hooks/useFilters";
import { useWords } from "./hooks/useWords";
import humanize from "./utils/humanize";
import FilterPanel from "./components/FilterPanel";
import WordGrid from "./components/WordGrid";
import GroupedView from "./components/GroupedView";
import FlashcardMode from "./components/FlashcardMode";
import PatternStats from "./components/PatternStats";
import WordDetail from "./components/WordDetail";
import Onboarding from "./components/Onboarding";
import CatLogo from "./components/CatLogo";
import GrammarExperience from "./components/GrammarExperience";
import PracticeHub from "./components/PracticeHub";
import MixedPractice from "./components/MixedPractice";
import useGrammarData from "./hooks/useGrammarData";
import "./App.css";

const TOP_LEVEL_GROUPS = [
  { value: "topic", label: "Topic" },
  { value: "gender_rule", label: "Gender Rule" },
  { value: "ending_pattern", label: "Ending" },
];

function textIncludes(value, query) {
  return typeof value === "string" && value.toLowerCase().includes(query);
}

function listIncludes(values, query) {
  return Array.isArray(values) && values.some((value) => textIncludes(value, query));
}

function matchesSearch(word, query) {
  const searchIndex = word.search_index;
  if (
    searchIndex &&
    (listIncludes(searchIndex.de, query) ||
      listIncludes(searchIndex.en, query) ||
      listIncludes(searchIndex.bn, query) ||
      listIncludes(searchIndex.tags, query))
  ) {
    return true;
  }

  return [
    word.word,
    word.display,
    word.normalized,
    word.meaning?.en,
    word.meaning?.simple_en,
    word.meaning_en,
    word.noun?.singular,
    word.noun?.plural,
    word.part_of_speech,
    word._level,
  ].some((value) => textIncludes(value, query));
}

export default function App() {
  const {
    filters,
    toggleFilter,
    toggleLevel,
    clearAllFilters,
    applyPatternFilter,
  } = useFilters();

  const { allWords, loading, loadingAll, refreshMemory } = useWords(filters);
  const { data: grammarData, loading: grammarLoading } = useGrammarData();

  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [mixedPracticeOpen, setMixedPracticeOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("vocabulary");
  const [grammarSection, setGrammarSection] = useState("today");
  const [grammarTarget, setGrammarTarget] = useState({ topicId: null, level: "A2" });
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
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return allWords.filter((word) => matchesSearch(word, query));
    }

    return applyFilters(allWords, filters);
  }, [allWords, filters, searchQuery]);

  const availableTopics = useMemo(() => getTopics(allWords), [allWords]);
  const availableRules = useMemo(() => getGenderRules(allWords), [allWords]);

  const patternChips = useMemo(() => {
    const chips = [];
    if (filters.ending_pattern?.length > 0) {
      filters.ending_pattern.forEach((v) => chips.push({ category: "ending_pattern", label: `Ending: ${v}`, value: v }));
    }
    if (filters.gender_rule?.length > 0) {
      filters.gender_rule.forEach((v) => chips.push({ category: "gender_rule", label: `Rule: ${humanize(v)}`, value: v }));
    }
    return chips;
  }, [filters.ending_pattern, filters.gender_rule]);

  const nounWords = useMemo(
    () => filteredWords.filter((w) => w.noun),
    [filteredWords]
  );

  const openGrammarReference = (topicId = null) => {
    const topic = grammarData?.topic_catalog?.find((item) => item.id === topicId);
    const rule = grammarData?.rule_library?.find((item) => item.topic_id === topicId);
    setGrammarTarget({
      topicId,
      level: topic?.level || rule?.level || "B1",
    });
    setGrammarSection("reference");
    setSearchQuery("");
    setMixedPracticeOpen(false);
    setActiveSection("grammar");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <CatLogo size={40} opacity="0.5" />
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
        {activeSection === "vocabulary" && <button
          className="hamburger"
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle filters"
        >
          Menu
        </button>}
        <CatLogo className="logo-cat" size={28} />
        <h1>LDW</h1>

        <nav className="primary-nav" aria-label="Primary navigation">
          <button
            className={activeSection === "vocabulary" ? "active" : ""}
            type="button"
            onClick={() => {
              setActiveSection("vocabulary");
              setSearchQuery("");
            }}
          >
            Vocabulary
          </button>
          <button
            className={activeSection === "grammar" ? "active" : ""}
            type="button"
            onClick={() => {
              setActiveSection("grammar");
              setGrammarTarget({ topicId: null, level: "A2" });
              setSearchQuery("");
            }}
          >
            Grammar
          </button>
          <button
            className={activeSection === "practice" ? "active" : ""}
            type="button"
            onClick={() => {
              setActiveSection("practice");
              setSearchQuery("");
            }}
          >
            Practice
          </button>
        </nav>

        {activeSection !== "practice" && <div className="search-wrap">
          <input
            type="text"
            className="global-search"
            placeholder={activeSection === "grammar" ? "Search grammar" : "Search vocabulary"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear"
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              x
            </button>
          )}
          {activeSection === "vocabulary" && loadingAll && (
            <span
              className={`search-loading-dot ${searchQuery ? "with-clear" : ""}`}
              aria-label="Loading vocabulary"
              title="Loading vocabulary"
            />
          )}
        </div>}

        {activeSection === "vocabulary" && (
          <span className="word-count desk-only">
            {filteredWords.length} word{filteredWords.length !== 1 ? "s" : ""}
          </span>
        )}

        <div className="header-actions">
          {activeSection === "vocabulary" && (
            <button
              className={`icon-btn ${showStats ? "active" : ""}`}
              type="button"
              onClick={() => setShowStats((s) => !s)}
              aria-label="Toggle pattern statistics"
              title="Pattern statistics"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="9" width="3" height="6" rx="0.5" />
                <rect x="6.5" y="4" width="3" height="11" rx="0.5" />
                <rect x="12" y="1" width="3" height="14" rx="0.5" />
              </svg>
            </button>
          )}

          {activeSection === "vocabulary" && <div className="group-control desk-only">
            <button
              className={`icon-btn ${groupBy.length > 0 ? "active" : ""}`}
              type="button"
              onClick={() => setGroupBy(groupBy.length > 0 ? [] : ["article"])}
              aria-label="Toggle word grouping"
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
          </div>}

          {/* Group toggle for mobile */}
          {activeSection === "vocabulary" && <button
            className="icon-btn mobile-only group-mob-btn"
            type="button"
            onClick={() => {
              setGroupBarOpen((o) => !o);
              if (groupBy.length === 0) setGroupBy(["article"]);
            }}
            aria-label="Toggle word grouping"
            title="Group words"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="1" width="14" height="3" rx="0.5" />
              <rect x="1" y="6.5" width="14" height="3" rx="0.5" />
              <rect x="1" y="12" width="14" height="3" rx="0.5" />
            </svg>
          </button>}

          <button
            className="icon-btn"
            type="button"
            onClick={() => setOnboardingOpen(true)}
            aria-label="Open help guide"
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
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle color theme"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      {activeSection === "vocabulary" && <div className={`mobile-group-bar ${groupBarOpen ? "open" : ""}`}>
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
      </div>}

      {activeSection === "practice" ? (
        <PracticeHub
          wordCount={filteredWords.length}
          nounCount={nounWords.length}
          grammarRuleCount={grammarData?.rule_library?.length || 0}
          grammarLoading={grammarLoading}
          onStartMixed={() => setMixedPracticeOpen(true)}
          onStartArticles={() => setFlashcardOpen(true)}
          onOpenVocabulary={() => {
            setActiveSection("vocabulary");
            setShowStats(false);
          }}
          onOpenPatterns={() => {
            setActiveSection("vocabulary");
            setShowStats(true);
            setGroupBy([]);
          }}
          onOpenGrammar={() => {
            setGrammarTarget({ topicId: null, level: "A2" });
            setGrammarSection("topics");
            setActiveSection("grammar");
          }}
          onOpenGrammarReference={() => {
            openGrammarReference();
          }}
        />
      ) : activeSection === "grammar" ? (
        <GrammarExperience
          key={`grammar-${grammarSection}-${grammarTarget.level}-${grammarTarget.topicId || "all"}`}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          initialSection={grammarSection}
          initialLevel={grammarTarget.level}
          selectedTopicId={grammarTarget.topicId}
        />
      ) : <div className="layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <button
            className="practice-btn"
            type="button"
            onClick={() => {
              setFlashcardOpen(true);
              setSidebarOpen(false);
            }}
            aria-label={`Start article practice with ${nounWords.length} words`}
            disabled={nounWords.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Practice
            <span className="practice-count">{nounWords.length}</span>
          </button>
          <FilterPanel
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
          {patternChips.length > 0 && (
            <div className="mobile-pattern-bar mobile-only">
              {patternChips.map((chip) => (
                <span key={chip.category + chip.value} className="pattern-chip">
                  {chip.label}
                  <button
                    className="pattern-chip-x"
                    onClick={() => toggleFilter(chip.category, chip.value)}
                    aria-label={`Remove ${chip.label}`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          {showStats ? (
            <PatternStats
              words={filteredWords}
              onApplyFilter={(category, value) => {
                applyPatternFilter(category, value);
                setShowStats(false);
                setGroupBy(["article"]);
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
      </div>}

      {activeSection === "vocabulary" && <footer className="app-footer">
        <span>
          Built by{" "}
          <a href="https://github.com/e-biswas" target="_blank" rel="noopener">
            e-biswas
          </a>
        </span>
        <span> | </span>
        <a
          href="https://www.flaticon.com/free-icon/cat_18291644"
          target="_blank"
          rel="noopener"
        >
          Icon designed by Whitevector from Flaticon
        </a>
      </footer>}

      {flashcardOpen && (
        <FlashcardMode
          words={nounWords}
          onClose={() => {
            setFlashcardOpen(false);
            refreshMemory();
          }}
        />
      )}

      {mixedPracticeOpen && grammarData && (
        <MixedPractice
          words={nounWords}
          grammarData={grammarData}
          onClose={() => {
            setMixedPracticeOpen(false);
            refreshMemory();
          }}
          onOpenGrammarReference={(topicId) => {
            refreshMemory();
            openGrammarReference(topicId);
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
