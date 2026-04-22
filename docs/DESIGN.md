# Design

## How the highlight tracking works

Mic audio is captured at 16kHz, converted to 16-bit PCM, and streamed over WebSocket to a Node server, which proxies it to Deepgram's streaming API. As transcripts come back, a fuzzy matcher scans forward through the script to find the best matching position and moves the yellow highlight there in real time.

Deepgram returns both interim (in-progress) and final transcripts — combining both keeps the highlight responsive without waiting for a sentence to finish.

The position tracker uses Levenshtein similarity to score each candidate word in the script against the last few words you said. It scans forward only — never backward — to prevent the highlight from jumping back when a word later in a sentence sounds similar to something earlier in the script.

## Edge cases

- **Filler words / ad-libs**: The fuzzy matcher scans up to 50 words ahead so it recovers when you return to the script after going off it.
- **Accents / mispronunciations**: Levenshtein similarity handles approximate matches rather than requiring exact word matches.
- **Skipped words**: The forward-only scan means skipped words don't cause the highlight to stall — it advances to the best match ahead.
- **Manual repositioning**: Clicking any word jumps the highlight there, useful if the tracker drifts or you restart a sentence.

## Trade-offs

- **Latency**: Speech-to-Text has an inherent ~200–500ms delay. Interim results close most of that gap, though at normal reading speed the highlight may still lag by a word or two.
- **ScriptProcessorNode**: Deprecated in favor of AudioWorklet, but used here for broad browser support without needing a separately-served worklet file.
- **No WebSocket reconnection**: If the connection drops mid-session the highlight freezes. A production version would auto-reconnect.
- **Scalability**: Each session is a stateless, independent WebSocket connection — horizontal scaling behind a load balancer is straightforward with no shared state to coordinate.
- **Availability**: Deepgram is a single external dependency. A fallback to the browser-native Web Speech API would improve resilience at the cost of accuracy.
