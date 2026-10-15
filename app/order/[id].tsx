import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourierCard, ProgressSegments, Timeline } from "@/components/OrderProgress";
import { TrackingMap } from "@/components/TrackingMap";
import { Totals } from "@/components/Totals";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Mark } from "@/components/ui/Mark";
import { StarPicker } from "@/components/ui/Rating";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { brand, copy, courier, palette, paymentMethods, radii, tracking } from "@/constants/content";
import { useReorder } from "@/lib/actions";
import { getRestaurant } from "@/lib/catalog";
import { clock, dayLabel, fill, money } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { GUTTER } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { trackOrder, useNow } from "@/lib/tracking";
import { toast } from "@/lib/ui";

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const rateOrder = useStore((s) => s.rateOrder);
  const reorder = useReorder();
  const now = useNow(!!order && order.deliveredAt + 1500 > Date.now(), 1000);

  // Back to the tabs: Home after checkout, Orders when opened from there (never an empty bag).
  const close = () => (router.canGoBack() ? router.dismissAll() : router.replace("/home"));
  const restaurant = getRestaurant(order?.restaurantId);

  if (!order || !restaurant)
    return (
      <View style={[styles.screen, styles.missing]}>
        <Text variant="heading" align="center">
          {copy.tracking.notFound}
        </Text>
        <Button title={copy.tracking.home} size="md" variant="soft" onPress={close} />
      </View>
    );

  const state = trackOrder(order.placedAt, now);
  const step = tracking.steps[state.index];
  const mapHeight = Math.round(Math.min(height * 0.44, 420));
  const payment = paymentMethods.find((p) => p.id === order.paymentId);

  return (
    <View style={styles.screen}>
      <TrackingMap
        restaurant={restaurant}
        ride={state.ride}
        pickedUp={state.pickedUp}
        delivered={state.delivered}
        style={{ height: mapHeight + 36 }}
        padding={{ top: insets.top + 40, bottom: 36 }}
      />

      <View style={[styles.topButtons, { top: insets.top + 8 }]}>
        <IconButton icon="chevronDown" label={copy.common.close} onPress={close} />
        <Tap label={copy.tracking.help} onPress={() => toast(copy.toasts.demoScreen, "help")} style={styles.help}>
          <Icon name="help" size={18} color={palette.ink} />
          <Text variant="label">{copy.tracking.help}</Text>
        </Tap>
      </View>

      <View style={[styles.panel, { top: mapHeight }]}>
        <ScrollView
          contentContainerStyle={[styles.panelContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.handle} />
          {state.delivered ? (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.deliveredHead}>
              <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.successBadge}>
                <Icon name="check" size={34} color="#FFFFFF" strokeWidth={3} />
              </Animated.View>
              <Text variant="title" align="center">
                {copy.tracking.deliveredTitle}
              </Text>
              <Text variant="bodyMedium" color={palette.muted} align="center">
                {copy.tracking.arrived} {clock(order.deliveredAt)} · {dayLabel(order.deliveredAt, now)}
              </Text>
              <View style={styles.rate}>
                <Text variant="strong" align="center">
                  {copy.tracking.deliveredBody(restaurant.name)}
                </Text>
                <StarPicker
                  value={order.rating ?? 0}
                  onChange={(n) => {
                    rateOrder(order.id, n);
                    haptics.success();
                    toast(copy.toasts.rated, "star");
                  }}
                />
              </View>
              <Button title={copy.tracking.reorder} icon="reorder" variant="dark" size="md" onPress={() => reorder(order)} />
            </Animated.View>
          ) : (
            <View>
              <View style={styles.liveRow}>
                <LiveDot />
                <Text variant="micro" color={palette.primaryText}>
                  {copy.tracking.live}
                </Text>
                <Text variant="micro">· {copy.tracking.orderNumber(order.number)}</Text>
              </View>
              <Text variant="caption" style={styles.etaLabel}>
                {copy.tracking.arriving}
              </Text>
              <Text variant="display" style={styles.eta}>
                {clock(order.etaAt)}
              </Text>
              <Text variant="subheading" style={styles.stepTitle}>
                {step.title}
              </Text>
              <Text variant="bodyMedium" color={palette.muted}>
                {fill(step.detail, { restaurant: restaurant.name, courier: courier.name })}
              </Text>
              <View style={styles.segments}>
                <ProgressSegments index={state.index} progress={state.progress} />
              </View>
              <View style={styles.block}>
                <CourierCard />
              </View>
            </View>
          )}

          <View style={styles.block}>
            <Timeline
              index={state.index}
              placedAt={order.placedAt}
              endAt={state.delivered ? order.deliveredAt : order.etaAt}
              restaurantName={restaurant.name}
            />
          </View>

          {/* Receipt */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Mark restaurant={restaurant} size={40} />
              <View style={styles.flex}>
                <Text variant="strong">{restaurant.name}</Text>
                <Text variant="caption">
                  {copy.tracking.orderNumber(order.number)} · {dayLabel(order.placedAt, now)}
                </Text>
              </View>
            </View>
            {order.lines.map((line, i) => (
              <View key={`${line.dishId}-${i}`} style={styles.line}>
                <Text variant="label" color={palette.primaryText} style={styles.qty}>
                  {line.qty}×
                </Text>
                <View style={styles.flex}>
                  <Text variant="bodyMedium">{line.name}</Text>
                  {line.summary ? <Text variant="caption">{line.summary}</Text> : null}
                </View>
                <Text variant="strong">{money(line.total)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <Totals totals={order.totals} />
          </View>

          {/* Address and payment */}
          <View style={[styles.card, styles.infoCard]}>
            <InfoRow icon="pin" title={copy.tracking.deliverTo} body={`${order.address.line1}, ${order.address.line2}`} note={order.address.note} />
            <View style={styles.divider} />
            <InfoRow icon="card" title={copy.tracking.paidWith} body={payment ? `${payment.title} · ${payment.detail}` : "—"} />
          </View>

          {!state.delivered ? (
            <View style={styles.demo}>
              <Icon name="info" size={14} color={palette.muted} />
              <Text variant="caption" style={styles.flex}>
                {copy.tracking.demoNote}
              </Text>
            </View>
          ) : null}
          <Text variant="caption" align="center" style={styles.brandLine}>
            {brand.name}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

function InfoRow({ icon, title, body, note }: { icon: "pin" | "card"; title: string; body: string; note?: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Icon name={icon} size={18} color={palette.ink} />
      </View>
      <View style={styles.flex}>
        <Text variant="micro">{title}</Text>
        <Text variant="bodyMedium">{body}</Text>
        {note ? <Text variant="caption">“{note}”</Text> : null}
      </View>
    </View>
  );
}

function LiveDot() {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    pulse.set(withRepeat(withSequence(withTiming(0.25, { duration: 700 }), withTiming(1, { duration: 700 })), -1));
  }, [reduced, pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.get() }));
  return <Animated.View style={[styles.liveDot, style]} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  missing: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  flex: { flex: 1 },
  topButtons: { position: "absolute", left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  help: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 14px rgba(34, 27, 24, 0.12)",
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.canvas,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: "continuous",
    boxShadow: "0 -10px 30px rgba(34, 27, 24, 0.12)",
    overflow: "hidden",
  },
  panelContent: { paddingHorizontal: GUTTER, paddingTop: 10 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: palette.lineStrong, marginBottom: 16 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary },
  etaLabel: { marginTop: 12 },
  eta: { marginTop: 2 },
  stepTitle: { marginTop: 10, color: palette.primaryText },
  segments: { marginTop: 16 },
  block: { marginTop: 22 },
  deliveredHead: { alignItems: "center", gap: 8 },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    boxShadow: "0 12px 28px rgba(31, 138, 83, 0.3)",
  },
  rate: { alignItems: "center", gap: 10, marginVertical: 14 },
  card: {
    marginTop: 8,
    padding: 16,
    gap: 10,
    borderRadius: radii.xl,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  line: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  qty: { width: 26, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.line, marginVertical: 4 },
  infoCard: { marginTop: 14 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.sunken, alignItems: "center", justifyContent: "center" },
  demo: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, paddingHorizontal: 4 },
  brandLine: { marginTop: 18, color: palette.faint },
});
