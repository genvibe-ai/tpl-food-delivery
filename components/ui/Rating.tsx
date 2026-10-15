import { StyleSheet, View } from "react-native";
import { palette } from "@/constants/content";
import { Icon } from "./Icon";
import { Tap } from "./Tap";
import { Text } from "./Text";

/** ★ 4.8 (2.1k) */
export function Rating({ value, count, color = palette.ink }: { value: number; count?: string; color?: string }) {
  return (
    <View style={styles.row} accessibilityLabel={`Rated ${value.toFixed(1)}${count ? `, ${count} ratings` : ""}`}>
      <Icon name="star" size={14} color={palette.butterDeep} fill={palette.butterDeep} strokeWidth={1.5} />
      <Text variant="label" color={color}>
        {value.toFixed(1)}
      </Text>
      {count ? (
        <Text variant="caption" color={color === palette.ink ? palette.muted : color}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

/** Five tappable stars. */
export function StarPicker({ value, onChange, size = 34 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return (
    <View style={styles.stars} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Tap key={n} label={`${n} star${n === 1 ? "" : "s"}`} onPress={() => onChange(n)} pressedScale={0.85}>
          <Icon
            name="star"
            size={size}
            strokeWidth={1.6}
            color={n <= value ? palette.butterDeep : palette.faint}
            fill={n <= value ? palette.butterDeep : "none"}
          />
        </Tap>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  stars: { flexDirection: "row", gap: 8 },
});
