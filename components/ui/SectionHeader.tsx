import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { palette } from "@/constants/content";
import { Tap } from "./Tap";
import { Text } from "./Text";

export function SectionHeader({
  title,
  action,
  onAction,
  detail,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  detail?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titles}>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        {detail ? <Text variant="caption">{detail}</Text> : null}
      </View>
      {action ? (
        <Tap label={action} onPress={onAction} role="link" style={styles.action}>
          <Text variant="label" color={palette.primaryText}>
            {action}
          </Text>
        </Tap>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  titles: { flex: 1, gap: 2 },
  action: { paddingVertical: 4, paddingLeft: 8 },
});
