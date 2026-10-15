/**
 * Past orders the app starts with (Orders tab and "Order again" on Home).
 * Re-exported from constants/content.ts. Totals are worked out from the
 * menus in data/restaurants.ts, so prices always match.
 */
export type SampleOrderSpec = {
  restaurantId: string;
  /** How long ago it was delivered. */
  daysAgo: number;
  /** Local time it was placed, 24h. */
  at: [hour: number, minute: number];
  lines: { dishId: string; qty: number; choices?: Record<string, string[]> }[];
  tipRate: number;
  /** Stars the customer gave, if any. */
  rating?: number;
};

export const sampleOrderSpecs: SampleOrderSpec[] = [
  {
    restaurantId: "kumo-ramen",
    daysAgo: 2,
    at: [19, 24],
    lines: [
      { dishId: "tonkotsu", qty: 2, choices: { broth: ["rich"], noodles: ["firm"], toppings: ["egg"] } },
      { dishId: "gyoza", qty: 1 },
    ],
    tipRate: 0.15,
    rating: 5,
  },
  {
    restaurantId: "patty-club",
    daysAgo: 5,
    at: [13, 2],
    lines: [
      { dishId: "classic-smash", qty: 1, choices: { patties: ["double"], cheese: ["cheddar"], extras: ["bacon"] } },
      { dishId: "fries", qty: 1 },
      { dishId: "vanilla-shake", qty: 1, choices: { size: ["regular"] } },
    ],
    tipRate: 0.15,
  },
  {
    restaurantId: "greenfold",
    daysAgo: 9,
    at: [12, 41],
    lines: [
      { dishId: "salmon-poke", qty: 1, choices: { base: ["half"], extras: ["avocado"] } },
      { dishId: "pitaya-bowl", qty: 1 },
    ],
    tipRate: 0.1,
    rating: 4,
  },
  {
    restaurantId: "ember-dough",
    daysAgo: 16,
    at: [20, 5],
    lines: [
      { dishId: "margherita", qty: 1, choices: { size: ["16"], crust: ["classic"], toppings: ["burrata"] } },
      { dishId: "cheesecake", qty: 2 },
    ],
    tipRate: 0.2,
    rating: 5,
  },
];
