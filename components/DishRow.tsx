import { StyleSheet, View } from "react-native";
import { copy, palette, radii, type Dish } from "@/constants/content";
import { money } from "@/lib/format";
import { Icon } from "./ui/Icon";
import { Photo } from "./ui/Photo";
import { Tag } from "./ui/Tag";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

/** A dish on a restaurant menu. The round button adds it (or opens its options). */
export function DishRow({
  dish,
  inBag,
  onOpen,
  onAdd,
}: {
  dish: Dish;
  /** How many are already in the bag. */
  inBag: number;
  onOpen: () => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.row}>
      <Tap label={`${dish.name}, ${money(dish.price)}`} onPress={onOpen} pressedScale={0.985} style={styles.main}>
        <View style={styles.texts}>
          {dish.tags?.length ? (
            <View style={styles.tags}>
              {dish.tags.slice(0, 2).map((t) => (
                <Tag key={t} tag={t} />
              ))}
            </View>
          ) : null}
          <Text variant="subheading" style={styles.name}>
            {dish.name}
          </Text>
          <Text variant="caption" numberOfLines={2}>
            {dish.description}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="price">{money(dish.price)}</Text>
            {dish.kcal ? <Text variant="caption">· {copy.dish.kcal(dish.kcal)}</Text> : null}
          </View>
        </View>
        {dish.photo ? <Photo name={dish.photo} style={styles.photo} decorative /> : <View style={styles.noPhoto} />}
      </Tap>
      <Tap
        label={`${copy.dish.add(1)}: ${dish.name}`}
        onPress={onAdd}
        pressedScale={0.88}
        style={[styles.add, dish.photo ? styles.addOnPhoto : styles.addPlain, inBag > 0 ? styles.addActive : null]}
      >
        {inBag > 0 ? (
          <Text variant="strong" color="#FFFFFF">
            {inBag}
          </Text>
        ) : (
          <Icon name="plus" size={20} color={palette.ink} strokeWidth={2.6} />
        )}
      </Tap>
    </View>
  );
}

const PHOTO = 112;

const styles = StyleSheet.create({
  row: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.line },
  main: { flexDirection: "row", gap: 16, alignItems: "center" },
  texts: { flex: 1, gap: 4 },
  tags: { flexDirection: "row", gap: 6, marginBottom: 2 },
  name: { fontSize: 17 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  photo: { width: PHOTO, height: PHOTO, borderRadius: radii.lg },
  noPhoto: { width: 40 },
  add: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(34, 27, 24, 0.16)",
  },
  addOnPhoto: { right: -6, bottom: 8 },
  addPlain: { right: 0, top: "50%", marginTop: -12, borderWidth: 1, borderColor: palette.line },
  addActive: { backgroundColor: palette.primary },
});
