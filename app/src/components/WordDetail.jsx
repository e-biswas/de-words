import humanize from "../utils/humanize";
import "./WordDetail.css";

export default function WordDetail({ word, onClose }) {
  const gp = word.gender_patterns;
  const vp = word.verb_patterns;
  const ap = word.adjective_patterns;
  const n = word.noun;

  return (
    <div className="word-detail">
      <button
        className="close-btn"
        type="button"
        aria-label="Close word details"
        onClick={onClose}
      >
        x
      </button>

      <h2 className={`article-color article-${n?.article || "none"}`}>
        {word.display || word.word}
      </h2>
      <p className="detail-meaning">{word.meaning?.en || word.meaning_en}</p>

      <div className="detail-row">
        <span className="detail-label">Level</span>
        <span className="detail-val">
          {word._level} - L{word.lesson} P{word.page}
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
                final part: <strong>{gp.compound_root}</strong>
              </span>
            </div>
          )}

          {gp.plural_formation && (
            <div className="detail-row">
              <span className="detail-label">Plural</span>
              <span className="detail-val">
                {n?.plural || "-"} ({gp.plural_formation})
              </span>
            </div>
          )}

          {gp.is_exception && (
            <div className="detail-row exception">
              <span className="detail-label">Warning Exception</span>
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
              <span className="detail-label">Prat. (3sg)</span>
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
              {ap.comparative || "-"} | {ap.superlative || "-"}
              {ap.is_irregular_comparison && " irregular"}
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
        <span className="detail-val">{word.usage?.register || "-"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Frequency</span>
        <span className="detail-val">{word.usage?.frequency || "-"}</span>
      </div>
    </div>
  );
}
