import { copy, currency, type Restaurant } from "@/constants/content";

/** $12.50 (or $25 with `short` for whole amounts). Negative amounts get a real minus sign. */
export function money(amount: number, short = false) {
  const sign = amount < 0 ? "−" : "";
  const value = Math.abs(amount);
  const digits = short && Number.isInteger(value) ? 0 : 2;
  return `${sign}${currency.symbol}${value.toFixed(digits)}`;
}

/** 7:42 PM */
export function clock(ms: number) {
  const date = new Date(ms);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours % 12 || 12}:${minutes} ${hours >= 12 ? copy.dates.pm : copy.dates.am}`;
}

/** Today, Yesterday or Mon, Oct 12. */
export function dayLabel(ms: number, now = Date.now()) {
  const day = (t: number) => {
    const d = new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const diff = Math.round((day(now) - day(ms)) / 86_400_000);
  if (diff === 0) return copy.dates.today;
  if (diff === 1) return copy.dates.yesterday;
  const date = new Date(ms);
  return `${copy.dates.weekdays[date.getDay()]}, ${copy.dates.months[date.getMonth()]} ${date.getDate()}`;
}

/** 20–30 min */
export function etaRange(restaurant: Pick<Restaurant, "etaMin" | "etaMax">, minus = 0) {
  return `${Math.max(5, restaurant.etaMin - minus)}–${Math.max(10, restaurant.etaMax - minus)} ${copy.common.min}`;
}

/** Fills {name} placeholders in a content string. */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** 1,240 */
export function thousands(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
