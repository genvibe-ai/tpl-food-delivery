import { useEffect, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { mapColors, palette, type Restaurant } from "@/constants/content";
import { bendPoint, pointOnCurve, type Point } from "@/lib/route";
import { CourierPin, HomePin, LocationPin, RestaurantPin } from "./MapPins";

/** The drawn map is a 400 × 400 world, cropped to fill whatever box it sits in. */
const WORLD = 400;
const CELL = 80;
const RESTAURANT: Point = { x: 80, y: 284 };
const HOME: Point = { x: 320, y: 118 };
const CONTROL = bendPoint(RESTAURANT, HOME, 0.2);

type Props = {
  style?: StyleProp<ViewStyle>;
} & (
  | { mode: "pin" }
  | { mode: "route"; restaurant: Restaurant; ride: number; pickedUp: boolean; delivered: boolean }
);

/**
 * A soft, drawn street map. "pin" drops a location pin in the middle
 * (onboarding, address, checkout); "route" shows the restaurant, your door
 * and the courier riding between them (order tracking on the web).
 */
export function MapIllustration(props: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const scale = Math.max(box.w / WORLD, box.h / WORLD);
  const ox = (box.w - WORLD * scale) / 2;
  const oy = (box.h - WORLD * scale) / 2;
  const toScreen = (p: Point) => ({ left: p.x * scale + ox, top: p.y * scale + oy });

  return (
    <View style={[styles.wrap, props.style]} onLayout={onLayout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${WORLD} ${WORLD}`} preserveAspectRatio="xMidYMid slice">
        <Streets />
        {props.mode === "route" ? (
          <G>
            <Path
              d={`M ${RESTAURANT.x} ${RESTAURANT.y} Q ${CONTROL.x} ${CONTROL.y} ${HOME.x} ${HOME.y}`}
              stroke="#FFFFFF"
              strokeWidth={11}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={`M ${RESTAURANT.x} ${RESTAURANT.y} Q ${CONTROL.x} ${CONTROL.y} ${HOME.x} ${HOME.y}`}
              stroke={mapColors.route}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={props.delivered ? undefined : "0.5 11"}
              fill="none"
            />
          </G>
        ) : null}
      </Svg>
      {box.w > 0 && props.mode === "route" ? (
        <>
          <RestaurantPin restaurant={props.restaurant} style={[styles.pin, toScreen(RESTAURANT)]} />
          <HomePin style={[styles.pin, toScreen(HOME)]} pulsing={!props.delivered} />
          {props.pickedUp && !props.delivered ? (
            <MovingCourier ride={props.ride} scale={scale} ox={ox} oy={oy} />
          ) : null}
        </>
      ) : null}
      {box.w > 0 && props.mode === "pin" ? <DroppedPin left={box.w / 2} top={box.h / 2} /> : null}
    </View>
  );
}

function MovingCourier({ ride, scale, ox, oy }: { ride: number; scale: number; ox: number; oy: number }) {
  const t = useSharedValue(ride);
  useEffect(() => {
    t.set(withTiming(ride, { duration: 980, easing: Easing.linear }));
  }, [ride, t]);
  const style = useAnimatedStyle(() => {
    const p = pointOnCurve(RESTAURANT, CONTROL, HOME, t.get());
    return { left: p.x * scale + ox, top: p.y * scale + oy };
  });
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.pin, style]}>
      <CourierPin />
    </Animated.View>
  );
}

function DroppedPin({ left, top }: { left: number; top: number }) {
  const reduced = useReducedMotion();
  const drop = useSharedValue(reduced ? 0 : -60);
  const ring = useSharedValue(0);
  useEffect(() => {
    drop.set(withDelay(150, withSpring(0, { damping: 9, stiffness: 160 })));
    if (!reduced)
      ring.set(withDelay(500, withRepeat(withSequence(withTiming(1, { duration: 1600 }), withTiming(0, { duration: 0 })), -1)));
  }, [drop, ring, reduced]);
  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drop.get() }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - ring.get()),
    transform: [{ scale: 0.4 + ring.get() * 1.6 }],
  }));
  return (
    <View style={[styles.pin, { left, top }]} pointerEvents="none">
      <Animated.View style={[styles.ring, ringStyle]} />
      <View style={styles.shadow} />
      <Animated.View style={[styles.locationPin, pinStyle]}>
        <LocationPin />
      </Animated.View>
    </View>
  );
}

/** Streets, blocks, a park and a river. */
function Streets() {
  const blocks: { x: number; y: number; tone: number }[] = [];
  for (let col = 0; col < WORLD / CELL; col++)
    for (let row = 0; row < WORLD / CELL; row++) {
      if (row === 0 && col < 2) continue; // the park
      blocks.push({ x: col * CELL, y: row * CELL, tone: (col * 3 + row * 5) % 4 });
    }
  const trees = [
    [28, 26], [52, 44], [80, 24], [104, 50], [132, 30], [40, 60], [118, 62], [146, 56], [66, 62],
  ];
  return (
    <G>
      <Rect x={0} y={0} width={WORLD} height={WORLD} fill={mapColors.road} />
      {blocks.map((b) => (
        <Rect
          key={`${b.x}-${b.y}`}
          x={b.x + 8}
          y={b.y + 8}
          width={CELL - 16}
          height={CELL - 16}
          rx={12}
          fill={b.tone === 0 ? mapColors.blockAlt : mapColors.block}
        />
      ))}
      <Rect x={8} y={8} width={CELL * 2 - 16} height={CELL - 16} rx={16} fill={mapColors.park} />
      {trees.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={mapColors.parkDot} />
      ))}
      <Path
        d="M -30 356 C 70 318, 150 392, 250 352 S 372 300, 440 322"
        stroke={mapColors.water}
        strokeWidth={34}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M -20 246 L 420 86" stroke={mapColors.casing} strokeWidth={20} strokeLinecap="round" />
      <Path d="M -20 246 L 420 86" stroke={mapColors.road} strokeWidth={16} strokeLinecap="round" />
      <Path d="M 200 -10 L 200 410" stroke={mapColors.casing} strokeWidth={15} />
      <Path d="M 200 -10 L 200 410" stroke={mapColors.road} strokeWidth={12} />
    </G>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: "hidden", backgroundColor: mapColors.road },
  pin: { position: "absolute", width: 0, height: 0, alignItems: "center", justifyContent: "center", overflow: "visible" },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.primary,
  },
  shadow: {
    position: "absolute",
    width: 22,
    height: 8,
    borderRadius: 11,
    backgroundColor: "rgba(34, 27, 24, 0.22)",
  },
  locationPin: { position: "absolute", bottom: -2 },
});
