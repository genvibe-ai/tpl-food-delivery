import { Easing } from "react-native-reanimated";

/** Shared motion: quick, soft and springy. Reanimated skips these when Reduce Motion is on. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const SPRING = { damping: 20, stiffness: 220, mass: 0.9 };
export const SNAP = { damping: 26, stiffness: 320, mass: 0.7 };
export const SHEET = { damping: 28, stiffness: 260, mass: 0.9 };
