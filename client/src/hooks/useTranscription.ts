import { useState, useRef, useCallback } from "react";

const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;
const SERVER_WS_URL = "ws://localhost:3001";

export type TranscriptionState = {
  isListening: boolean;
  transcriptWords: string[];
  error: string | null;
};

export const useTranscription = () => {
  const [state, setState] = useState<TranscriptionState>({
    isListening: false,
    transcriptWords: [],
    error: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    wsRef.current?.close();
    wsRef.current = null;

    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = audioCtx;

      const ws = new WebSocket(SERVER_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = audioCtx.createMediaStreamSource(stream);
        // ScriptProcessorNode is deprecated but has widest browser support
        // without requiring an AudioWorklet file served separately.
        const processor = audioCtx.createScriptProcessor(BUFFER_SIZE, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32 = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
          }
          ws.send(int16.buffer);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        setState((s) => ({ ...s, isListening: true, error: null }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const transcript: string | undefined =
            msg?.channel?.alternatives?.[0]?.transcript;
          if (!transcript || msg?.is_final === false) return;
          const newWords = transcript
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, "")
            .split(/\s+/)
            .filter(Boolean);
          if (newWords.length > 0) {
            setState((s) => ({
              ...s,
              transcriptWords: [...s.transcriptWords, ...newWords],
            }));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        setState((s) => ({
          ...s,
          error: "WebSocket error — is the server running?",
        }));
        stop();
      };

      ws.onclose = () => {
        setState((s) => ({ ...s, isListening: false }));
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Microphone access denied";
      setState((s) => ({ ...s, error: message }));
    }
  }, [stop]);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, transcriptWords: [] }));
  }, []);

  return { ...state, start, stop, reset };
};
