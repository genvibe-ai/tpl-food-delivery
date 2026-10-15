import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { copy, palette } from "@/constants/content";
import { GUTTER } from "@/lib/layout";
import { IconButton } from "./ui/IconButton";
import type { IconName } from "./ui/Icon";
import { Text } from "./ui/Text";

/** Top bar for stack screens: back button, centred title, optional action. */
export function ScreenHeader({
  title,
  onBack,
  backIcon = "back",
  right,
}: {
  title: string;
  onBack: () => void;
  backIcon?: IconName;
  right?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 6 }]}>
      <IconButton icon={backIcon} label={copy.common.back} onPress={onBack} variant="surface" />
      <Text variant="subheading" numberOfLines={1} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER - 4,
    paddingBottom: 10,
    backgroundColor: palette.canvas,
  },
  title: { flex: 1, textAlign: "center", marginHorizontal: 8, fontSize: 18 },
  right: { minWidth: 44, alignItems: "flex-end" },
});
