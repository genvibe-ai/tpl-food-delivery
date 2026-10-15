import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { brand, fonts, palette } from "@/constants/content";
import { Text } from "./Text";

/** The Spoonlet mark: a little spoon holding a butter-yellow drop. */
export function LogoMark({ size = 40, tile = true }: { size?: number; tile?: boolean }) {
  const spoon = tile ? "#FFFFFF" : palette.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel={brand.name}>
      {tile ? <Rect x={0} y={0} width={64} height={64} rx={19} fill={palette.primary} /> : null}
      <G transform={tile ? "translate(32 32) scale(1.1) translate(-32 -32)" : undefined}>
        <Path d="M29.3 34.6 L17.8 46.1" stroke={spoon} strokeWidth={6.6} strokeLinecap="round" />
        <Ellipse cx={36.3} cy={27.6} rx={10.6} ry={13.4} transform="rotate(45 36.3 27.6)" fill={spoon} />
        <Circle cx={37.2} cy={26.7} r={4.7} fill={palette.butter} />
      </G>
    </Svg>
  );
}

export function Logo({ size = 36, color = palette.ink }: { size?: number; color?: string }) {
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={brand.name}>
      <LogoMark size={size} />
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.72, lineHeight: size * 0.9, letterSpacing: -0.8, color }}>
        {brand.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 10 } });
