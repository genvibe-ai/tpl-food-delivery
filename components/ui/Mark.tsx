import { StyleSheet, View } from "react-native";
import { fonts, type Restaurant } from "@/constants/content";
import { Text } from "./Text";

/** A restaurant's letter-mark logo. */
export function Mark({ restaurant, size = 44, ring = false }: { restaurant: Restaurant; size?: number; ring?: boolean }) {
  const { letter, bg, fg } = restaurant.mark;
  return (
    <View
      accessible={false}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        ring ? { borderWidth: Math.max(2, size / 16), borderColor: "#FFFFFF" } : null,
      ]}
    >
      <Text
        style={{ fontFamily: fonts.display, fontSize: size * 0.46, lineHeight: size * 0.56, color: fg }}
        allowFontScaling={false}
      >
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: "center", justifyContent: "center", borderCurve: "continuous" },
});
