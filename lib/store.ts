/**
 * App state: delivery address, bag, checkout choices, orders and favourites.
 * Saved on the device with AsyncStorage (localStorage on the web), so the
 * bag survives an app restart. Sample orders come from content.ts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addresses,
  defaultTipRate,
  paymentMethods,
  sampleOrders,
  tracking,
  type Address,
  type DeliveryOptionId,
} from "@/constants/content";
import { getDish, getRestaurant } from "./catalog";
import { choiceSummary, computeTotals, sameChoices, unitPrice, type Choices, type Totals } from "./pricing";

export type BagLine = { id: string; dishId: string; qty: number; choices: Choices; note?: string };

export type OrderLine = {
  dishId: string;
  name: string;
  qty: number;
  choices: Choices;
  summary: string;
  total: number;
  note?: string;
};

export type Order = {
  id: string;
  number: string;
  restaurantId: string;
  lines: OrderLine[];
  totals: Totals;
  placedAt: number;
  /** Promised arrival, shown as "Arriving by". */
  etaAt: number;
  deliveredAt: number;
  address: Address;
  paymentId: string;
  deliveryOptionId: DeliveryOptionId;
  dropoff: Dropoff;
  rating?: number;
  /** Came from data/orders.ts. */
  sample?: boolean;
};

export type Dropoff = "door" | "hand";

type State = {
  onboarded: boolean;
  address: Address;
  bag: { restaurantId: string | null; lines: BagLine[] };
  promoCode: string | null;
  tipRate: number;
  deliveryOptionId: DeliveryOptionId;
  /** Start of the chosen slot when delivery is scheduled. */
  scheduleAt: number | null;
  dropoff: Dropoff;
  courierNote: string;
  paymentId: string;
  orders: Order[];
  favourites: string[];
  recentSearches: string[];
  notifications: boolean;
  sampleKey: string;
};

type Actions = {
  finishOnboarding: () => void;
  setAddress: (address: Address) => void;
  /** Adds a dish to the bag; starts a new bag when it is from another restaurant. */
  addToBag: (restaurantId: string, line: Omit<BagLine, "id">) => void;
  setQty: (lineId: string, qty: number) => void;
  clearBag: () => void;
  setPromo: (code: string | null) => void;
  setTipRate: (rate: number) => void;
  setDelivery: (id: DeliveryOptionId, scheduleAt?: number | null) => void;
  setDropoff: (dropoff: Dropoff) => void;
  setCourierNote: (note: string) => void;
  setPayment: (id: string) => void;
  /** Turns the bag into an order and returns its id. */
  placeOrder: () => string | null;
  rateOrder: (id: string, stars: number) => void;
  /** Adds a past order's dishes to the bag (a bag from another restaurant is replaced). */
  reorder: (orderId: string) => boolean;
  toggleFavourite: (restaurantId: string) => boolean;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  setNotifications: (on: boolean) => void;
  resetDemo: () => void;
};

const newId = () => Math.random().toString(36).slice(2, 10);
const DEMO_SECONDS = tracking.steps[tracking.steps.length - 1]?.after ?? 60;

/** Changes whenever data/orders.ts changes, so the sample history refreshes. */
const SAMPLE_KEY = (() => {
  const text = JSON.stringify(sampleOrders);
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return String(hash);
})();

function orderLines(restaurantId: string, lines: Omit<BagLine, "id">[]) {
  const result: { line: OrderLine; dish: NonNullable<ReturnType<typeof getDish>> }[] = [];
  for (const l of lines) {
    const dish = getDish(restaurantId, l.dishId);
    if (!dish) continue;
    result.push({
      dish,
      line: {
        dishId: l.dishId,
        name: dish.name,
        qty: l.qty,
        choices: l.choices,
        summary: choiceSummary(dish, l.choices),
        total: Math.round(unitPrice(dish, l.choices) * l.qty * 100) / 100,
        note: l.note,
      },
    });
  }
  return result;
}

function buildSampleOrders(now = Date.now()): Order[] {
  return sampleOrders.flatMap((spec, i) => {
    const restaurant = getRestaurant(spec.restaurantId);
    if (!restaurant) return [];
    const lines = orderLines(spec.restaurantId, spec.lines.map((l) => ({ ...l, choices: l.choices ?? {} })));
    const day = new Date(now - spec.daysAgo * 86_400_000);
    const placedAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), spec.at[0], spec.at[1]).getTime();
    const totals = computeTotals({
      restaurant,
      lines: lines.map(({ dish, line }) => ({ dish, qty: line.qty, choices: line.choices })),
      tipRate: spec.tipRate,
    });
    return [
      {
        id: `sample-${i}`,
        number: `#${4817 - i * 163}`,
        restaurantId: restaurant.id,
        lines: lines.map((l) => l.line),
        totals,
        placedAt,
        etaAt: placedAt + restaurant.etaMax * 60_000,
        deliveredAt: placedAt + (restaurant.etaMin + 4) * 60_000,
        address: addresses.saved[0],
        paymentId: paymentMethods[0]?.id ?? "card",
        deliveryOptionId: "standard" as const,
        dropoff: "door" as const,
        rating: spec.rating,
        sample: true,
      },
    ];
  });
}

const initialState = (): State => ({
  onboarded: false,
  address: addresses.saved[0],
  bag: { restaurantId: null, lines: [] },
  promoCode: null,
  tipRate: defaultTipRate,
  deliveryOptionId: "standard",
  scheduleAt: null,
  dropoff: "door",
  courierNote: addresses.saved[0]?.note ?? "",
  paymentId: paymentMethods[0]?.id ?? "card",
  orders: buildSampleOrders(),
  favourites: ["kumo-ramen", "ember-dough"],
  recentSearches: ["Ramen", "Tacos"],
  notifications: true,
  sampleKey: SAMPLE_KEY,
});

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState(),

      finishOnboarding: () => set({ onboarded: true }),

      setAddress: (address) => set({ address, courierNote: address.note ?? "" }),

      addToBag: (restaurantId, line) =>
        set((state) => {
          const fresh = state.bag.restaurantId !== restaurantId;
          const lines = fresh ? [] : state.bag.lines;
          const same = lines.find(
            (l) => l.dishId === line.dishId && (l.note ?? "") === (line.note ?? "") && sameChoices(l.choices, line.choices),
          );
          const next = same
            ? lines.map((l) => (l === same ? { ...l, qty: Math.min(99, l.qty + line.qty) } : l))
            : [...lines, { ...line, id: newId() }];
          return { bag: { restaurantId, lines: next } };
        }),

      setQty: (lineId, qty) =>
        set((state) => {
          const lines =
            qty <= 0
              ? state.bag.lines.filter((l) => l.id !== lineId)
              : state.bag.lines.map((l) => (l.id === lineId ? { ...l, qty: Math.min(99, qty) } : l));
          return { bag: { restaurantId: lines.length ? state.bag.restaurantId : null, lines } };
        }),

      clearBag: () => set({ bag: { restaurantId: null, lines: [] } }),

      setPromo: (promoCode) => set({ promoCode }),
      setTipRate: (tipRate) => set({ tipRate }),
      setDelivery: (deliveryOptionId, scheduleAt = null) => set({ deliveryOptionId, scheduleAt }),
      setDropoff: (dropoff) => set({ dropoff }),
      setCourierNote: (courierNote) => set({ courierNote }),
      setPayment: (paymentId) => set({ paymentId }),

      placeOrder: () => {
        const state = get();
        const restaurant = getRestaurant(state.bag.restaurantId);
        if (!restaurant || state.bag.lines.length === 0) return null;
        const lines = orderLines(restaurant.id, state.bag.lines);
        if (lines.length === 0) return null;
        const totals = computeTotals({
          restaurant,
          lines: lines.map(({ dish, line }) => ({ dish, qty: line.qty, choices: line.choices })),
          tipRate: state.tipRate,
          promoCode: state.promoCode,
          deliveryOptionId: state.deliveryOptionId,
        });
        const now = Date.now();
        const minutes = state.deliveryOptionId === "priority" ? restaurant.etaMax - 10 : restaurant.etaMax;
        const etaAt =
          state.deliveryOptionId === "schedule" && state.scheduleAt ? state.scheduleAt : now + minutes * 60_000;
        const order: Order = {
          id: newId(),
          number: `#${4900 + Math.floor(Math.random() * 900)}`,
          restaurantId: restaurant.id,
          lines: lines.map((l) => l.line),
          totals,
          placedAt: now,
          etaAt,
          deliveredAt: now + DEMO_SECONDS * 1000,
          address: { ...state.address, note: state.courierNote || undefined },
          paymentId: state.paymentId,
          deliveryOptionId: state.deliveryOptionId,
          dropoff: state.dropoff,
        };
        set({
          orders: [order, ...state.orders],
          bag: { restaurantId: null, lines: [] },
          promoCode: totals.promoCode ? null : state.promoCode,
          deliveryOptionId: "standard",
          scheduleAt: null,
        });
        return order.id;
      },

      rateOrder: (id, stars) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, rating: stars } : o)) })),

      reorder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order || !getRestaurant(order.restaurantId)) return false;
        const lines = order.lines.filter((l) => getDish(order.restaurantId, l.dishId));
        if (lines.length === 0) return false;
        for (const l of lines)
          get().addToBag(order.restaurantId, { dishId: l.dishId, qty: l.qty, choices: l.choices, note: l.note });
        return true;
      },

      toggleFavourite: (restaurantId) => {
        const has = get().favourites.includes(restaurantId);
        set((s) => ({
          favourites: has ? s.favourites.filter((id) => id !== restaurantId) : [...s.favourites, restaurantId],
        }));
        return !has;
      },

      addRecentSearch: (term) =>
        set((s) => {
          const clean = term.trim();
          if (!clean) return s;
          const rest = s.recentSearches.filter((t) => t.toLowerCase() !== clean.toLowerCase());
          return { recentSearches: [clean, ...rest].slice(0, 6) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setNotifications: (notifications) => set({ notifications }),

      resetDemo: () => set(initialState()),
    }),
    {
      name: "spoonlet-state",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({
        onboarded,
        address,
        bag,
        promoCode,
        tipRate,
        deliveryOptionId,
        scheduleAt,
        dropoff,
        courierNote,
        paymentId,
        orders,
        favourites,
        recentSearches,
        notifications,
        sampleKey,
      }) => ({
        onboarded,
        address,
        bag,
        promoCode,
        tipRate,
        deliveryOptionId,
        scheduleAt,
        dropoff,
        courierNote,
        paymentId,
        orders,
        favourites,
        recentSearches,
        notifications,
        sampleKey,
      }),
      // Refresh the sample history when data/orders.ts changes; keep real orders.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<State>;
        const merged = { ...current, ...saved };
        if (saved.sampleKey !== SAMPLE_KEY) {
          const own = (saved.orders ?? []).filter((o) => !o.sample);
          merged.orders = [...own, ...buildSampleOrders()].sort((a, b) => b.placedAt - a.placedAt);
          merged.sampleKey = SAMPLE_KEY;
        }
        return merged;
      },
    },
  ),
);

/** True once the saved state has been read from storage. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useStore.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}

/** Bag lines joined with their dishes (lines whose dish is gone are skipped). */
export function useBag() {
  const bag = useStore((s) => s.bag);
  const restaurant = getRestaurant(bag.restaurantId);
  const lines = restaurant
    ? bag.lines.flatMap((line) => {
        const dish = getDish(restaurant.id, line.dishId);
        return dish ? [{ ...line, dish }] : [];
      })
    : [];
  return { restaurant, lines, count: lines.reduce((n, l) => n + l.qty, 0) };
}

/** Totals for the current bag with the chosen tip, promo and delivery option. */
export function useBagTotals() {
  const { restaurant, lines } = useBag();
  const tipRate = useStore((s) => s.tipRate);
  const promoCode = useStore((s) => s.promoCode);
  const deliveryOptionId = useStore((s) => s.deliveryOptionId);
  return computeTotals({ restaurant, lines, tipRate, promoCode, deliveryOptionId });
}
