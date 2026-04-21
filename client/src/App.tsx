import React, { useState, useEffect } from "react";
import ScriptInput from "./components/ScriptInput";
import TeleprompterDisplay from "./components/TeleprompterDisplay";
import { useTranscription } from "./hooks/useTranscription";
import { tokenizeScript } from "./lib/scriptTokenizer";
import { findBestPosition } from "./lib/positionTracker";

type Mode = "input" | "reading";

const App = () => {
  const [mode, setMode] = useState<Mode>("input");
  const [script, setScript] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const { isListening, transcriptWords, interimWords, error, start, stop, reset } =
    useTranscription();

  const scriptWords = tokenizeScript(script).map((w) => w.normalized);
  const scriptWordsRef = React.useRef(scriptWords);
  useEffect(() => {
    scriptWordsRef.current = scriptWords;
  }, [scriptWords]);

  // Combine final + interim for real-time position tracking
  const allWords = [...transcriptWords, ...interimWords];

  useEffect(() => {
    if (allWords.length === 0) return;
    setCurrentWordIndex((prev) =>
      findBestPosition(scriptWordsRef.current, allWords, prev)
    );
  }, [allWords.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = (scriptText: string) => {
    setScript(scriptText);
    setCurrentWordIndex(0);
    reset();
    setMode("reading");
    start();
  };

  const handleReset = () => {
    setCurrentWordIndex(0);
    reset();
  };

  const handleBack = () => {
    stop();
    reset();
    setCurrentWordIndex(0);
    setMode("input");
  };

  const handleWordClick = (index: number) => {
    setCurrentWordIndex(index);
  };

  if (mode === "reading") {
    return (
      <>
        {error && <div className="error-banner">{error}</div>}
        <TeleprompterDisplay
          scriptText={script}
          currentWordIndex={currentWordIndex}
          isListening={isListening}
          lastHeard={allWords.slice(-5).join(" ")}
          onWordClick={handleWordClick}
          onReset={handleReset}
          onBack={handleBack}
        />
      </>
    );
  }

  return <ScriptInput onStart={handleStart} />;
};

export default App;
