export type ScriptWord = {
  raw: string;
  normalized: string;
  index: number;
};

export const tokenizeScript = (text: string): ScriptWord[] => {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((raw, index) => ({
      raw,
      normalized: raw.toLowerCase().replace(/[^a-z0-9]/g, ""),
      index,
    }));
};

export const groupIntoLines = (
  words: ScriptWord[],
  wordsPerLine = 5
): ScriptWord[][] => {
  const lines: ScriptWord[][] = [];
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine));
  }
  return lines;
};
