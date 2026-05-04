# LDW — Learn German Words

A gender-first German vocabulary learning app. Master **der/die/das** through patterns, not rote memorization.

## Why LDW?

Most apps just show you the article and hope you remember. LDW tells you **why**:

```
die Zeitung → -ung words are always feminine
der Tisch  → most one-syllable concrete nouns are masculine
das Mädchen → -chen makes any noun neuter
```

Every noun is tagged with its gender rule, ending pattern, compound breakdown, and a learner-friendly memory hint. Verbs come with prefix analysis, past forms, and complement patterns. Adjectives show comparison forms and opposites.

## Features

- **2,049 German words** (A1–B1) with rich linguistic tagging
- **Pattern stats** — see which suffixes map to which gender with percentages
- **Multi-level grouping** — nest by topic → gender rule → article to discover patterns
- **Smart flashcard mode** — guess the article, get instant feedback with the pattern explanation
- **Spaced repetition** — 6 mastery levels, words you've learned stay away until review is due
- **Dark mode**, responsive mobile layout, keyboard shortcuts
- **localStorage** — your progress persists across sessions

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open http://localhost:5173

## Tech

- React + Vite
- DeepSeek-tagged vocabulary (gender patterns, verb analysis, semantic topics)
- localStorage for SRS progress
- CSS custom properties for theming

## Data

Words sourced from VHS Lernportal vocabulary lists (A1–B1), enriched with AI-generated linguistic tags:

| Field | Description |
|-------|-------------|
| `gender_patterns` | Why a noun has its gender (ending, compound, semantic group, etc.) |
| `verb_patterns` | Prefix type, auxiliary, regularity, past forms, complements |
| `adjective_patterns` | Comparison forms, irregular flag, antonyms |
| `semantic.topics` | 30-topic classification |
| `usage` | Register and frequency tier |

## Keyboard Shortcuts (Flashcard Mode)

| Key | Action |
|-----|--------|
| `1` `2` `3` | Guess der / die / das |
| `→` | Next word |
| `s` | Skip |
| `/` | Peek meaning |
| `m` | Toggle always-show meaning |
| `Esc` | Close |

## License

MIT
