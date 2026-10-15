import { useEffect } from "react";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { courier, palette, photos, type Restaurant } from "@/constants/content";
import { Icon } from "./ui/Icon";
import { Mark } from "./ui/Mark";

/** Map markers shared by the drawn map and the live map. */
export function RestaurantPin({ restaurant, style }: { restaurant: Restaurant; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <View style={styles.restaurant}>
        <Mark restaurant={restaurant} size={34} />
      </View>
    </View>
  );
}

export function HomePin({ style, pulsing = true }: { style?: StyleProp<ViewStyle>; pulsing?: boolean }) {
  const reduced = useReducedMotion();
  const ring = useSharedValue(0);
  useEffect(() => {
    if (pulsing && !reduced)
      ring.set(withRepeat(withSequence(withTiming(1, { duration: 1700 }), withTiming(0, { duration: 0 })), -1));
    else ring.set(0);
  }, [pulsing, reduced, ring]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - ring.get()),
    transform: [{ scale: 1 + ring.get() * 1.4 }],
  }));
  return (
    <View style={style}>
      <View style={styles.center}>
        {pulsing ? <Animated.View style={[styles.homeRing, ringStyle]} /> : null}
        <View style={styles.home}>
          <Icon name="home" size={19} color="#FFFFFF" strokeWidth={2.3} />
        </View>
      </View>
    </View>
  );
}

/** Uses React Native's Image: live-map markers are snapshotted, and local images load at once. */
export function CourierPin() {
  return (
    <View style={styles.courier}>
      <Image source={photos[courier.photo].source} style={styles.courierPhoto} accessibilityIgnoresInvertColors />
      <View style={styles.bike}>
        <Icon name="bike" size={12} color="#FFFFFF" strokeWidth={2.6} />
      </View>
    </View>
  );
}

/** Tomato map pin, tip at the bottom centre. */
export function LocationPin({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 40 48">
      <Path
        d="M20 47c-1.2 0-15.5-15.4-15.5-27.1C4.5 10.9 11.4 4 20 4s15.5 6.9 15.5 15.9C35.5 31.6 21.2 47 20 47Z"
        fill={palette.primary}
        stroke="#FFFFFF"
        strokeWidth={3}
      />
      <Circle cx={20} cy={20} r={6.5} fill="#FFFFFF" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  restaurant: {
    padding: 3,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 6px 16px rgba(34, 27, 24, 0.22)",
  },
  homeRing: { position: "absolute", width: 44, height: 44, borderRadius: 22, backgroundColor: palette.ink },
  home: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.ink,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(34, 27, 24, 0.25)",
  },
  courier: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 8px 20px rgba(34, 27, 24, 0.28)",
  },
  courierPhoto: { width: 44, height: 44, borderRadius: 22 },
  bike: {
    position: "absolute",
    right: -6,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
