import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { copy, palette } from "@/constants/content";
import { money } from "@/lib/format";
import { BAG_BAR_HEIGHT } from "@/lib/layout";
import { useBag, useBagTotals } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Icon } from "./ui/Icon";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/** Dark "View bag" bar that floats above the tab bar and on restaurant pages. */
export function BagBar({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { restaurant, count } = useBag();
  const totals = useBagTotals();
  const pulse = useUI((s) => s.bagPulse);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse === 0) return;
    scale.set(withSequence(withSpring(1.05, { damping: 8, stiffness: 400 }), withSpring(1, { damping: 12, stiffness: 260 })));
  }, [pulse, scale]);

  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  if (!restaurant || count === 0) return null;
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOutDown.duration(180)} style={style}>
      <Animated.View style={bounce}>
        <Tap
          label={`${copy.bag.title}, ${copy.common.items(count)}, ${money(totals.subtotal)}`}
          onPress={() => router.push("/bag")}
          style={styles.bar}
          testID="bag-bar"
        >
          <View style={styles.iconWrap}>
            <Icon name="bag" size={20} color="#FFFFFF" strokeWidth={2.2} />
            <View style={styles.count}>
              <Text variant="label" color={palette.ink} style={styles.countText}>
                {count}
              </Text>
            </View>
          </View>
          <View style={styles.texts}>
            <Text variant="strong" color="#FFFFFF" numberOfLines={1}>
              {copy.bag.title}
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.72)" numberOfLines={1}>
              {restaurant.name}
            </Text>
          </View>
          <Text variant="price" color="#FFFFFF" style={styles.price}>
            {money(totals.subtotal)}
          </Text>
          <Icon name="chevronRight" size={18} color="rgba(255,255,255,0.7)" />
        </Tap>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: BAG_BAR_HEIGHT,
    borderRadius: BAG_BAR_HEIGHT / 2,
    backgroundColor: palette.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
    paddingRight: 16,
    gap: 12,
    boxShadow: "0 14px 34px rgba(34, 27, 24, 0.30)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    position: "absolute",
    top: -3,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  countText: { fontSize: 11, lineHeight: 13 },
  texts: { flex: 1 },
  price: { fontVariant: ["tabular-nums"] },
});
