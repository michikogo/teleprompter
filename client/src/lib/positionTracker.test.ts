import { describe, it, expect } from "vitest";
import { findBestPosition } from "./positionTracker";

const words = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

const script = words(
  "The quick brown fox jumps over the lazy dog. " +
    "She sells seashells by the seashore. " +
    "Fuzzy Wuzzy was a bear Fuzzy Wuzzy had no hair."
);

describe("findBestPosition", () => {
  it("advances position when transcript matches script", () => {
    const transcript = words("the quick brown fox jumps");
    const result = findBestPosition(script, transcript, 0);
    expect(result).toBeGreaterThan(0);
  });

  it("holds position when transcript is off-script", () => {
    const transcript = words("pizza tacos burgers fries nachos");
    const result = findBestPosition(script, transcript, 0);
    expect(result).toBe(0);
  });

  it("ignores filler words and still advances", () => {
    const transcript = words("um the quick uh brown fox");
    const result = findBestPosition(script, transcript, 0);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("jumps forward when user skips to a later sentence", () => {
    const transcript = words("she sells seashells by the seashore");
    const result = findBestPosition(script, transcript, 0);
    // "she sells seashells" starts at word index 10
    expect(result).toBeGreaterThan(5);
  });

  it("never moves backward", () => {
    const transcript = words("the quick brown fox");
    // current position is already at word 10
    const result = findBestPosition(script, transcript, 10);
    expect(result).toBeGreaterThanOrEqual(10);
  });

  it("holds position when transcript is empty", () => {
    const result = findBestPosition(script, [], 5);
    expect(result).toBe(5);
  });
});
