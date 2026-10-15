import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { copy, palette } from "@/constants/content";
import { Icon } from "./Icon";
import { Tap } from "./Tap";
import { Text } from "./Text";

/** − qty + control. At 1, the minus becomes a bin when `canRemove` is set. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "sm",
  canRemove = false,
  name,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "lg";
  canRemove?: boolean;
  /** What is being counted, for screen readers. */
  name: string;
}) {
  const big = size === "lg";
  const showBin = canRemove && value <= 1;
  const button = big ? 44 : 32;
  return (
    <View style={[styles.wrap, big ? styles.big : styles.small]} accessibilityLabel={`${name}: ${value}`}>
      <Tap
        label={showBin ? copy.bag.remove : `${copy.dish.decrease} ${name}`}
        onPress={() => onChange(value - 1)}
        disabled={!showBin && value <= min}
        pressedScale={0.88}
        style={[styles.button, { width: button, height: button, borderRadius: button / 2 }]}
      >
        <Icon
          name={showBin ? "trash" : "minus"}
          size={big ? 20 : 16}
          color={!showBin && value <= min ? palette.faint : palette.ink}
          strokeWidth={2.4}
        />
      </Tap>
      <Animated.View key={value} entering={FadeIn.duration(160)} exiting={FadeOut.duration(80)} style={styles.value}>
        <Text variant={big ? "subheading" : "strong"} align="center" style={styles.tabular}>
          {value}
        </Text>
      </Animated.View>
      <Tap
        label={`${copy.dish.increase} ${name}`}
        onPress={() => onChange(value + 1)}
        disabled={value >= max}
        pressedScale={0.88}
        style={[styles.button, { width: button, height: button, borderRadius: button / 2 }]}
      >
        <Icon name="plus" size={big ? 20 : 16} color={value >= max ? palette.faint : palette.ink} strokeWidth={2.4} />
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", backgroundColor: palette.sunken, borderRadius: 999 },
  small: { padding: 2, height: 36 },
  big: { padding: 4, height: 58 },
  button: { alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  value: { minWidth: 30, alignItems: "center" },
  tabular: { fontVariant: ["tabular-nums"] },
});
