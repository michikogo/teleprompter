import React, { useEffect, useRef } from "react";
import { tokenizeScript, groupIntoLines } from "../lib/scriptTokenizer";

type Props = {
  scriptText: string;
  currentWordIndex: number;
  isListening: boolean;
  lastHeard: string;
  onWordClick: (index: number) => void;
  onReset: () => void;
  onBack: () => void;
};

const TeleprompterDisplay = ({
  scriptText,
  currentWordIndex,
  isListening,
  lastHeard,
  onWordClick,
  onReset,
  onBack,
}: Props) => {
  const activeLineRef = useRef<HTMLDivElement>(null);
  const words = tokenizeScript(scriptText);
  const lines = groupIntoLines(words);

  useEffect(() => {
    activeLineRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentWordIndex]);

  return (
    <div className="teleprompter">
      <div className="teleprompter-scroll">
        {lines.map((line, lineIndex) => {
          const isActiveLine = line.some((w) => w.index === currentWordIndex);
          return (
            <div
              key={lineIndex}
              className={`teleprompter-line${isActiveLine ? " active-line" : ""}`}
              ref={isActiveLine ? activeLineRef : null}
            >
              {line.map((word) => (
                <span
                  key={word.index}
                  className={`teleprompter-word${word.index === currentWordIndex ? " active-word" : ""}`}
                  onClick={() => onWordClick(word.index)}
                >
                  {word.raw}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div className="teleprompter-controls">
        <button onClick={onBack}>← Back</button>
        <div className="controls-right">
          <span className={`mic-indicator${isListening ? " active" : ""}`}>
            {isListening ? "● Listening" : "○ Not listening"}
          </span>
          {lastHeard && (
            <span className="last-heard">heard: "{lastHeard}"</span>
          )}
          <button onClick={onReset}>↺ Reset</button>
        </div>
      </div>
    </div>
  );
};

export default TeleprompterDisplay;
