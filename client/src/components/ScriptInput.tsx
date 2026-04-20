import React, { useState } from "react";
import { sampleScripts } from "../data/sampleScripts";

type Props = {
  onStart: (scriptText: string) => void;
};

const ScriptInput = ({ onStart }: Props) => {
  const [text, setText] = useState("");

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sampleScripts.find((s) => s.title === e.target.value);
    if (selected) setText(selected.text);
  };

  return (
    <div className="script-input">
      <h1>Teleprompter</h1>

      <div className="template-row">
        <label htmlFor="template-select">Load a sample script</label>
        <select id="template-select" onChange={handleTemplateChange}>
          <option value="">— choose a template —</option>
          {sampleScripts.map((s) => (
            <option key={s.title} value={s.title}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your script here…"
        rows={12}
      />

      <button
        onClick={() => onStart(text.trim())}
        disabled={text.trim().length === 0}
      >
        Read Back Script
      </button>
    </div>
  );
};

export default ScriptInput;
