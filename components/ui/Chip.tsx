import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "@/constants/content";
import { Tap } from "./Tap";
import { Text } from "./Text";

/** Pill chip for categories, filters, tips and time slots. */
export function Chip({
  label,
  selected = false,
  onPress,
  leading,
  detail,
  style,
  size = "md",
  role = "button",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
  detail?: string;
  style?: StyleProp<ViewStyle>;
  size?: "md" | "sm";
  role?: "button" | "radio" | "checkbox" | "tab";
}) {
  return (
    <Tap
      label={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      role={role}
      selected={selected}
      pressedScale={0.95}
      style={[
        styles.base,
        size === "sm" ? styles.sm : styles.md,
        leading ? styles.withLeading : null,
        selected ? styles.selected : styles.idle,
        style,
      ]}
    >
      {leading}
      <Text variant="strong" color={selected ? "#FFFFFF" : palette.ink} style={size === "sm" ? styles.smText : null}>
        {label}
      </Text>
      {detail ? (
        <Text variant="caption" color={selected ? "rgba(255,255,255,0.78)" : palette.muted}>
          {detail}
        </Text>
      ) : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: "row", alignItems: "center", borderRadius: 999, gap: 8, borderWidth: 1 },
  md: { height: 46, paddingHorizontal: 18 },
  sm: { height: 36, paddingHorizontal: 14, gap: 6 },
  withLeading: { paddingLeft: 6 },
  smText: { fontSize: 14 },
  idle: { backgroundColor: "#FFFFFF", borderColor: palette.line },
  selected: { backgroundColor: palette.ink, borderColor: palette.ink },
});
