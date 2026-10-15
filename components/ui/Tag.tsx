import { StyleSheet, View } from "react-native";
import { copy, palette } from "@/constants/content";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type DishTag = keyof typeof copy.restaurant.tags;

const TAGS: Record<DishTag, { icon: IconName; bg: string; fg: string }> = {
  popular: { icon: "flame", bg: palette.primarySoft, fg: palette.primaryText },
  spicy: { icon: "flame", bg: "#FCE3DC", fg: "#B23A1C" },
  veggie: { icon: "leaf", bg: palette.successSoft, fg: palette.success },
  new: { icon: "sparkles", bg: palette.butterSoft, fg: palette.butterInk },
};

/** Small dish tag: Popular, Spicy, Veggie, New. */
export function Tag({ tag }: { tag: DishTag }) {
  const t = TAGS[tag];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }]}>
      <Icon name={t.icon} size={12} color={t.fg} strokeWidth={2.4} />
      <Text variant="label" color={t.fg} style={styles.text}>
        {copy.restaurant.tags[tag]}
      </Text>
    </View>
  );
}

/** A plain pill for short facts ("20–30 min"). */
export function Pill({ icon, text, tone = "light" }: { icon?: IconName; text: string; tone?: "light" | "dark" | "butter" }) {
  const bg = tone === "dark" ? "rgba(34,27,24,0.78)" : tone === "butter" ? palette.butter : "#FFFFFF";
  const fg = tone === "dark" ? "#FFFFFF" : tone === "butter" ? palette.butterInk : palette.ink;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={13} color={fg} strokeWidth={2.4} /> : null}
      <Text variant="label" color={fg} style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: { flexDirection: "row", alignItems: "center", gap: 4, height: 24, paddingHorizontal: 8, borderRadius: 12 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(34, 27, 24, 0.10)",
  },
  text: { fontSize: 12, lineHeight: 15 },
});
