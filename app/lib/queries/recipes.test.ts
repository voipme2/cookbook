import { describe, it, expect } from "vitest";
import { convertToDuration, convertToMinutes } from "./recipes";

describe("convertToDuration", () => {
  it("converts minutes to hours and minutes format", () => {
    expect(convertToDuration(90)).toBe("1 hr 30 min");
    expect(convertToDuration(150)).toBe("2 hr 30 min");
    expect(convertToDuration(75)).toBe("1 hr 15 min");
  });

  it("returns only hours when minutes is exactly divisible by 60", () => {
    expect(convertToDuration(60)).toBe("1 hr");
    expect(convertToDuration(120)).toBe("2 hr");
    expect(convertToDuration(180)).toBe("3 hr");
  });

  it("returns only minutes when less than 60", () => {
    expect(convertToDuration(30)).toBe("30 min");
    expect(convertToDuration(15)).toBe("15 min");
    expect(convertToDuration(5)).toBe("5 min");
    expect(convertToDuration(1)).toBe("1 min");
  });

  it("returns empty string for zero or falsy values", () => {
    expect(convertToDuration(0)).toBe("");
    expect(convertToDuration(0 as any)).toBe("");
  });

  it("handles large values correctly", () => {
    expect(convertToDuration(1440)).toBe("24 hr"); // 24 hours
    expect(convertToDuration(1500)).toBe("25 hr"); // 25 hours
    expect(convertToDuration(1445)).toBe("24 hr 5 min");
  });

  it("handles fractional minutes correctly", () => {
    // Minutes are calculated using modulo, so fractional minutes are preserved
    expect(convertToDuration(90.5)).toBe("1 hr 30.5 min");
    // Test that fractional minutes are included (exact value may vary due to floating point)
    const result = convertToDuration(90.9);
    expect(result).toContain("1 hr");
    expect(result).toContain("min");
    expect(result).toMatch(/30\./); // Contains fractional part
  });
});

describe("convertToMinutes", () => {
  it("converts hours and minutes format to minutes", () => {
    expect(convertToMinutes("1 hr 30 min")).toBe(90);
    expect(convertToMinutes("2 hr 15 min")).toBe(135);
    expect(convertToMinutes("3 hr 45 min")).toBe(225);
  });

  it("handles hours only", () => {
    expect(convertToMinutes("1 hr")).toBe(60);
    expect(convertToMinutes("2 hr")).toBe(120);
    expect(convertToMinutes("5 hr")).toBe(300);
  });

  it("handles minutes only", () => {
    expect(convertToMinutes("30 min")).toBe(30);
    expect(convertToMinutes("15 min")).toBe(15);
    expect(convertToMinutes("5 min")).toBe(5);
  });

  it("handles abbreviated forms", () => {
    expect(convertToMinutes("1 h 30 m")).toBe(90);
    expect(convertToMinutes("2h 15m")).toBe(135);
    expect(convertToMinutes("3h")).toBe(180);
    expect(convertToMinutes("45m")).toBe(45);
  });

  it("handles case insensitivity", () => {
    expect(convertToMinutes("1 HR 30 MIN")).toBe(90);
    expect(convertToMinutes("2 Hr 15 Min")).toBe(135);
  });

  it("handles extra whitespace", () => {
    expect(convertToMinutes("  1   hr   30   min  ")).toBe(90);
    expect(convertToMinutes("2hr15min")).toBe(135);
  });

  it("returns number as-is when given a number", () => {
    expect(convertToMinutes(90)).toBe(90);
    expect(convertToMinutes(0)).toBe(0);
    expect(convertToMinutes(150)).toBe(150);
  });

  it("returns 0 for empty or falsy values", () => {
    expect(convertToMinutes("")).toBe(0);
    expect(convertToMinutes(null as any)).toBe(0);
    expect(convertToMinutes(undefined as any)).toBe(0);
  });

  it("handles invalid strings gracefully", () => {
    // Should return 0 for strings that don't match the pattern
    expect(convertToMinutes("invalid")).toBe(0);
    expect(convertToMinutes("abc def")).toBe(0);
  });

  it("handles multiple hour/minute matches correctly", () => {
    // The regex uses global flag, so it matches all occurrences
    // "1 hr 2 hr 30 min" matches both "1 hr" and "2 hr", so it adds both
    expect(convertToMinutes("1 hr 2 hr 30 min")).toBe(210); // 1*60 + 2*60 + 30 = 210
  });

  it("handles large values", () => {
    expect(convertToMinutes("24 hr")).toBe(1440);
    expect(convertToMinutes("25 hr 30 min")).toBe(1530);
  });
});

describe("convertToDuration and convertToMinutes roundtrip", () => {
  it("converts back and forth correctly for common values", () => {
    const testCases = [
      { minutes: 30, expected: "30 min" },
      { minutes: 60, expected: "1 hr" },
      { minutes: 90, expected: "1 hr 30 min" },
      { minutes: 120, expected: "2 hr" },
      { minutes: 150, expected: "2 hr 30 min" },
    ];

    testCases.forEach(({ minutes, expected }) => {
      const duration = convertToDuration(minutes);
      expect(duration).toBe(expected);
      
      // Convert back to minutes
      const backToMinutes = convertToMinutes(duration);
      expect(backToMinutes).toBe(minutes);
    });
  });
});

