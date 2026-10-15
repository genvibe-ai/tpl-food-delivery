import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { copy, palette, radii } from "@/constants/content";
import { useReorder } from "@/lib/actions";
import { getDish, getRestaurant } from "@/lib/catalog";
import { dayLabel, money } from "@/lib/format";
import type { Order } from "@/lib/store";
import { Icon } from "./ui/Icon";
import { Photo } from "./ui/Photo";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

export function orderSummary(order: Order) {
  return order.lines.map((l) => `${l.qty > 1 ? `${l.qty}× ` : ""}${l.name}`).join(", ");
}

export function orderPhoto(order: Order) {
  const restaurant = getRestaurant(order.restaurantId);
  const dish = order.lines.map((l) => getDish(order.restaurantId, l.dishId)).find((d) => d?.photo);
  return dish?.photo ?? restaurant?.cover;
}

/** "Order again" card on Home. */
export function OrderAgainCard({ order }: { order: Order }) {
  const router = useRouter();
  const reorder = useReorder();
  const restaurant = getRestaurant(order.restaurantId);
  const photo = orderPhoto(order);
  if (!restaurant || !photo) return null;
  return (
    <View style={styles.card}>
      <Tap
        label={`${restaurant.name}: ${orderSummary(order)}`}
        onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id } })}
        pressedScale={0.98}
        style={styles.main}
      >
        <Photo name={photo} style={styles.photo} decorative />
        <View style={styles.texts}>
          <Text variant="strong" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text variant="caption" numberOfLines={1}>
            {orderSummary(order)}
          </Text>
          <Text variant="label" color={palette.inkSoft} style={styles.meta}>
            {money(order.totals.total)} · {dayLabel(order.placedAt)}
          </Text>
        </View>
      </Tap>
      <Tap label={`${copy.home.reorder} ${restaurant.name}`} onPress={() => reorder(order)} pressedScale={0.9} style={styles.reorder}>
        <Icon name="reorder" size={18} color={palette.primaryText} strokeWidth={2.4} />
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 286,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    paddingRight: 12,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 6px 18px rgba(34, 27, 24, 0.06)",
  },
  main: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  photo: { width: 70, height: 70, borderRadius: 18 },
  texts: { flex: 1, gap: 1 },
  meta: { marginTop: 3 },
  reorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
