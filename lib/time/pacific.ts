export const DISPLAY_TIMEZONE = "America/Los_Angeles";
export const PACIFIC_TIME_LABEL = "Pacific Time";

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DISPLAY_TIMEZONE,
  hour: "numeric",
  hour12: false,
});

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DISPLAY_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const tzAbbrFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: DISPLAY_TIMEZONE,
  timeZoneName: "short",
});

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

/** Map a Pacific wall-clock hour (0–23) to a UTC instant for formatting (avoids DST edge cases). */
function dateForPacificHour(hour: number, ref = new Date()): Date {
  const y = ref.getUTCFullYear();
  const m = ref.getUTCMonth();
  const d = ref.getUTCDate();
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const candidate = new Date(Date.UTC(y, m, d, utcHour, 0, 0));
    if (pacificHourFromTimestamp(candidate.getTime()) === hour) {
      return candidate;
    }
  }
  return new Date(Date.UTC(y, m, d, 12, 0, 0));
}

/** Extract 0–23 hour-of-day in Pacific Time from an epoch-ms timestamp. */
export function pacificHourFromTimestamp(ms: number): number {
  const hour = Number(partValue(hourFormatter.formatToParts(new Date(ms)), "hour"));
  return hour === 24 ? 0 : hour;
}

/** Short timezone abbreviation for Pacific (PST or PDT depending on date). */
export function pacificTimezoneAbbr(date = new Date()): string {
  return partValue(tzAbbrFormatter.formatToParts(date), "timeZoneName") || "PT";
}

/** Seller-friendly clock label, e.g. "10:00 AM PT". */
export function formatPacificHour(hour: number, ref = new Date()): string {
  const parts = clockFormatter.formatToParts(dateForPacificHour(hour, ref));
  const clock = `${partValue(parts, "hour")}:${partValue(parts, "minute")} ${partValue(parts, "dayPeriod")}`;
  return `${clock} ${pacificTimezoneAbbr(dateForPacificHour(hour, ref))}`;
}

/** Compact chart axis label, e.g. "12a", "6p". */
export function formatPacificHourShort(hour: number, ref = new Date()): string {
  const parts = clockFormatter.formatToParts(dateForPacificHour(hour, ref));
  const h = partValue(parts, "hour");
  const period = partValue(parts, "dayPeriod").charAt(0).toLowerCase();
  return `${h}${period}`;
}
