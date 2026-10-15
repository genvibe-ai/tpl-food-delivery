import { StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { palette } from "@/constants/content";
import { Icon } from "./Icon";

/** Radio dot (single choice) or check box (multiple choice). */
export function SelectMark({ selected, multiple = false }: { selected: boolean; multiple?: boolean }) {
  return (
    <View
      style={[
        styles.box,
        multiple ? styles.square : styles.round,
        selected ? styles.on : styles.off,
      ]}
    >
      {selected ? (
        <Animated.View entering={ZoomIn.springify().damping(14)}>
          {multiple ? <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3} /> : <View style={styles.dot} />}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  round: { borderRadius: 12 },
  square: { borderRadius: 8 },
  off: { borderWidth: 2, borderColor: palette.lineStrong, backgroundColor: "#FFFFFF" },
  on: { backgroundColor: palette.primary },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFFFFF" },
});
