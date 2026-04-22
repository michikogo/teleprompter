# Architecture Decision Records

Each record documents a technical decision made during design of the AI Teleprompter.

---

## Tech Stack

| Layer          | Choice                                      |
| -------------- | ------------------------------------------- |
| Frontend       | Vite + React + TypeScript                   |
| Backend        | Node + Express + TypeScript                 |
| Transcription  | Deepgram Nova-3 streaming WebSocket         |
| Fuzzy matching | Levenshtein distance (custom utility)       |
| Formatting     | Prettier                                    |
| Linting        | ESLint (TypeScript rules)                   |
| Testing        | Vitest (unit tests on fuzzy matching logic) |

---

## ADR-001: Deepgram Nova-3 for Speech Transcription

**Status:** Accepted

**Context:**
The teleprompter requires real-time, low-latency speech transcription. The service must support streaming (not batch) so the display can track position word-by-word as the user speaks.

**Options Considered:**

- **Deepgram Nova-3** ✓
  — Streaming WebSocket, best accent robustness, low latency, simple SDK. Requires a paid API key and a backend proxy.
- **Web Speech API**
  — Free and browser-native, but latency is unpredictable, accent support is poor, and behavior varies across browsers. No streaming control.
- **OpenAI Realtime API**
  — Very accurate with streaming support, but more expensive, newer, and heavier to integrate.
- **AssemblyAI**
  — Competitive accuracy and streaming support, but less ecosystem maturity than Deepgram for this use case.

**Decision:**
Use Deepgram Nova-3 via streaming WebSocket.

**Consequences:**

- Requires a backend proxy to keep the API key off the client
- ~500ms round-trip latency target is achievable with WebSocket streaming
- Nova-3 is specifically trained on conversational and accented speech, improving robustness
- Costs money; free tier available for development

---

## ADR-002: Node/Express Backend as API Key Proxy

**Status:** Accepted

**Context:**
Deepgram requires an API key. Embedding it in client-side code exposes it to anyone who opens DevTools.

**Options Considered:**

- **Node/Express WebSocket proxy** ✓
  — Simple, lightweight, full control over the stream. Requires running two processes locally (`vite dev` + `node server`).
- **Serverless function (e.g. Vercel Edge)**
  — No persistent server and scales automatically, but requires deployment — overkill for a local dev submission.
- **Next.js API routes (BFF)**
  — Single process with co-located frontend and backend, but replaces Vite entirely and is a large framework change for minimal gain.

**Decision:**
Run a lightweight Node/Express server. The client connects to this server via WebSocket; the server proxies the stream to Deepgram using the secret key stored server-side (environment variable).

**Consequences:**

- API key is never sent to the browser
- Adds a backend service to run locally (two processes: `vite dev` + `node server`)
- Server logic is minimal — just WebSocket proxying, no business logic

---

## ADR-003: Sliding Window + Levenshtein for Position Tracking

**Status:** Accepted

**Context:**
The transcript will contain filler words, mispronunciations, and partial words. A naive exact-match against the script would break frequently.

**Options Considered:**

- **Token overlap + Levenshtein** ✓
  — Handles filler words, typos, and partial matches. Well-understood algorithm, implementable as a pure utility. Weaker on thick accents where phonetics diverge significantly.
- **Exact string match**
  — Simplest to implement, but breaks on any mispronunciation, filler word, or partial word.
- **Soundex / phonetic matching**
  — Better for thick accents by matching words that sound similar, but adds meaningful complexity for marginal gain over Levenshtein for most accents in scope.

**Decision:**
Use a sliding window of the last N transcript words scored against the script using token overlap + Levenshtein distance for fuzzy word matching. Soundex is out of scope.

**Consequences:**

- Handles filler words, minor mispronunciations, and partial matches
- Levenshtein is a well-understood algorithm; can be implemented as a pure utility function
- Thick accents remain a weak point — partially mitigated by Deepgram Nova-3's accent robustness
- Vitest unit tests cover this module as the highest-risk algorithmic code

---

## ADR-004: Forward-Only Position Constraint

**Status:** Accepted

**Context:**
Speech recognition is noisy. Without constraints, the position tracker could jump backward when a word early in the script happens to score higher than the current position — causing the teleprompter to thrash.

**Options Considered:**

- **Forward-only constraint** ✓
  — Eliminates thrashing with a simple rule that's easy to reason about. Cannot auto-detect restarts; requires a manual reset button.
- **Bidirectional tracking**
  — Can auto-follow backward jumps, but carries a high risk of thrashing on noisy transcription and requires complex confidence logic.
- **Confidence threshold gating**
  — Only moves position when match confidence is high enough, but the threshold is hard to tune and may cause position to stall on low-confidence speech.

**Decision:**
The tracked position never moves backward automatically. Backward movement requires explicit user action (reset button or click-to-reposition).

**Consequences:**

- Eliminates position thrashing from noisy transcription
- Cannot auto-detect "user wants to restart from the top" — manual reset button covers this
- Paired with a lookahead window to detect intentional forward skips

---

## ADR-005: Hardcoded Script Templates (No Database)

**Status:** Accepted

**Context:**
The product requires sample scripts for demonstration. Scripts are ephemeral per requirements — no persistence needed.

**Options Considered:**

- **Hardcoded constants in frontend** ✓
  — Zero setup, no infrastructure, fast to build. Templates require a code change to update and cannot be saved by the user.
- **localStorage**
  — No backend required and persists between sessions, but adds state management complexity and data is per-device only.
- **Database (e.g. SQLite/PostgreSQL)**
  — Full persistence with the option for user accounts, but a significant scope increase for a requirement that explicitly excludes persistence.

**Decision:**
3–5 sample scripts are hardcoded as constants in the frontend. No database, no persistence layer.

**Consequences:**

- Zero backend complexity for script storage
- Scripts cannot be saved between sessions — acceptable per requirements
- Templates are not user-editable without a code change
- Saves significant scope in a 3–4 hour build
