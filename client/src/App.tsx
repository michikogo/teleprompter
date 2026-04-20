import React, { useState } from "react";
import ScriptInput from "./components/ScriptInput";

type Mode = "input" | "reading";

const App = () => {
  const [mode, setMode] = useState<Mode>("input");
  const [script, setScript] = useState("");

  const handleStart = (scriptText: string) => {
    setScript(scriptText);
    setMode("reading");
  };

  if (mode === "reading") {
    return (
      <div className="teleprompter-placeholder">
        <p style={{ whiteSpace: "pre-wrap", padding: "2rem" }}>{script}</p>
        <button onClick={() => setMode("input")}>← Back</button>
      </div>
    );
  }

  return <ScriptInput onStart={handleStart} />;
};

export default App;
