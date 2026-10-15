/** Where a delivery is, worked out from the time since it was placed (see `tracking` in content.ts). */
import { useEffect, useState } from "react";
import { tracking } from "@/constants/content";

const steps = tracking.steps;
const last = steps[steps.length - 1];
export const DEMO_SECONDS = last?.after ?? 60;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

export type TrackState = {
  /** Index into tracking.steps. */
  index: number;
  delivered: boolean;
  /** 0..1 across the whole journey. */
  progress: number;
  /** 0..1 along the ride from the restaurant to the door. */
  ride: number;
  /** The courier has the food. */
  pickedUp: boolean;
};

export function trackOrder(placedAt: number, now: number): TrackState {
  const elapsed = Math.max(0, (now - placedAt) / 1000);
  let index = 0;
  steps.forEach((step, i) => {
    if (elapsed >= step.after) index = i;
  });
  const pickup = steps.find((s) => s.key === "pickedUp")?.after ?? 0;
  const rideStart = steps.find((s) => s.key === "onTheWay")?.after ?? pickup;
  return {
    index,
    delivered: index === steps.length - 1,
    progress: clamp(elapsed / DEMO_SECONDS),
    ride: clamp((elapsed - rideStart) / Math.max(1, DEMO_SECONDS - rideStart)),
    pickedUp: elapsed >= pickup,
  };
}

/** The current time, refreshed every `interval` ms while `active`. */
export function useNow(active = true, interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [active, interval]);
  return now;
}
