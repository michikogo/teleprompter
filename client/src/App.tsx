import React, { useState } from "react";
import ScriptInput from "./components/ScriptInput";
import TeleprompterDisplay from "./components/TeleprompterDisplay";

type Mode = "input" | "reading";

const App = () => {
  const [mode, setMode] = useState<Mode>("input");
  const [script, setScript] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const handleStart = (scriptText: string) => {
    setScript(scriptText);
    setCurrentWordIndex(0);
    setMode("reading");
  };

  const handleReset = () => {
    setCurrentWordIndex(0);
  };

  const handleWordClick = (index: number) => {
    setCurrentWordIndex(index);
  };

  if (mode === "reading") {
    return (
      <TeleprompterDisplay
        scriptText={script}
        currentWordIndex={currentWordIndex}
        onWordClick={handleWordClick}
        onReset={handleReset}
        onBack={() => setMode("input")}
      />
    );
  }

  return <ScriptInput onStart={handleStart} />;
};

export default App;
