import { useState, useMemo } from "react";
import humanize from "../utils/humanize";
import "./FilterPanel.css";

function countMatching(allWords, filters, category, value) {
  return allWords.filter((w) => {
    if (filters.levels.length > 0 && category !== "levels" && !filters.levels.includes(w._level)) return false;
    if (filters.articles.length > 0 && category !== "articles" && !filters.articles.includes(w.noun?.article)) return false;
    if (filters.pos.length > 0 && category !== "pos" && !filters.pos.includes(w.part_of_speech)) return false;
    if (filters.topics.length > 0 && category !== "topics" && !filters.topics.some((t) => (w.semantic?.topics || []).includes(t))) return false;
    if (filters.genderRules.length > 0 && category !== "genderRules" && !filters.genderRules.includes(w.gender_patterns?.primary_rule)) return false;
    if (filters.gender_rule?.length > 0 && category !== "gender_rule" && !filters.gender_rule.includes(w.gender_patterns?.primary_rule)) return false;
    if (filters.ending_pattern?.length > 0 && category !== "ending_pattern" && !filters.ending_pattern.includes(w.gender_patterns?.ending_pattern)) return false;
    if (filters.frequencies?.length > 0 && category !== "frequencies" && !filters.frequencies.includes(w.usage?.frequency)) return false;
    if (filters.registers?.length > 0 && category !== "registers" && !filters.registers.includes(w.usage?.register)) return false;
    if (filters.entityTypes?.length > 0 && category !== "entityTypes" && !filters.entityTypes.includes(w.semantic?.entity_type)) return false;
    if (filters.learningStatus?.length > 0 && category !== "learningStatus" && !filters.learningStatus.includes(w._status)) return false;

    switch (category) {
      case "levels": return w._level === value;
      case "articles": return w.noun?.article === value;
      case "pos": return w.part_of_speech === value;
      case "topics": return (w.semantic?.topics || []).includes(value);
      case "genderRules": return w.gender_patterns?.primary_rule === value;
      case "frequencies": return w.usage?.frequency === value;
      case "registers": return w.usage?.register === value;
      case "entityTypes": return w.semantic?.entity_type === value;
      case "learningStatus": return w._status === value;
      default: return false;
    }
  }).length;
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

export default function FilterPanel({
  filters,
  toggleFilter,
  toggleLevel,
  clearAllFilters,
  availableTopics,
  availableRules,
  allWords,
  memoryVersion,
}) {
  const [search, setSearch] = useState("");

  const articles = ["der", "die", "das"];
  const posOptions = ["noun", "verb", "adjective"];
  const freqOptions = ["core", "common", "situational", "academic"];
  const registerOptions = ["neutral", "formal", "informal", "colloquial"];
  const entityOptions = [
    "person", "place", "object", "food", "abstract", "event",
    "organism", "substance", "time", "action", "quality", "communication",
  ];
  const learningOptions = [
    { value: "new", label: "New" },
    { value: "learning", label: "Learning" },
    { value: "familiar", label: "Familiar" },
    { value: "mastered", label: "Mastered" },
  ];

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
    () => !q ? entityOptions : entityOptions.filter((e) => humanize(e).toLowerCase().includes(q)),
    [q]
  );

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
        {["A1", "A2", "B1"].map((level) => (
          <label key={level} className="filter-item">
            <input type="checkbox" checked={filters.levels.includes(level)} onChange={() => toggleLevel(level)} />
            <span>{level}</span>
            <span className="filter-count">{countMatching(allWords, filters, "levels", level)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Article" defaultOpen>
        {articles.map((art) => (
          <label key={art} className="filter-item">
            <input type="checkbox" checked={filters.articles.includes(art)} onChange={() => toggleFilter("articles", art)} />
            <span className={`article-color article-${art}`}>{art}</span>
            <span className="filter-count">{countMatching(allWords, filters, "articles", art)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Part of Speech">
        {posOptions.map((pos) => (
          <label key={pos} className="filter-item">
            <input type="checkbox" checked={filters.pos.includes(pos)} onChange={() => toggleFilter("pos", pos)} />
            <span>{humanize(pos)}</span>
            <span className="filter-count">{countMatching(allWords, filters, "pos", pos)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Learning Status">
        {learningOptions.map((opt) => (
          <label key={opt.value} className="filter-item">
            <input
              type="checkbox"
              checked={(filters.learningStatus || []).includes(opt.value)}
              onChange={() => toggleFilter("learningStatus", opt.value)}
            />
            <span className={`status-dot status-${opt.value}`} />{opt.label}
            <span className="filter-count">{countMatching(allWords, filters, "learningStatus", opt.value)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Frequency">
        {freqOptions.map((freq) => (
          <label key={freq} className="filter-item small">
            <input type="checkbox" checked={(filters.frequencies || []).includes(freq)} onChange={() => toggleFilter("frequencies", freq)} />
            <span>{humanize(freq)}</span>
            <span className="filter-count">{countMatching(allWords, filters, "frequencies", freq)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Register">
        {registerOptions.map((reg) => (
          <label key={reg} className="filter-item small">
            <input type="checkbox" checked={(filters.registers || []).includes(reg)} onChange={() => toggleFilter("registers", reg)} />
            <span>{humanize(reg)}</span>
            <span className="filter-count">{countMatching(allWords, filters, "registers", reg)}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Gender Rule">
        <div className="filter-scroll">
          {filteredRules.map((rule) => (
            <label key={rule} className="filter-item small">
              <input type="checkbox" checked={filters.genderRules.includes(rule)} onChange={() => toggleFilter("genderRules", rule)} />
              <span>{humanize(rule)}</span>
              <span className="filter-count">{countMatching(allWords, filters, "genderRules", rule)}</span>
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
              <span className="filter-count">{countMatching(allWords, filters, "entityTypes", et)}</span>
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
              <span className="filter-count">{countMatching(allWords, filters, "topics", topic)}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
