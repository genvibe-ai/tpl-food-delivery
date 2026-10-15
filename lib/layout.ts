import { Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "./store";

/** On wide web screens the app sits in a phone-width column (components/AppFrame.tsx). */
export const FRAME_MAX = 480;
export const GUTTER = 20;
export const TAB_BAR_HEIGHT = 64;
export const BAG_BAR_HEIGHT = 60;

export function useAppWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" ? Math.min(width, FRAME_MAX) : width;
}

/** Distance from the bottom of the screen to the top of the floating tab bar. */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + TAB_BAR_HEIGHT;
}

/** Bottom padding for scrolling tab screens so content clears the tab bar and bag bar. */
export function useTabScreenPadding() {
  const bar = useTabBarSpace();
  const hasBag = useStore((s) => s.bag.lines.length > 0);
  return bar + (hasBag ? BAG_BAR_HEIGHT + 10 : 0) + 28;
}
