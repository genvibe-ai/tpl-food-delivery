import { StyleSheet, Text as RNText, type TextProps } from "react-native";
import { fonts, palette } from "@/constants/content";

/** Type scale: Bricolage Grotesque for headings, Figtree for everything else. */
const variants = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -1.2, color: palette.ink },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.8, color: palette.ink },
  heading: { fontFamily: fonts.heading, fontSize: 21, lineHeight: 26, letterSpacing: -0.45, color: palette.ink },
  subheading: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 22, letterSpacing: -0.25, color: palette.ink },
  price: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 20, letterSpacing: -0.1, color: palette.ink },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: palette.ink },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: palette.ink },
  strong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: palette.ink },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17, color: palette.ink },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: palette.muted },
  micro: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: palette.muted,
  },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, color: palette.ink },
});

export type TextVariant = keyof typeof variants;

export function Text({
  variant = "body",
  color,
  align,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; color?: string; align?: "left" | "center" | "right" }) {
  return (
    <RNText
      maxFontSizeMultiplier={1.35}
      {...rest}
      style={[variants[variant], color ? { color } : null, align ? { textAlign: align } : null, style]}
    />
  );
}
