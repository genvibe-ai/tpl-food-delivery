import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { orderPhoto, orderSummary } from "@/components/OrderAgainCard";
import { ProgressSegments } from "@/components/OrderProgress";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Mark } from "@/components/ui/Mark";
import { Photo } from "@/components/ui/Photo";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, palette, radii, tracking } from "@/constants/content";
import { useReorder } from "@/lib/actions";
import { getRestaurant } from "@/lib/catalog";
import { clock, dayLabel, money } from "@/lib/format";
import { GUTTER, useTabScreenPadding } from "@/lib/layout";
import { useStore, type Order } from "@/lib/store";
import { trackOrder, useNow } from "@/lib/tracking";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottom = useTabScreenPadding();
  const orders = useStore((s) => s.orders);
  const hasLive = orders.some((o) => o.deliveredAt > Date.now());
  const now = useNow(hasLive, 1000);
  const live = orders.filter((o) => o.deliveredAt > now);
  const past = orders.filter((o) => o.deliveredAt <= now);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gutter}>
          <Text variant="title" accessibilityRole="header">
            {copy.orders.title}
          </Text>
          <Text variant="bodyMedium" color={palette.muted}>
            {copy.orders.subtitle}
          </Text>
        </View>

        {orders.length === 0 ? (
          <EmptyState
            icon="orders"
            title={copy.orders.emptyTitle}
            body={copy.orders.emptyBody}
            action={copy.orders.emptyCta}
            onAction={() => router.navigate("/home")}
          />
        ) : null}

        {live.length > 0 ? (
          <View style={styles.section}>
            <Text variant="micro" style={styles.label}>
              {copy.orders.active}
            </Text>
            {live.map((order) => (
              <LiveCard key={order.id} order={order} now={now} />
            ))}
          </View>
        ) : null}

        {past.length > 0 ? (
          <View style={styles.section}>
            <Text variant="micro" style={styles.label}>
              {copy.orders.past}
            </Text>
            {past.map((order, i) => (
              <Animated.View key={order.id} entering={FadeInDown.delay(Math.min(i, 5) * 60).duration(420)}>
                <PastCard order={order} />
              </Animated.View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function LiveCard({ order, now }: { order: Order; now: number }) {
  const router = useRouter();
  const restaurant = getRestaurant(order.restaurantId);
  if (!restaurant) return null;
  const state = trackOrder(order.placedAt, now);
  const step = tracking.steps[state.index];
  return (
    <Tap
      label={`${restaurant.name}, ${step.title}`}
      onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
      pressedScale={0.985}
      style={styles.live}
    >
      <View style={styles.row}>
        <Mark restaurant={restaurant} size={48} ring />
        <View style={styles.flex}>
          <Text variant="subheading" color="#FFFFFF">
            {step.title}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.82)">
            {restaurant.name} · {copy.tracking.arriving} {clock(order.etaAt)}
          </Text>
        </View>
        <View style={styles.trackPill}>
          <Text variant="label" color={palette.ink}>
            {copy.orders.track}
          </Text>
          <Icon name="arrowRight" size={14} color={palette.ink} strokeWidth={2.6} />
        </View>
      </View>
      <View style={styles.liveBar}>
        <ProgressSegments index={state.index} progress={state.progress} />
      </View>
    </Tap>
  );
}

function PastCard({ order }: { order: Order }) {
  const router = useRouter();
  const reorder = useReorder();
  const restaurant = getRestaurant(order.restaurantId);
  const photo = orderPhoto(order);
  if (!restaurant) return null;
  return (
    <View style={styles.card}>
      <Tap
        label={`${restaurant.name}, ${dayLabel(order.placedAt)}, ${money(order.totals.total)}`}
        onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
        pressedScale={0.99}
        style={styles.row}
      >
        {photo ? <Photo name={photo} style={styles.photo} decorative /> : null}
        <View style={styles.flex}>
          <View style={styles.titleRow}>
            <Text variant="subheading" numberOfLines={1} style={styles.flex}>
              {restaurant.name}
            </Text>
            <Text variant="price">{money(order.totals.total)}</Text>
          </View>
          <Text variant="caption" numberOfLines={1}>
            {dayLabel(order.placedAt)} · {copy.common.items(order.totals.itemCount)}
          </Text>
          <Text variant="caption" color={palette.inkSoft} numberOfLines={1} style={styles.summary}>
            {orderSummary(order)}
          </Text>
        </View>
      </Tap>
      <View style={styles.footer}>
        <View style={styles.status}>
          <Icon name="checkCircle" size={15} color={palette.success} strokeWidth={2.4} />
          <Text variant="label" color={palette.success}>
            {copy.orders.delivered}
          </Text>
          {order.rating ? (
            <View style={styles.stars} accessibilityLabel={`${order.rating} stars`}>
              {Array.from({ length: order.rating }, (_, i) => (
                <Icon key={i} name="star" size={12} color={palette.butterDeep} fill={palette.butterDeep} strokeWidth={1.4} />
              ))}
            </View>
          ) : (
            <Tap
              label={copy.orders.rate}
              onPress={() => router.push({ pathname: "/order/[id]", params: { id: order.id } })}
              style={styles.rateLink}
            >
              <Text variant="label" color={palette.primaryText}>
                {copy.orders.rate}
              </Text>
            </Tap>
          )}
        </View>
        <Button title={copy.orders.reorder} icon="reorder" size="sm" variant="soft" onPress={() => reorder(order)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  gutter: { paddingHorizontal: GUTTER, gap: 4 },
  flex: { flex: 1 },
  section: { marginTop: 26, paddingHorizontal: GUTTER, gap: 12 },
  label: { marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  live: {
    padding: 16,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    backgroundColor: palette.primary,
    boxShadow: "0 14px 30px rgba(240, 80, 47, 0.28)",
  },
  trackPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  liveBar: { marginTop: 16, padding: 10, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.92)" },
  card: {
    padding: 14,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 6px 18px rgba(34, 27, 24, 0.05)",
  },
  photo: { width: 72, height: 72, borderRadius: 18 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summary: { marginTop: 2 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
  },
  status: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  stars: { flexDirection: "row", gap: 1, marginLeft: 6 },
  rateLink: { marginLeft: 6, paddingVertical: 4 },
});
