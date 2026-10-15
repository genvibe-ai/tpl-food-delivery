import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "@/constants/content";
import { Icon, type IconName } from "./Icon";
import { Tap } from "./Tap";
import { Text } from "./Text";

type Variant = "primary" | "dark" | "soft" | "outline" | "white";

const COLORS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: palette.primary, fg: palette.onPrimary },
  dark: { bg: palette.ink, fg: "#FFFFFF" },
  soft: { bg: palette.sunken, fg: palette.ink },
  outline: { bg: "transparent", fg: palette.ink, border: palette.lineStrong },
  white: { bg: "#FFFFFF", fg: palette.ink },
};

/** Pill button. `trailing` sits at the far end (used for prices on big buttons). */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  trailing,
  disabled = false,
  loading = false,
  style,
  label,
  testID,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: "lg" | "md" | "sm";
  icon?: IconName;
  trailing?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
  testID?: string;
}) {
  const c = COLORS[variant];
  const off = disabled && !loading;
  const fg = off ? palette.faint : c.fg;
  return (
    <Tap
      label={label ?? (trailing ? `${title}, ${trailing}` : title)}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      style={[
        styles.base,
        styles[size],
        { backgroundColor: off ? palette.sunken : c.bg },
        c.border ? { borderWidth: 1.5, borderColor: c.border } : null,
        variant === "primary" && !off ? styles.glow : null,
        trailing ? styles.spread : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          <View style={styles.row}>
            {icon ? <Icon name={icon} size={size === "sm" ? 16 : 19} color={fg} strokeWidth={2.2} /> : null}
            <Text variant="button" color={fg} style={size === "sm" ? styles.smallText : null} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {trailing ? (
            <Text variant="button" color={fg} numberOfLines={1}>
              {trailing}
            </Text>
          ) : null}
        </>
      )}
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderCurve: "continuous",
  },
  lg: { height: 58, paddingHorizontal: 24 },
  md: { height: 48, paddingHorizontal: 20 },
  sm: { height: 38, paddingHorizontal: 15 },
  spread: { justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallText: { fontSize: 14 },
  glow: { boxShadow: "0 10px 24px rgba(240, 80, 47, 0.28)" },
});
