/**
 * Prices, option choices and bag totals. Everything is worked out on the
 * device from the menus in data/restaurants.ts and the fees in content.ts.
 */
import {
  deliveryOptions,
  fees,
  promoCodes,
  type DeliveryOptionId,
  type Dish,
  type OptionGroup,
  type Restaurant,
} from "@/constants/content";

/** Selected option ids per option group id. */
export type Choices = Record<string, string[]>;

const round = (n: number) => Math.round(n * 100) / 100;

export function unitPrice(dish: Dish, choices: Choices = {}) {
  let price = dish.price;
  for (const group of dish.groups ?? [])
    for (const id of choices[group.id] ?? []) price += group.options.find((o) => o.id === id)?.price ?? 0;
  return round(price);
}

/** "Double · Aged cheddar · Smoked bacon" */
export function choiceSummary(dish: Dish, choices: Choices = {}) {
  const labels: string[] = [];
  for (const group of dish.groups ?? [])
    for (const id of choices[group.id] ?? []) {
      const option = group.options.find((o) => o.id === id);
      if (option) labels.push(option.label);
    }
  return labels.join(" · ");
}

/** The first required group that still needs a choice, if any. */
export function missingGroup(dish: Dish, choices: Choices): OptionGroup | undefined {
  return (dish.groups ?? []).find((g) => (choices[g.id]?.length ?? 0) < g.min);
}

/** Taps an option: single-choice groups swap, multi-choice groups toggle up to `max`. */
export function toggleChoice(choices: Choices, group: OptionGroup, optionId: string): Choices {
  const current = choices[group.id] ?? [];
  if (group.max === 1) {
    const next = current[0] === optionId && group.min === 0 ? [] : [optionId];
    return { ...choices, [group.id]: next };
  }
  if (current.includes(optionId)) return { ...choices, [group.id]: current.filter((id) => id !== optionId) };
  if (current.length >= group.max) return choices;
  return { ...choices, [group.id]: [...current, optionId] };
}

export const sameChoices = (a: Choices, b: Choices) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    const x = [...(a[key] ?? [])].sort().join();
    const y = [...(b[key] ?? [])].sort().join();
    if (x !== y) return false;
  }
  return true;
};

export function findPromo(code: string | null | undefined) {
  if (!code) return undefined;
  const key = code.trim().toUpperCase();
  const promo = promoCodes[key];
  return promo ? { code: key, ...promo } : undefined;
}

export type Totals = {
  itemCount: number;
  subtotal: number;
  delivery: number;
  /** True when the restaurant's free-delivery threshold is met. */
  deliveryWaived: boolean;
  /** How much more unlocks free delivery (0 when none applies). */
  freeDeliveryGap: number;
  priority: number;
  service: number;
  smallOrder: number;
  tax: number;
  tip: number;
  discount: number;
  promoCode?: string;
  total: number;
};

export function computeTotals({
  restaurant,
  lines,
  tipRate,
  promoCode,
  deliveryOptionId = "standard",
}: {
  restaurant: Restaurant | undefined;
  lines: { dish: Dish; qty: number; choices: Choices }[];
  tipRate: number;
  promoCode?: string | null;
  deliveryOptionId?: DeliveryOptionId;
}): Totals {
  const subtotal = round(lines.reduce((sum, l) => sum + unitPrice(l.dish, l.choices) * l.qty, 0));
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const empty = itemCount === 0 || !restaurant;
  const threshold = restaurant?.freeDeliveryOver;
  const deliveryWaived = !empty && threshold !== undefined && subtotal >= threshold;
  const delivery = empty || deliveryWaived ? 0 : restaurant.deliveryFee;
  const freeDeliveryGap = !empty && threshold !== undefined && !deliveryWaived ? round(threshold - subtotal) : 0;
  const option = deliveryOptions.find((o) => o.id === deliveryOptionId);
  const priority = empty ? 0 : (option?.fee ?? 0);
  const service = empty ? 0 : round(Math.min(fees.serviceMax, Math.max(fees.serviceMin, subtotal * fees.serviceRate)));
  const smallOrder = !empty && subtotal < fees.smallOrderUnder ? fees.smallOrderFee : 0;
  const tax = round(subtotal * fees.taxRate);
  const tip = round(subtotal * tipRate);
  const promo = findPromo(promoCode);
  const discount = promo && !empty ? round(Math.min(promo.max, subtotal * promo.percent)) : 0;
  const total = round(subtotal + delivery + priority + service + smallOrder + tax + tip - discount);
  return {
    itemCount,
    subtotal,
    delivery,
    deliveryWaived,
    freeDeliveryGap,
    priority,
    service,
    smallOrder,
    tax,
    tip,
    discount,
    promoCode: promo && !empty ? promo.code : undefined,
    total: Math.max(0, total),
  };
}
