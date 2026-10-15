import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { palette } from "@/constants/content";
import { Button } from "./ui/Button";
import { Icon, type IconName } from "./ui/Icon";
import { Text } from "./ui/Text";

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.circle}>
        <View style={styles.inner}>
          <Icon name={icon} size={40} color={palette.primary} strokeWidth={2} />
        </View>
        <View style={[styles.dot, styles.dotA]} />
        <View style={[styles.dot, styles.dotB]} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.texts}>
        <Text variant="title" align="center">
          {title}
        </Text>
        <Text variant="bodyMedium" color={palette.muted} align="center">
          {body}
        </Text>
      </Animated.View>
      {action ? <Button title={action} onPress={onAction} size="md" style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 32, paddingVertical: 40, gap: 18 },
  circle: { width: 150, height: 150, borderRadius: 75, backgroundColor: palette.primarySoft, alignItems: "center", justifyContent: "center" },
  inner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(240, 80, 47, 0.18)",
  },
  dot: { position: "absolute", borderRadius: 999, backgroundColor: palette.butter },
  dotA: { width: 22, height: 22, top: 14, right: 18 },
  dotB: { width: 12, height: 12, bottom: 22, left: 16, backgroundColor: palette.primary },
  texts: { gap: 8, alignItems: "center" },
  button: { marginTop: 6, alignSelf: "center" },
});
