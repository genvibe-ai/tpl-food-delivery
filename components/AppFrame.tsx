import type { PropsWithChildren } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { palette } from "@/constants/content";
import { FRAME_MAX } from "@/lib/layout";

/**
 * On wide web screens the app sits in a centred phone-width column; on
 * phones (and in the native apps) it fills the screen.
 */
export function AppFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width <= FRAME_MAX) return <View style={styles.fill}>{children}</View>;
  return (
    <View style={styles.outer}>
      <View style={styles.column}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.canvas },
  outer: { flex: 1, alignItems: "center", backgroundColor: palette.frame },
  column: {
    flex: 1,
    width: "100%",
    maxWidth: FRAME_MAX,
    backgroundColor: palette.canvas,
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(34,27,24,0.06), 0 30px 80px rgba(34, 27, 24, 0.12)",
  },
});
