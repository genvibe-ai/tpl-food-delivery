import type { PropsWithChildren } from "react";
import { Platform, Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { SNAP } from "@/lib/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Every tappable thing: a soft spring on press, a light haptic tick, and a
 * hover state on the web.
 */
export function Tap({
  children,
  onPress,
  onLongPress,
  label,
  style,
  disabled = false,
  pressedScale = 0.97,
  haptic = true,
  role = "button",
  selected,
  testID,
  hitSlop = 4,
}: PropsWithChildren<{
  onPress?: () => void;
  onLongPress?: () => void;
  /** Accessibility label (read by screen readers). */
  label: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  pressedScale?: number;
  haptic?: boolean;
  role?: "button" | "link" | "tab" | "radio" | "checkbox" | "switch";
  selected?: boolean;
  testID?: string;
  hitSlop?: number;
}>) {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: 1 - hover.get() * 0.1,
  }));
  return (
    <AnimatedPressable
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{
        disabled,
        selected: role === "switch" ? undefined : selected,
        checked: role === "radio" || role === "checkbox" || role === "switch" ? selected : undefined,
      }}
      testID={testID}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={() => {
        if (!reduced) scale.set(withSpring(pressedScale, SNAP));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, SNAP));
      }}
      onHoverIn={Platform.OS === "web" ? () => hover.set(1) : undefined}
      onHoverOut={Platform.OS === "web" ? () => hover.set(0) : undefined}
      onPress={() => {
        if (haptic) haptics.select();
        onPress?.();
      }}
      onLongPress={onLongPress}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}
