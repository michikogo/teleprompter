# Teleprompter

A real-time AI teleprompter that highlights the word you're currently speaking as you read a script aloud.

## Setup

1. Copy `.env.example` to `.env` and add your Deepgram API key
2. `npm install` at the repo root
3. `npm run dev` to start both the client and server

## Architecture

The browser captures mic audio at 16kHz, converts it to 16-bit PCM, and streams it over WebSocket to a Node server. The server proxies the raw audio to Deepgram's streaming API and forwards transcripts back to the browser.

As transcripts arrive (both interim and final), a fuzzy matcher using Levenshtein similarity scans forward through the script to find the best matching position and updates the highlight. The scan is forward-only to prevent the highlight from jumping backwards.

```
Browser mic → WebSocket → Node server → Deepgram
                                            ↓
Browser highlight ← WebSocket ← transcript JSON
```

## Docs

- [Design](docs/DESIGN.md) — design decisions, edge cases, and trade-offs
- [Reference](docs/REFERENCE.md) — UI controls and WebSocket API

## Known limitations

- **Latency**: Speech-to-Text has an inherent ~200–500ms delay. Interim results close most of that gap, though the highlight may still lag by a word or two at normal reading speed.
- **No WebSocket reconnection**: If the connection drops mid-session, the highlight freezes. A production version would auto-reconnect.
- **ScriptProcessorNode**: Deprecated in favor of AudioWorklet, but used here for broad browser support without needing a separately-served worklet file.
