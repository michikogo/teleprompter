import { similarity } from "./levenshtein";

const WINDOW_SIZE = 10;
const LOOKAHEAD = 100;
const MATCH_THRESHOLD = 0.4;

const scoreWindow = (
  scriptWords: string[],
  transcriptWindow: string[],
  startIndex: number
): number => {
  if (transcriptWindow.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < transcriptWindow.length; i++) {
    const scriptWord = scriptWords[startIndex + i];
    if (!scriptWord) break;
    total += similarity(transcriptWindow[i], scriptWord);
  }

  return total / transcriptWindow.length;
};

export const findBestPosition = (
  scriptWords: string[],
  transcriptWords: string[],
  currentPosition: number
): number => {
  const window = transcriptWords.slice(-WINDOW_SIZE);
  if (window.length === 0) return currentPosition;

  let bestScore = MATCH_THRESHOLD;
  let bestStart = -1;

  const scanEnd = Math.min(
    currentPosition + LOOKAHEAD,
    scriptWords.length - window.length
  );

  for (let i = currentPosition; i <= scanEnd; i++) {
    const score = scoreWindow(scriptWords, window, i);
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }

  // no position exceeded the threshold — hold
  if (bestStart === -1) return currentPosition;

  // advance to the last word of the matched window
  return Math.min(bestStart + window.length - 1, scriptWords.length - 1);
};
