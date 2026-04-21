import { similarity } from "./levenshtein";

const LOOKAHEAD = 50;
const MATCH_THRESHOLD = 0.6;
// How many recent words to use as context for matching
const CONTEXT_WORDS = 3;

const scoreAtPosition = (
  scriptWords: string[],
  recentTranscript: string[],
  scriptPos: number
): number => {
  // Match the last transcript word against scriptWords[scriptPos],
  // then use up to CONTEXT_WORDS-1 preceding words to confirm.
  const lastWord = recentTranscript[recentTranscript.length - 1];
  let score = similarity(lastWord, scriptWords[scriptPos]);

  const contextLen = Math.min(recentTranscript.length - 1, CONTEXT_WORDS - 1);
  for (let c = 1; c <= contextLen; c++) {
    const tWord = recentTranscript[recentTranscript.length - 1 - c];
    const sWord = scriptWords[scriptPos - c];
    if (!sWord) break;
    score += similarity(tWord, sWord);
  }

  return score / (contextLen + 1);
};

export const findBestPosition = (
  scriptWords: string[],
  transcriptWords: string[],
  currentPosition: number
): number => {
  if (transcriptWords.length === 0) return currentPosition;

  const recent = transcriptWords.slice(-CONTEXT_WORDS);
  let bestScore = MATCH_THRESHOLD;
  let bestPos = currentPosition;

  const scanEnd = Math.min(
    currentPosition + LOOKAHEAD,
    scriptWords.length - 1
  );

  for (let i = currentPosition; i <= scanEnd; i++) {
    const score = scoreAtPosition(scriptWords, recent, i);
    if (score > bestScore) {
      bestScore = score;
      bestPos = i;
    }
  }

  return bestPos;
};
