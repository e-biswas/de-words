import { useState, useEffect } from "react";
import CatLogo from "./CatLogo";
import "./Onboarding.css";

const STEPS = [
  {
    title: "Welcome to LDW",
    subtitle: "Learn German noun genders through patterns, not memorization.",
    visual: "welcome",
    body: (
      <>
        <p>Most apps show the article and hope you remember it.</p>
        <p>LDW tells you <strong>why</strong> - every noun is tagged with its gender rule, ending, and a memory hint.</p>
        <div className="ono-example">
          <span className="ono-ex-word">die Zeitung</span>
          <span className="ono-ex-hint">Rule: -ung words are always feminine</span>
        </div>
      </>
    ),
  },
  {
    title: "Header Icons",
    subtitle: "Four tools to power your learning, always one tap away.",
    visual: "header",
    body: (
      <>
        <div className="ono-icon-row">
          <span className="ono-icon-box"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="9" width="3" height="6" rx="0.5"/><rect x="6.5" y="4" width="3" height="11" rx="0.5"/><rect x="12" y="1" width="3" height="14" rx="0.5"/></svg></span>
          <span className="ono-icon-label"><strong>Stats</strong> - see which endings map to which gender</span>
        </div>
        <div className="ono-icon-row">
          <span className="ono-icon-box"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="14" height="3" rx="0.5"/><rect x="1" y="6.5" width="14" height="3" rx="0.5"/><rect x="1" y="12" width="14" height="3" rx="0.5"/></svg></span>
          <span className="ono-icon-label"><strong>Group</strong> - nest words by topic, rule, or ending</span>
        </div>
        <div className="ono-icon-row">
          <span className="ono-icon-box"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M6 6.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5c0 1-1 1.3-1 2"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor" stroke="none"/></svg></span>
          <span className="ono-icon-label"><strong>Help</strong> - reopen this guide anytime</span>
        </div>
        <div className="ono-icon-row">
          <span className="ono-icon-box"><span className="ono-icon-char">Dark</span></span>
          <span className="ono-icon-label"><strong>Dark mode</strong> - easy on the eyes at night</span>
        </div>
      </>
    ),
  },
  {
    title: "Filter & Find",
    subtitle: "4,795 words at your fingertips. Narrow them down instantly.",
    visual: "filter",
    body: (
      <>
        <p>Use the <strong>sidebar filters</strong> - level, article, part of speech, topic, and more. Every option shows a live count.</p>
        <p>The <strong>search bar</strong> finds words by German spelling, English meaning, or noun form.</p>
        <p className="ono-tip">Tip: Tap the hamburger menu on mobile to open filters.</p>
      </>
    ),
  },
  {
    title: "Discover Patterns",
    subtitle: "Group words to see how endings map to gender.",
    visual: "group",
    body: (
      <>
        <p>Tap <strong>Group</strong> then add levels - e.g. Topic to Article, or Gender Rule to Article.</p>
        <p>Ordering numbers show the nesting hierarchy. Tap a group header to expand or collapse it.</p>
        <p>Open <strong>Pattern Stats</strong> to browse every suffix and its gender breakdown with percentage bars.</p>
      </>
    ),
  },
  {
    title: "Smart Practice",
    subtitle: "Guess the article, learn the pattern behind every answer.",
    visual: "practice",
    body: (
      <>
        <p>Tap <strong>Practice</strong> to enter flashcard mode. Guess <strong>der</strong>, <strong>die</strong>, or <strong>das</strong> for each word.</p>
        <p>After each guess you see the <strong>pattern rule</strong>, a memory hint, and your history with that word.</p>
        <p>Uses <strong>spaced repetition</strong> - words you know appear less often, tricky ones come back sooner.</p>
      </>
    ),
  },
  {
    title: "Track Progress",
    subtitle: "Your learning is saved automatically in your browser.",
    visual: "progress",
    body: (
      <>
        <p>Every word moves through <strong>6 mastery levels</strong>: New, Seen, Learning, Familiar, Known, and Mastered.</p>
        <p>Filter by learning status to focus on words that need review. No account needed - everything stays in your browser.</p>
      </>
    ),
  },
  {
    title: "You're Ready",
    subtitle: "Start exploring and let the patterns do the work.",
    visual: "ready",
    body: (
      <>
        <p>Open the sidebar, pick some filters, and dive in. Tap <strong>Practice</strong> whenever you're ready to test yourself.</p>
        <p className="ono-tip">Viel Erfolg! </p>
      </>
    ),
  },
];

function WelcomeVisual() {
  return (
    <div className="ono-visual ono-v-welcome">
      <span className="ono-art der">der</span>
      <span className="ono-art die">die</span>
      <span className="ono-art das">das</span>
    </div>
  );
}

function HeaderVisual() {
  return (
    <div className="ono-visual ono-v-header">
      <div className="ono-h-icons">
        <span className="ono-h-icon"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="9" width="3" height="6" rx="0.5"/><rect x="6.5" y="4" width="3" height="11" rx="0.5"/><rect x="12" y="1" width="3" height="14" rx="0.5"/></svg></span>
        <span className="ono-h-icon active"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="1" width="14" height="3" rx="0.5"/><rect x="1" y="6.5" width="14" height="3" rx="0.5"/><rect x="1" y="12" width="14" height="3" rx="0.5"/></svg></span>
        <span className="ono-h-icon"><svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M6 6.5c0-.8.9-1.5 2-1.5s2 .7 2 1.5c0 1-1 1.3-1 2"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor" stroke="none"/></svg></span>
        <span className="ono-h-icon dark">Dark</span>
      </div>
      <span className="ono-h-label">- top-right header tools</span>
    </div>
  );
}

function FilterVisual() {
  return (
    <div className="ono-visual ono-v-filter">
      <div className="ono-f-chips">
        <span className="ono-chip on">A1</span>
        <span className="ono-chip">der</span>
        <span className="ono-chip">noun</span>
        <span className="ono-chip accent">food</span>
      </div>
      <span className="ono-f-count">1,681 words match</span>
    </div>
  );
}

function GroupVisual() {
  return (
    <div className="ono-visual ono-v-group">
      <div className="ono-g-row">
        <span className="ono-g-label">Ending: -ung</span>
        <span className="ono-g-bar"><span className="ono-g-fill die" style={{width:"100%"}} /></span>
        <span className="ono-g-pct">100% die</span>
      </div>
      <div className="ono-g-row">
        <span className="ono-g-label">Ending: -chen</span>
        <span className="ono-g-bar"><span className="ono-g-fill das" style={{width:"100%"}} /></span>
        <span className="ono-g-pct">100% das</span>
      </div>
      <div className="ono-g-row">
        <span className="ono-g-label">Ending: -er</span>
        <span className="ono-g-bar"><span className="ono-g-fill der" style={{width:"78%"}} /></span>
        <span className="ono-g-pct">78% der</span>
      </div>
    </div>
  );
}

function PracticeVisual() {
  return (
    <div className="ono-visual ono-v-practice">
      <div className="ono-card">
        <span className="ono-card-word">Zeitung</span>
        <div className="ono-card-btns">
          <span className="ono-card-btn der">der</span>
          <span className="ono-card-btn die active">die OK</span>
          <span className="ono-card-btn das">das</span>
        </div>
        <span className="ono-card-hint">-ung means always feminine</span>
      </div>
    </div>
  );
}

function ProgressVisual() {
  return (
    <div className="ono-visual ono-v-progress">
      <div className="ono-lv-list">
        <span className="ono-lv-item"><span className="status-dot status-new" /> New</span>
        <span className="ono-lv-item"><span className="status-dot status-learning" /> Learning</span>
        <span className="ono-lv-item"><span className="status-dot status-familiar" /> Familiar</span>
        <span className="ono-lv-item"><span className="status-dot status-mastered" /> Mastered</span>
      </div>
    </div>
  );
}

function ReadyVisual() {
  return (
    <div className="ono-visual ono-v-ready">
      <CatLogo size={48} />
    </div>
  );
}

const VISUALS = {
  welcome: WelcomeVisual,
  header: HeaderVisual,
  filter: FilterVisual,
  group: GroupVisual,
  practice: PracticeVisual,
  progress: ProgressVisual,
  ready: ReadyVisual,
};

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Visual = VISUALS[s.visual];

  return (
    <div className="ono-overlay" onClick={onClose}>
      <div className="ono-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ono-close" type="button" aria-label="Close help guide" onClick={onClose}>x</button>

        <div className="ono-step-indicator">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ono-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="ono-visual-wrap">
          <Visual />
        </div>

        <div className="ono-content">
          <h2>{s.title}</h2>
          <p className="ono-subtitle">{s.subtitle}</p>
          <div className="ono-body">{s.body}</div>
        </div>

        <div className="ono-footer">
          <button className="ono-btn skip" type="button" onClick={onClose}>
            Skip tour
          </button>
          <div className="ono-nav">
            <button
              className="ono-btn secondary"
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
            {isLast ? (
              <button className="ono-btn primary" type="button" onClick={onClose}>
                Get Started
              </button>
            ) : (
              <button className="ono-btn primary" type="button" onClick={() => setStep((s) => s + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
