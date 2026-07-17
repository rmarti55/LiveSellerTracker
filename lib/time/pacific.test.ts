import { describe, expect, it } from "vitest";
import {
  formatPacificHour,
  formatPacificHourShort,
  pacificHourFromTimestamp,
  pacificTimezoneAbbr,
} from "./pacific";

describe("pacificHourFromTimestamp", () => {
  it("maps UTC instants to Pacific wall-clock hour (PST)", () => {
    const ms = Date.UTC(2024, 0, 15, 17, 0, 0); // Jan 15 — PST
    expect(pacificHourFromTimestamp(ms)).toBe(9);
  });

  it("maps UTC instants to Pacific wall-clock hour (PDT)", () => {
    const ms = Date.UTC(2024, 6, 15, 17, 0, 0); // Jul 15 — PDT
    expect(pacificHourFromTimestamp(ms)).toBe(10);
  });
});

describe("pacificTimezoneAbbr", () => {
  it("returns PST in winter", () => {
    expect(pacificTimezoneAbbr(new Date(Date.UTC(2024, 0, 15, 12, 0, 0)))).toBe("PST");
  });

  it("returns PDT in summer", () => {
    expect(pacificTimezoneAbbr(new Date(Date.UTC(2024, 6, 15, 12, 0, 0)))).toBe("PDT");
  });
});

describe("formatPacificHour", () => {
  it("formats a bucket hour as 12h clock with tz abbr", () => {
    const ref = new Date(Date.UTC(2024, 6, 15, 12, 0, 0));
    expect(formatPacificHour(10, ref)).toBe("10:00 AM PDT");
  });
});

describe("formatPacificHourShort", () => {
  it("formats compact axis labels", () => {
    const ref = new Date(Date.UTC(2024, 6, 15, 12, 0, 0));
    expect(formatPacificHourShort(0, ref)).toBe("12a");
    expect(formatPacificHourShort(6, ref)).toBe("6a");
    expect(formatPacificHourShort(12, ref)).toBe("12p");
    expect(formatPacificHourShort(18, ref)).toBe("6p");
    expect(formatPacificHourShort(23, ref)).toBe("11p");
  });
});
