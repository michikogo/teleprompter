# Implementation Plan

> Living document. Update phase status as work progresses.
> Status: ⬜ not started · 🔄 in progress · ✅ done

---

## Repo Structure

```
teleprompter/
├── client/                          # Vite + React + TypeScript
│   ├── src/
│   │   ├── data/
│   │   │   └── sampleScripts.ts     # 3–5 hardcoded sample scripts
│   │   ├── lib/
│   │   │   ├── levenshtein.ts       # Levenshtein distance utility
│   │   │   ├── positionTracker.ts   # Sliding window, scoring, forward-only
│   │   │   └── scriptTokenizer.ts   # Normalize + split script into word tokens
│   │   ├── hooks/
│   │   │   └── useTranscription.ts  # Mic capture + WS to backend + transcript output
│   │   ├── components/
│   │   │   ├── ScriptInput.tsx      # Textarea, template dropdown, "Read Back Script" btn
│   │   │   └── TeleprompterDisplay.tsx  # Scrolling word display + highlight
│   │   ├── App.tsx                  # Mode router: 'input' | 'reading'
│   │   └── main.tsx
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── server/
│   ├── src/
│   │   └── index.ts                 # Express + WS proxy to Deepgram
│   ├── tsconfig.json
│   └── package.json
├── .env                             # DEEPGRAM_API_KEY (gitignored)
├── .prettierrc
├── eslint.config.js
└── package.json                     # Root: scripts to run client + server concurrently
```

---

## Branch & PR Strategy

Each phase is its own branch and PR against `main`.

| Phase | Branch                    | Status | What the PR shows                            |
| ----- | ------------------------- | ------ | -------------------------------------------- |
| 1     | `phase/1-scaffolding`     | ✅     | Empty app skeleton, tooling, CI, PR template |
| 2     | `phase/2-backend-proxy`   | ✅     | Working WS proxy; testable with a WS client  |
| 3     | `phase/3-script-input`    | ⬜     | Script input screen renders in browser       |
| 4     | `phase/4-display`         | ⬜     | Teleprompter display renders and scrolls     |
| 5     | `phase/5-fuzzy-matching`  | ⬜     | Fuzzy matching logic + passing unit tests    |
| 6     | `phase/6-transcription`   | ⬜     | Mic → backend → transcript words flowing     |
| 7     | `phase/7-wire-up`         | ⬜     | Full end-to-end: speech drives scroll        |
| 8     | `phase/8-manual-controls` | ⬜     | Reset + click-to-reposition working          |

---

## Phase 1 — Scaffolding ✅

**Branch:** `phase/1-scaffolding`

1. Initialize `client/` using `npm create vite@latest client -- --template react-ts`
2. Initialize `server/` manually with `package.json`, `tsconfig.json`, install `express`, `ws`, `@types/*`
3. Root `package.json` with a `dev` script running both via `concurrently`
4. Add `.prettierrc` (double quotes, semicolons, 2-space indent)
5. Add `eslint.config.js` with TypeScript rules
6. Configure Vitest inside `client/vite.config.ts`
7. Add CI: `.github/workflows/ci.yml` — lint + test on push/PR to main
8. Add PR template: `.github/pull_request_template.md`

---

## Phase 2 — Backend Proxy ✅

**Branch:** `phase/2-backend-proxy`

**File:** `server/src/index.ts`

- Install `dotenv` (server-only)
- Express HTTP server on port `3001`
- Attach `ws` WebSocket server to the same HTTP server
- On client WS connect:
  - Open WS to Deepgram: `wss://api.deepgram.com/v1/listen?model=nova-3&language=en-US&encoding=linear16&sample_rate=16000&punctuate=true`
  - Auth header: `Authorization: Token ${process.env.DEEPGRAM_API_KEY}`
  - Forward binary frames (audio) from client → Deepgram
  - Forward text frames (transcripts) from Deepgram → client
  - Clean up both connections on close/error

---

## Phase 3 — Script Input Screen ⬜

**Branch:** `phase/3-script-input`

**`client/src/data/sampleScripts.ts`**

- Export `{ title: string; text: string }[]` with 4 sample scripts
- Suggestions: product demo pitch, news broadcast intro, wedding speech, tech talk opener

**`client/src/components/ScriptInput.tsx`**

- `<select>` dropdown — selecting a template populates the textarea
- `<textarea>` for freeform input/edit
- "Read Back Script" button — disabled if textarea empty
- On click: calls `onStart(scriptText)` prop

**`client/src/App.tsx`**

- State: `mode: 'input' | 'reading'`, `script: string`
- Renders `<ScriptInput>` or `<TeleprompterDisplay>` based on mode

---

## Phase 4 — Script Tokenizer + Display ⬜

**Branch:** `phase/4-display`

**`client/src/lib/scriptTokenizer.ts`**

```ts
type ScriptWord = { raw: string; normalized: string; index: number }
const tokenizeScript = (text: string): ScriptWord[]
const groupIntoLines = (words: ScriptWord[], wordsPerLine = 5): ScriptWord[][]
```

- `normalized`: lowercase, punctuation stripped (for matching)
- `raw`: original text (for display)

**`client/src/components/TeleprompterDisplay.tsx`**

- Props: `scriptText`, `currentWordIndex`, `onWordClick`, `onReset`
- Renders lines of ~5 words; highlights word at `currentWordIndex`
- On position change: `scrollIntoView({ behavior: 'smooth', block: 'center' })` on active line
- Each word clickable → `onWordClick(index)`

---

## Phase 5 — Fuzzy Matching ⬜

**Branch:** `phase/5-fuzzy-matching`

**`client/src/lib/levenshtein.ts`**

```ts
const levenshtein = (a: string, b: string): number  // edit distance
const similarity = (a: string, b: string): number   // 0–1, 1 = identical
```

**`client/src/lib/positionTracker.ts`**

```ts
const WINDOW_SIZE = 10        // last N transcript words to match against
const LOOKAHEAD = 100         // max words ahead to scan for a skip
const MATCH_THRESHOLD = 0.4   // minimum score to advance position

const findBestPosition = (
  scriptWords: string[],
  transcriptWindow: string[],
  currentPosition: number      // forward-only: never return < this
): number
```

**`client/src/lib/positionTracker.test.ts`**

- Normal read → position advances
- Filler words inserted → position still advances
- Off-script → position holds
- Skip ahead → position jumps forward
- No backward movement → position stays

---

## Phase 6 — Transcription Hook ⬜

**Branch:** `phase/6-transcription`

**`client/src/hooks/useTranscription.ts`**

```ts
const useTranscription = () => ({
  start: () => void,
  stop: () => void,
  isListening: boolean,
  transcriptWords: string[],
})
```

- `start()`: mic via `getUserMedia` → `AudioContext` (16kHz) → `ScriptProcessorNode` → PCM Int16 → binary WS frames to `ws://localhost:3001`
- Parse incoming Deepgram JSON → append words to state
- `stop()`: close AudioContext + WebSocket

---

## Phase 7 — Wire Up Position Tracking ⬜

**Branch:** `phase/7-wire-up`

In `App.tsx` (reading mode):

- Call `useTranscription()`
- On `transcriptWords` update → `findBestPosition` → `setCurrentWordIndex`
- Pass state + handlers to `<TeleprompterDisplay>`

---

## Phase 8 — Manual Controls ⬜

**Branch:** `phase/8-manual-controls`

- **Reset**: sets `currentWordIndex` to `0`, clears `transcriptWords`
- **Click-to-reposition**: sets `currentWordIndex` to clicked word index directly (bypasses tracking)

---

## Verification Checklist

- [ ] `npm run dev` starts client (`:5173`) and server (`:3001`)
- [ ] Select a sample script → click "Read Back Script" → teleprompter view opens
- [ ] Speak aloud → teleprompter scrolls to track position
- [ ] Ad-lib → position holds
- [ ] Skip a sentence → position jumps forward
- [ ] Click a word → position jumps to that word
- [ ] Click Reset → position returns to top
- [ ] `npm test` in `client/` → all unit tests pass
- [ ] CI passes on push to main
