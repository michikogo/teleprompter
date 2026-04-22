# Reference

## UI Controls

### Script input screen
| Control | Description |
|---|---|
| Text area | Paste or type your script |
| Template buttons | Load a sample script to get started quickly |
| Start button | Saves the script, requests mic permission, and switches to the teleprompter view |

### Teleprompter screen
| Control | Description |
|---|---|
| Word highlight | Yellow highlight on the current word, auto-scrolls to keep it centered |
| Click a word | Manually jump the highlight to that word |
| ● Listening / ○ Not listening | Live mic status indicator |
| Last heard | Preview of the most recent words Deepgram recognized |
| ↺ Reset | Resets the highlight to the start of the script without stopping the mic |
| ← Back | Stops the mic and returns to the script input screen |

## WebSocket API

The server listens on `ws://localhost:3001`.

### Client → Server
| Message | Type | Description |
|---|---|---|
| Audio chunk | Binary (Int16 PCM) | Raw audio at 16kHz mono, sent every ~256ms |

### Server → Client
| Message | Type | Description |
|---|---|---|
| Transcript | JSON string | Deepgram transcript response forwarded as-is — includes `is_final` flag and `channel.alternatives[0].transcript` |
