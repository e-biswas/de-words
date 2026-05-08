import { memo, useState, useMemo } from "react";
import humanize from "../utils/humanize";
import "./FilterPanel.css";

const LEVEL_OPTIONS = ["A1", "A2", "B1"];
const ARTICLE_OPTIONS = ["der", "die", "das"];
const POS_OPTIONS = ["noun", "verb", "adjective"];
const FREQUENCY_OPTIONS = ["core", "common", "situational", "academic"];
const REGISTER_OPTIONS = ["neutral", "formal", "informal", "colloquial"];
const ENTITY_OPTIONS = [
  "person", "place", "object", "food", "abstract", "event",
  "organism", "substance", "time", "action", "quality", "communication",
];
const LEARNING_OPTIONS = [
  { value: "new", label: "New" },
  { value: "learning", label: "Learning" },
  { value: "familiar", label: "Familiar" },
  { value: "mastered", label: "Mastered" },
];

function initCounter(values) {
  return Object.fromEntries(values.map((v) => [v, 0]));
}

function matchesFiltersExcept(w, filters, category) {
  if (category !== "levels" && filters.levels.length > 0 && !filters.levels.includes(w._level)) return false;
  if (category !== "articles" && filters.articles.length > 0 && !filters.articles.includes(w.noun?.article)) return false;
  if (category !== "pos" && filters.pos.length > 0 && !filters.pos.includes(w.part_of_speech)) return false;
  if (
    category !== "topics" &&
    filters.topics.length > 0 &&
    !filters.topics.some((t) => (w.semantic?.topics || []).includes(t))
  ) {
    return false;
  }
  if (
    category !== "genderRules" &&
    filters.genderRules.length > 0 &&
    !filters.genderRules.includes(w.gender_patterns?.primary_rule)
  ) {
    return false;
  }
  if (
    filters.gender_rule?.length > 0 &&
    category !== "gender_rule" &&
    !filters.gender_rule.includes(w.gender_patterns?.primary_rule)
  ) {
    return false;
  }
  if (
    filters.ending_pattern?.length > 0 &&
    category !== "ending_pattern" &&
    !filters.ending_pattern.includes(w.gender_patterns?.ending_pattern)
  ) {
    return false;
  }
  if (
    category !== "frequencies" &&
    filters.frequencies?.length > 0 &&
    !filters.frequencies.includes(w.usage?.frequency)
  ) {
    return false;
  }
  if (
    category !== "registers" &&
    filters.registers?.length > 0 &&
    !filters.registers.includes(w.usage?.register)
  ) {
    return false;
  }
  if (
    category !== "entityTypes" &&
    filters.entityTypes?.length > 0 &&
    !filters.entityTypes.includes(w.semantic?.entity_type)
  ) {
    return false;
  }
  if (
    category !== "learningStatus" &&
    filters.learningStatus?.length > 0 &&
    !filters.learningStatus.includes(w._status || "new")
  ) {
    return false;
  }

  return true;
}

function buildCountMaps(allWords, filters, availableTopics, availableRules) {
  const counts = {
    levels: initCounter(LEVEL_OPTIONS),
    articles: initCounter(ARTICLE_OPTIONS),
    pos: initCounter(POS_OPTIONS),
    topics: initCounter(availableTopics),
    genderRules: initCounter(availableRules),
    frequencies: initCounter(FREQUENCY_OPTIONS),
    registers: initCounter(REGISTER_OPTIONS),
    entityTypes: initCounter(ENTITY_OPTIONS),
    learningStatus: initCounter(LEARNING_OPTIONS.map((o) => o.value)),
  };

  for (const w of allWords) {
    if (matchesFiltersExcept(w, filters, "levels")) {
      const level = w._level;
      if (level in counts.levels) counts.levels[level] += 1;
    }

    if (matchesFiltersExcept(w, filters, "articles")) {
      const article = w.noun?.article;
      if (article in counts.articles) counts.articles[article] += 1;
    }

    if (matchesFiltersExcept(w, filters, "pos")) {
      const pos = w.part_of_speech;
      if (pos in counts.pos) counts.pos[pos] += 1;
    }

    if (matchesFiltersExcept(w, filters, "learningStatus")) {
      const status = w._status || "new";
      if (status in counts.learningStatus) counts.learningStatus[status] += 1;
    }

    if (matchesFiltersExcept(w, filters, "frequencies")) {
      const frequency = w.usage?.frequency;
      if (frequency in counts.frequencies) counts.frequencies[frequency] += 1;
    }

    if (matchesFiltersExcept(w, filters, "registers")) {
      const register = w.usage?.register;
      if (register in counts.registers) counts.registers[register] += 1;
    }

    if (matchesFiltersExcept(w, filters, "genderRules")) {
      const rule = w.gender_patterns?.primary_rule;
      if (rule in counts.genderRules) counts.genderRules[rule] += 1;
    }

    if (matchesFiltersExcept(w, filters, "entityTypes")) {
      const entityType = w.semantic?.entity_type;
      if (entityType in counts.entityTypes) counts.entityTypes[entityType] += 1;
    }

    if (matchesFiltersExcept(w, filters, "topics")) {
      const topics = w.semantic?.topics || [];
      for (const topic of topics) {
        if (topic in counts.topics) counts.topics[topic] += 1;
      }
    }
  }

  return counts;
}

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button className="filter-section-header" onClick={() => setOpen((o) => !o)}>
        <span className="filter-section-arrow">{open ? "▾" : "▸"}</span>
        {title}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function FilterPanel({
  filters,
  toggleFilter,
  toggleLevel,
  clearAllFilters,
  availableTopics,
  availableRules,
  allWords,
}) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const filteredTopics = useMemo(
    () => !q ? availableTopics : availableTopics.filter((t) => humanize(t).toLowerCase().includes(q)),
    [availableTopics, q]
  );
  const filteredRules = useMemo(
    () => !q ? availableRules : availableRules.filter((r) => humanize(r).toLowerCase().includes(q)),
    [availableRules, q]
  );
  const filteredEntities = useMemo(
    () => !q ? ENTITY_OPTIONS : ENTITY_OPTIONS.filter((e) => humanize(e).toLowerCase().includes(q)),
    [q]
  );

  const countMaps = useMemo(
    () => buildCountMaps(allWords, filters, availableTopics, availableRules),
    [allWords, filters, availableTopics, availableRules]
  );

  const countFor = (category, value) => countMaps[category]?.[value] || 0;

  const activeFilterCount = Object.values(filters).reduce((s, a) => s + a.length, 0);

  // Collect pattern filters for chip display
  const patternChips = [];
  if (filters.ending_pattern?.length > 0) {
    filters.ending_pattern.forEach((v) => patternChips.push({ category: "ending_pattern", label: `Ending: ${v}`, value: v }));
  }
  if (filters.gender_rule?.length > 0) {
    filters.gender_rule.forEach((v) => patternChips.push({ category: "gender_rule", label: `Rule: ${humanize(v)}`, value: v }));
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</h3>
        {activeFilterCount > 0 && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear all
          </button>
        )}
      </div>

      {patternChips.length > 0 && (
        <div className="active-pattern-chips">
          {patternChips.map((chip) => (
            <span key={chip.category + chip.value} className="pattern-chip">
              {chip.label}
              <button
                className="pattern-chip-x"
                onClick={() => toggleFilter(chip.category, chip.value)}
                aria-label={`Remove ${chip.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        className="filter-search"
        placeholder="Search filters..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <FilterSection title="Level" defaultOpen>
        {LEVEL_OPTIONS.map((level) => (
          <label key={level} className="filter-item">
            <input type="checkbox" checked={filters.levels.includes(level)} onChange={() => toggleLevel(level)} />
            <span>{level}</span>
            <span className="filter-count">{countFor("levels", level)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Article" defaultOpen>
        {ARTICLE_OPTIONS.map((art) => (
          <label key={art} className="filter-item">
            <input type="checkbox" checked={filters.articles.includes(art)} onChange={() => toggleFilter("articles", art)} />
            <span className={`article-color article-${art}`}>{art}</span>
            <span className="filter-count">{countFor("articles", art)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Part of Speech">
        {POS_OPTIONS.map((pos) => (
          <label key={pos} className="filter-item">
            <input type="checkbox" checked={filters.pos.includes(pos)} onChange={() => toggleFilter("pos", pos)} />
            <span>{humanize(pos)}</span>
            <span className="filter-count">{countFor("pos", pos)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Learning Status">
        {LEARNING_OPTIONS.map((opt) => (
          <label key={opt.value} className="filter-item">
            <input
              type="checkbox"
              checked={(filters.learningStatus || []).includes(opt.value)}
              onChange={() => toggleFilter("learningStatus", opt.value)}
            />
            <span className={`status-dot status-${opt.value}`} />{opt.label}
            <span className="filter-count">{countFor("learningStatus", opt.value)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Frequency">
        {FREQUENCY_OPTIONS.map((freq) => (
          <label key={freq} className="filter-item small">
            <input type="checkbox" checked={(filters.frequencies || []).includes(freq)} onChange={() => toggleFilter("frequencies", freq)} />
            <span>{humanize(freq)}</span>
            <span className="filter-count">{countFor("frequencies", freq)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Register">
        {REGISTER_OPTIONS.map((reg) => (
          <label key={reg} className="filter-item small">
            <input type="checkbox" checked={(filters.registers || []).includes(reg)} onChange={() => toggleFilter("registers", reg)} />
            <span>{humanize(reg)}</span>
            <span className="filter-count">{countFor("registers", reg)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Gender Rule">
        <div className="filter-scroll">
          {filteredRules.map((rule) => (
            <label key={rule} className="filter-item small">
              <input type="checkbox" checked={filters.genderRules.includes(rule)} onChange={() => toggleFilter("genderRules", rule)} />
              <span>{humanize(rule)}</span>
              <span className="filter-count">{countFor("genderRules", rule)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Entity Type">
        <div className="filter-scroll">
          {filteredEntities.map((et) => (
            <label key={et} className="filter-item small">
              <input type="checkbox" checked={(filters.entityTypes || []).includes(et)} onChange={() => toggleFilter("entityTypes", et)} />
              <span>{humanize(et)}</span>
              <span className="filter-count">{countFor("entityTypes", et)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Topic">
        <div className="filter-scroll">
          {filteredTopics.map((topic) => (
            <label key={topic} className="filter-item small">
              <input type="checkbox" checked={filters.topics.includes(topic)} onChange={() => toggleFilter("topics", topic)} />
              <span>{humanize(topic)}</span>
              <span className="filter-count">{countFor("topics", topic)}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export default memo(FilterPanel);
