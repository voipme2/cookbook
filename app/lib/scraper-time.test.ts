import { describe, it, expect } from "vitest";
import {
  parseTimeStringToMinutes,
  parseISODurationToMs,
} from "./scraper";

describe("parseTimeStringToMinutes", () => {
  it("parses hours and minutes correctly", () => {
    expect(parseTimeStringToMinutes("1 hr 30 min")).toBe(90);
    expect(parseTimeStringToMinutes("2 hr 15 min")).toBe(135);
    expect(parseTimeStringToMinutes("3 hr 45 min")).toBe(225);
  });

  it("parses hours only", () => {
    expect(parseTimeStringToMinutes("1 hr")).toBe(60);
    expect(parseTimeStringToMinutes("2 hrs")).toBe(120);
    expect(parseTimeStringToMinutes("5 hr")).toBe(300);
  });

  it("parses minutes only", () => {
    expect(parseTimeStringToMinutes("30 min")).toBe(30);
    expect(parseTimeStringToMinutes("15 mins")).toBe(15);
    expect(parseTimeStringToMinutes("5 min")).toBe(5);
  });

  it("handles case insensitivity", () => {
    expect(parseTimeStringToMinutes("1 HR 30 MIN")).toBe(90);
    expect(parseTimeStringToMinutes("2 Hr 15 Min")).toBe(135);
    expect(parseTimeStringToMinutes("3 HRS 45 MINS")).toBe(225);
  });

  it("handles decimal hours", () => {
    expect(parseTimeStringToMinutes("1.5 hrs")).toBe(90); // 1.5 * 60 = 90
    expect(parseTimeStringToMinutes("2.5 hr")).toBe(150); // 2.5 * 60 = 150
    expect(parseTimeStringToMinutes("0.5 hr")).toBe(30); // 0.5 * 60 = 30
  });

  it("handles decimal minutes", () => {
    expect(parseTimeStringToMinutes("30.5 min")).toBe(31); // Math.round(30.5) = 31
    expect(parseTimeStringToMinutes("15.7 mins")).toBe(16); // Math.round(15.7) = 16
  });

  it("handles extra whitespace", () => {
    expect(parseTimeStringToMinutes("  1   hr   30   min  ")).toBe(90);
    expect(parseTimeStringToMinutes("2hr15min")).toBe(135);
  });

  it("returns 0 for strings without time patterns", () => {
    expect(parseTimeStringToMinutes("")).toBe(0);
    expect(parseTimeStringToMinutes("invalid")).toBe(0);
    expect(parseTimeStringToMinutes("abc def")).toBe(0);
  });

  it("handles combined hours and minutes with decimals", () => {
    expect(parseTimeStringToMinutes("1.5 hr 30.5 min")).toBe(121); // 90 + 31 = 121
    expect(parseTimeStringToMinutes("2.25 hrs 15.7 mins")).toBe(151); // 135 + 16 = 151
  });
});

describe("parseISODurationToMs", () => {
  it("parses ISO duration with hours and minutes", () => {
    const result = parseISODurationToMs("PT1H30M");
    expect(result).toBe(90 * 60 * 1000); // 90 minutes in milliseconds
  });

  it("parses ISO duration with hours only", () => {
    const result = parseISODurationToMs("PT2H");
    expect(result).toBe(2 * 60 * 60 * 1000); // 2 hours in milliseconds
  });

  it("parses ISO duration with minutes only", () => {
    const result = parseISODurationToMs("PT45M");
    expect(result).toBe(45 * 60 * 1000); // 45 minutes in milliseconds
  });

  it("parses ISO duration with seconds", () => {
    const result = parseISODurationToMs("PT1H30M45S");
    expect(result).toBe((90 * 60 + 45) * 1000); // 90 minutes 45 seconds in milliseconds
  });

  it("parses ISO duration with decimal seconds", () => {
    const result = parseISODurationToMs("PT1H30M45.5S");
    expect(result).toBe((90 * 60 + 45.5) * 1000);
  });

  it("parses ISO duration with days", () => {
    const result = parseISODurationToMs("P1DT2H30M");
    // 1 day = 24 hours, plus 2 hours 30 minutes
    expect(result).toBe((24 * 60 + 2 * 60 + 30) * 60 * 1000);
  });

  it("parses ISO duration with months", () => {
    const result = parseISODurationToMs("P1M");
    // 1 month = 30 days (as per the function's logic)
    expect(result).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("parses ISO duration with years", () => {
    const result = parseISODurationToMs("P1Y");
    // 1 year = 365 days (as per the function's logic)
    expect(result).toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("parses complex ISO duration", () => {
    const result = parseISODurationToMs("P1Y2M3DT4H5M6S");
    const expected =
      365 * 24 * 60 * 60 * 1000 + // 1 year
      2 * 30 * 24 * 60 * 60 * 1000 + // 2 months
      3 * 24 * 60 * 60 * 1000 + // 3 days
      4 * 60 * 60 * 1000 + // 4 hours
      5 * 60 * 1000 + // 5 minutes
      6 * 1000; // 6 seconds
    expect(result).toBe(expected);
  });

  it("returns 0 for invalid ISO duration strings", () => {
    expect(parseISODurationToMs("")).toBe(0);
    expect(parseISODurationToMs("invalid")).toBe(0);
    expect(parseISODurationToMs("P")).toBe(0);
    expect(parseISODurationToMs("T1H")).toBe(0); // Missing P prefix
  });

  it("handles ISO duration with only time component", () => {
    const result = parseISODurationToMs("PT1H30M");
    expect(result).toBe(90 * 60 * 1000);
  });

  it("handles ISO duration with only date component", () => {
    const result = parseISODurationToMs("P1D");
    expect(result).toBe(24 * 60 * 60 * 1000);
  });

  it("handles empty time components", () => {
    const result = parseISODurationToMs("P1DT");
    expect(result).toBe(24 * 60 * 60 * 1000); // Just 1 day, no time
  });
});

