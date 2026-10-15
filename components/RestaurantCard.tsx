import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { copy, palette, radii, type Restaurant } from "@/constants/content";
import { etaRange, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { IconButton } from "./ui/IconButton";
import { Mark } from "./ui/Mark";
import { Photo } from "./ui/Photo";
import { Rating } from "./ui/Rating";
import { Pill } from "./ui/Tag";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

export function deliveryLabel(r: Restaurant) {
  return `${money(r.deliveryFee)} ${copy.restaurant.delivery}`;
}

/** Big photo card for a restaurant (Featured row and the All restaurants list). */
export function RestaurantCard({ restaurant, width, coverHeight = 176 }: { restaurant: Restaurant; width?: number; coverHeight?: number }) {
  const router = useRouter();
  const favourite = useStore((s) => s.favourites.includes(restaurant.id));
  const toggleFavourite = useStore((s) => s.toggleFavourite);
  return (
    <View style={[styles.card, width ? { width } : null]}>
      <Tap
        label={`${restaurant.name}, ${restaurant.cuisine}, ${etaRange(restaurant)}`}
        onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id } })}
        pressedScale={0.98}
      >
        <View style={[styles.cover, { height: coverHeight }]}>
          <Photo name={restaurant.cover} style={StyleSheet.absoluteFill} decorative />
          <LinearGradient
            colors={["rgba(20,14,11,0.18)", "rgba(20,14,11,0)", "rgba(20,14,11,0.28)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          {restaurant.freeDeliveryOver ? (
            <View style={styles.offer}>
              <Pill icon="tag" text={copy.restaurant.freeOverShort(money(restaurant.freeDeliveryOver, true))} tone="butter" />
            </View>
          ) : null}
          <View style={styles.time}>
            <Pill icon="clock" text={etaRange(restaurant)} />
          </View>
        </View>
        <View style={styles.info}>
          <Mark restaurant={restaurant} size={40} />
          <View style={styles.texts}>
            <View style={styles.nameRow}>
              <Text variant="subheading" numberOfLines={1} style={styles.name}>
                {restaurant.name}
              </Text>
              <Rating value={restaurant.rating} />
            </View>
            <Text variant="caption" numberOfLines={1}>
              {restaurant.cuisine} · {restaurant.priceLevel} · {deliveryLabel(restaurant)}
            </Text>
          </View>
        </View>
      </Tap>
      <IconButton
        icon="heart"
        label={copy.restaurant.favourite}
        size={38}
        iconColor={favourite ? palette.primary : palette.ink}
        fill={favourite ? palette.primary : "none"}
        style={styles.heart}
        onPress={() => toast(toggleFavourite(restaurant.id) ? copy.toasts.favourited : copy.toasts.unfavourited, "heart")}
      />
    </View>
  );
}

/** Compact row (search results, favourites). */
export function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  return (
    <Tap
      label={`${restaurant.name}, ${restaurant.cuisine}`}
      onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id } })}
      pressedScale={0.98}
      style={styles.row}
    >
      <Photo name={restaurant.cover} style={styles.rowPhoto} decorative />
      <View style={styles.texts}>
        <Text variant="strong" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {restaurant.cuisine}
        </Text>
        <View style={styles.rowMeta}>
          <Rating value={restaurant.rating} />
          <Text variant="caption">· {etaRange(restaurant)}</Text>
        </View>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, borderCurve: "continuous" },
  cover: { borderRadius: radii.xl, borderCurve: "continuous", overflow: "hidden", backgroundColor: palette.sunken },
  offer: { position: "absolute", top: 12, left: 12 },
  heart: { position: "absolute", top: 10, right: 10 },
  time: { position: "absolute", left: 12, bottom: 12 },
  info: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 12, paddingHorizontal: 2 },
  texts: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { flexShrink: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10 },
  rowPhoto: { width: 68, height: 68, borderRadius: 20 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
});
