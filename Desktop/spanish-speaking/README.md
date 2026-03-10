# Spanish Learning App

A comprehensive Spanish learning platform with interactive lessons, vocabulary browser, progress tracking, and multiple dialect support (Spain, Mexico, Puerto Rico, Latin America).

![Spanish Learning App](https://img.shields.io/badge/Spanish-Learning-ff6b6b)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4)

## Live Demo

Deployed to GitHub Pages: `https://gfbtools.github.io/spanish-speaking/`

## Features

- **15 A1 Lessons** — Complete lesson content with dialogues, exercises, and cultural notes
- **Audio Pronunciation** — Browser-native Text-to-Speech for all dialogues, flashcards, and vocabulary using Web Speech API (no API key required)
- **Speaking Practice** — Record your voice; live transcription via Web Speech Recognition scores your pronunciation against the expected phrase
- **Multiple Dialects** — es-MX (base), es-ES (Spain), es-PR (Puerto Rico), es-419 (Latin America) with a base+override architecture
- **Vocabulary Browser** — 160+ A1 words with IPA, dialect labels, and listen buttons
- **Spaced Repetition Flashcards** — SM-2-inspired rating (Again / Hard / Good / Easy / Perfect)
- **Progress Tracking** — Lessons completed, streak, study time, and skill breakdowns
- **Offline-ready** — Progress saved to localStorage; all lesson data bundled (no backend required)

## Tech Stack

- React 19 + TypeScript 5.9
- Vite 7 + Tailwind CSS 3.4 + shadcn/ui
- Web Speech API (SpeechSynthesis + SpeechRecognition)
- GitHub Actions → GitHub Pages (auto-deploy on push to `main`)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Production Build

```bash
NODE_ENV=production npm run build
```

## Project Structure

```
src/
  components/
    DialogueViewer.tsx      # Dialogue with per-line TTS
    FlashcardViewer.tsx     # SRS flashcards with TTS
    ExerciseViewer.tsx      # Multiple choice, fill-in-blank, matching
    SpeakingPractice.tsx    # Mic recording + SpeechRecognition scoring
  hooks/
    useTTS.ts               # Shared Web Speech API hook (dialect-aware)
  sections/
    Header.tsx / Hero.tsx / Footer.tsx
    LessonBrowser.tsx       # Browse and select lessons
    LessonViewer.tsx        # Tabbed lesson experience
    VocabularyBrowser.tsx   # Filterable vocab with TTS
    ProgressDashboard.tsx
  types/index.ts
  utils/mergeDialectLesson.ts
public/data/
  *.base.json               # Full lesson in es-MX (canonical)
  *.overrides.{dialect}.json # Dialect-specific differences only
  vocab_a1.json / vocab_es_pr.json
worker/                     # Cloudflare Worker (future backend — NOT active)
.github/workflows/
  deploy-frontend.yml       # Active — deploys to GitHub Pages on push to main
  deploy-worker.yml         # NOT active — worker not yet deployed
```

## Dialect Architecture

Lessons use a **base + override** system:

| Lesson | es-MX (base) | es-PR | es-ES |
|--------|-------------|-------|-------|
| Greetings | ✅ | ✅ | ✅ |
| Alphabet & Sounds | ✅ | ✅ | ✅ |
| Numbers | ✅ | ✅ | ✅ |
| Time & Days | ✅ | ✅ | ✅ |
| Family | ✅ | ✅ | ✅ |
| Descriptions | ✅ | ✅ | ✅ |
| Daily Routine | ✅ | ✅ | ✅ |
| Weather | ✅ | ✅ | ✅ |
| Likes & Dislikes | ✅ | ✅ | ✅ |
| Basic Questions | ✅ | ✅ | ✅ |
| Ser vs Estar | ✅ | ✅ | ✅ |
| Present Tense | ✅ | ✅ | ✅ |
| Restaurant | ✅ | ✅ | ✅ |
| Shopping | ✅ | ✅ | ✅ |
| Directions | ✅ | ✅ | ⏳ pending |

## GitHub Pages Setup

1. Go to **Settings → Pages** in the repo
2. Set source to **GitHub Actions**
3. Push to `main` — the workflow deploys automatically

## License

MIT License — see LICENSE file for details
