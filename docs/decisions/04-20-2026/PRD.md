# AI Teleprompter — Product Requirements Document

## Overview

A web app that displays a script in large text and auto-scrolls as the user reads it aloud, driven by real-time speech transcription. The teleprompter handles natural speech imperfections: filler words, rephrasing, skipped sentences, and going off-script.

---

## Goals

- Low-latency scroll that keeps up with normal speaking pace
- Robust position tracking that survives off-script moments
- Simple, distraction-free UI optimized for reading

---

## User Stories

**US-001 — Reading a script**
As a speaker, I want to paste my script and have it displayed in large text that scrolls automatically as I read, so that I can maintain eye contact with the camera instead of looking down at notes.

**US-002 — Going off-script**
As a speaker, I want the teleprompter to hold its position when I ad-lib or rephrase, and resume tracking when I return to the script, so that improvising doesn't cause the display to jump around.

**US-003 — Skipping ahead**
As a speaker, I want the teleprompter to advance automatically when I skip a sentence or paragraph, so that I don't have to manually scroll when I jump ahead intentionally.

**US-004 — Restarting**
As a speaker, I want a reset button that returns the display to the top of the script, so that I can restart a take without reloading the page.

**US-005 — Manual repositioning**
As a speaker, I want to tap a line in the script to manually set the scroll position, so that I can recover quickly if the tracking falls out of sync.

**US-006 — Using a sample script**
As a first-time user, I want to select from pre-loaded sample scripts, so that I can try the teleprompter without writing my own content first.

---

## Core Requirements

### Script Input

- Text area to type or paste a script
- 3–5 hardcoded sample script templates selectable from a dropdown (no DB needed)
- "Read Back Script" button to enter teleprompter mode

### Teleprompter Display

- Large text, ~5 words per line
- Max ~4 lines visible at once (prevents excessive vertical eye movement)
- Current line/word highlighted
- Smooth scroll animation (no instant jumps)

### Speech Transcription

- Real-time streaming via Deepgram WebSocket (Nova-3 model)
- API key proxied through a lightweight Node/Express backend (never exposed to client)
- Transcription begins on "Read Back Script" button press

### Position Tracking (Fuzzy Follow)

- Sliding window: take last N transcript words, find best matching position in script
- Token overlap scoring with Levenshtein distance for fuzzy word matching
- **Forward-only constraint**: position never moves backward automatically
- **Lookahead window**: scan ahead in script to detect intentional sentence skips
- When off-script: hold current position until transcript re-aligns with script
- When user skips ahead: advance to highest-scoring forward match

### Manual Controls

- **Reset button**: returns position to top of script (handles user wanting to restart)
- Click-to-reposition: user can tap a line to manually set scroll position

---

## Nice to Have

- Smooth scroll animation through skipped content (vs. instant jump)
- Confidence indicator showing how well transcript matches current position

---

## Non-Functional Requirements

- **Latency**: transcription round-trip must complete within ~500ms to keep up with speech
- **Accent handling**: Deepgram Nova-3 chosen specifically for better accent robustness
- **Browser support**: modern Chrome/Safari (Web Speech API fallback not required)
- **No persistence**: scripts are ephemeral, no database

---

## Design Decisions

**Display layout — ~5 words per line, ~4 lines visible**
Matches broadcast teleprompter conventions. Constraining line width and visible area reduces vertical eye movement, keeping the reader's gaze centered on the camera. The tradeoff is less script visible at once, which is acceptable given the UX goal.

**Scroll behavior — smooth animation over instant jump**
When the tracked position advances (especially on a sentence skip), the display animates to the new position rather than jumping instantly. Instant jumps are visually jarring and make it hard to re-orient. Smooth scroll is low-effort via CSS `scroll-behavior: smooth` or `scrollIntoView`.

---

## Known Limitations

- Thick accents may reduce transcription accuracy; no phonetic matching (Soundex) in scope
- Auto-detecting "user wants to restart" from speech alone is out of scope; manual reset handles this
- Very repetitive scripts (e.g. "Peter Piper") are a worst-case for position tracking

---

## Out of Scope

- User accounts / authentication
- Script persistence / database
- Phonetic matching (Soundex/Metaphone)
- Fixed-pace scrolling mode
- Pause-and-wait on off-script behavior
- Deployment (local dev only for submission)
