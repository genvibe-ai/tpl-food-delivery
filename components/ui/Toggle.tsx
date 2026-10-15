import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { palette } from "@/constants/content";
import { SNAP } from "@/lib/motion";
import { Tap } from "./Tap";

/** On/off switch in the brand colours (looks the same on every platform). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (next: boolean) => void; label: string }) {
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.set(withSpring(value ? 1 : 0, SNAP));
  }, [value, on]);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [palette.lineStrong, palette.primary]),
  }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: on.get() * 20 }] }));
  return (
    <Tap label={label} role="switch" selected={value} onPress={() => onChange(!value)} pressedScale={0.94}>
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.thumb, thumb]} />
      </Animated.View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 32, borderRadius: 16, padding: 3 },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 6px rgba(34, 27, 24, 0.25)",
  },
});
