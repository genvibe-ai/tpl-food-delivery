import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "@/constants/content";
import { Icon, type IconName } from "./Icon";
import { Tap } from "./Tap";
import { Text } from "./Text";

type Variant = "surface" | "soft" | "ink" | "primary" | "clear";

const COLORS: Record<Variant, { bg: string; fg: string }> = {
  surface: { bg: "#FFFFFF", fg: palette.ink },
  soft: { bg: palette.sunken, fg: palette.ink },
  ink: { bg: palette.ink, fg: "#FFFFFF" },
  primary: { bg: palette.primary, fg: "#FFFFFF" },
  clear: { bg: "transparent", fg: palette.ink },
};

/** Round icon button. `badge` shows a small count in the corner. */
export function IconButton({
  icon,
  label,
  onPress,
  variant = "surface",
  size = 44,
  iconColor,
  fill,
  badge,
  style,
  testID,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: number;
  iconColor?: string;
  fill?: string;
  badge?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const c = COLORS[variant];
  return (
    <Tap
      label={label}
      onPress={onPress}
      pressedScale={0.92}
      testID={testID}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: c.bg },
        variant === "surface" ? styles.lifted : null,
        style,
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.46)} color={iconColor ?? c.fg} fill={fill} />
      {badge ? (
        <View style={styles.badge}>
          <Text variant="micro" color={palette.onPrimary} style={styles.badgeText}>
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      ) : null}
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  lifted: { boxShadow: "0 4px 14px rgba(34, 27, 24, 0.12)" },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: { fontSize: 10, lineHeight: 12, letterSpacing: 0 },
});
