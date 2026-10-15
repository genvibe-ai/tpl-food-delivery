import type { BottomTabBarProps } from "expo-router/tabs";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { copy, palette } from "@/constants/content";
import { BAG_BAR_HEIGHT, TAB_BAR_HEIGHT, useTabBarSpace } from "@/lib/layout";
import { SPRING } from "@/lib/motion";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/tracking";
import { BagBar } from "./BagBar";
import { Icon, type IconName } from "./ui/Icon";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

const ITEMS: Record<string, { icon: IconName; label: string }> = {
  home: { icon: "home", label: copy.tabs.home },
  search: { icon: "search", label: copy.tabs.search },
  orders: { icon: "orders", label: copy.tabs.orders },
  profile: { icon: "profile", label: copy.tabs.profile },
};

/** Floating capsule tab bar with a sliding highlight, plus the bag bar above it. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const space = useTabBarSpace();
  const [width, setWidth] = useState(0);
  const routes = state.routes.filter((r) => ITEMS[r.name]);
  const activeIndex = routes.findIndex((r) => r.key === state.routes[state.index]?.key);
  const itemWidth = routes.length ? (width - 12) / routes.length : 0;
  const x = useSharedValue(0);

  // A dot on Orders while a delivery is on its way.
  const latest = useStore((s) => s.orders[0]);
  const now = useNow(!!latest && latest.deliveredAt > Date.now(), 4000);
  const live = !!latest && latest.deliveredAt > now;

  useEffect(() => {
    x.set(withSpring(Math.max(0, activeIndex) * itemWidth, SPRING));
  }, [activeIndex, itemWidth, x]);

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: space - TAB_BAR_HEIGHT }]}>
      <BagBar style={styles.bag} />
      <View style={styles.bar} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist">
        {itemWidth > 0 ? <Animated.View style={[styles.highlight, { width: itemWidth }, highlight]} /> : null}
        {routes.map((route, i) => {
          const item = ITEMS[route.name];
          const focused = i === activeIndex;
          const color = focused ? palette.primaryText : palette.muted;
          return (
            <Tap
              key={route.key}
              label={item.label}
              role="tab"
              selected={focused}
              pressedScale={0.9}
              style={styles.item}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
            >
              <View>
                <Icon name={item.icon} size={23} color={focused ? palette.primary : palette.muted} strokeWidth={focused ? 2.3 : 2} />
                {route.name === "orders" && live ? <View style={styles.dot} /> : null}
              </View>
              <Text variant="label" color={color} style={styles.label}>
                {item.label}
              </Text>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 14, right: 14 },
  bag: { marginBottom: 10, minHeight: BAG_BAR_HEIGHT },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 12px 32px rgba(34, 27, 24, 0.14)",
  },
  highlight: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 6,
    borderRadius: 26,
    backgroundColor: palette.primarySoft,
  },
  item: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 2 },
  label: { fontSize: 11, lineHeight: 14 },
  dot: {
    position: "absolute",
    top: -1,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
