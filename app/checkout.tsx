import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapIllustration } from "@/components/MapIllustration";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Totals } from "@/components/Totals";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Mark } from "@/components/ui/Mark";
import { SelectMark } from "@/components/ui/Select";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import {
  copy,
  deliveryOptions,
  deliveryTiming,
  fonts,
  palette,
  paymentMethods,
  radii,
  type DeliveryOptionId,
} from "@/constants/content";
import { clock, etaRange, fill, money } from "@/lib/format";
import { haptics } from "@/lib/haptics";
import { GUTTER } from "@/lib/layout";
import { useBag, useBagTotals, useStore } from "@/lib/store";

const OPTION_ICONS: Record<DeliveryOptionId, IconName> = { standard: "clock", priority: "zap", schedule: "calendar" };
const PAYMENT_ICONS: Record<string, IconName> = { card: "card", wallet: "wallet", cash: "cash" };

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurant, lines, count } = useBag();
  const totals = useBagTotals();
  const address = useStore((s) => s.address);
  const dropoff = useStore((s) => s.dropoff);
  const setDropoff = useStore((s) => s.setDropoff);
  const courierNote = useStore((s) => s.courierNote);
  const setCourierNote = useStore((s) => s.setCourierNote);
  const optionId = useStore((s) => s.deliveryOptionId);
  const scheduleAt = useStore((s) => s.scheduleAt);
  const setDelivery = useStore((s) => s.setDelivery);
  const paymentId = useStore((s) => s.paymentId);
  const setPayment = useStore((s) => s.setPayment);
  const placeOrder = useStore((s) => s.placeOrder);
  const [placing, setPlacing] = useState(false);

  // Scheduled slots: the next few half-hours after the kitchen could deliver.
  const slots = useMemo(() => {
    const step = deliveryTiming.slotMinutes * 60_000;
    const earliest = Date.now() + ((restaurant?.etaMax ?? 30) + 15) * 60_000;
    const first = Math.ceil(earliest / step) * step;
    return Array.from({ length: deliveryTiming.slotCount }, (_, i) => first + i * step);
  }, [restaurant?.etaMax]);

  const back = () => (router.canGoBack() ? router.back() : router.replace("/bag"));

  if (!restaurant || lines.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={copy.checkout.title} onBack={back} />
        <View style={styles.missing}>
          <Text variant="heading" align="center">
            {copy.bag.emptyTitle}
          </Text>
          <Button title={copy.bag.emptyCta} size="md" onPress={() => router.dismissTo("/home")} />
        </View>
      </View>
    );
  }

  const place = () => {
    setPlacing(true);
    haptics.medium();
    setTimeout(() => {
      const id = placeOrder();
      setPlacing(false);
      if (!id) return;
      haptics.success();
      const tracking = { pathname: "/order/[id]", params: { id } } as const;
      if (Platform.OS === "web") {
        // The browser history cannot pop back to Home and push the order in one go
        // (expo-router batches both and the page lands on the restaurant), so on the
        // web the tracking screen takes checkout's place; its Close goes to the tabs.
        router.replace(tracking);
      } else {
        router.dismissTo("/home");
        router.push(tracking);
      }
    }, 900);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={copy.checkout.title} onBack={back} />
      <KeyboardAwareScrollView
        bottomOffset={140}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address */}
        <Animated.View entering={FadeInDown.duration(380)}>
          <Text variant="heading" style={styles.title}>
            {copy.checkout.deliverTo}
          </Text>
          <View style={styles.card}>
            <MapIllustration mode="pin" style={styles.map} />
            <View style={styles.addressRow}>
              <View style={styles.iconCircle}>
                <Icon name={address.label === "Work" ? "briefcase" : "home"} size={18} color={palette.ink} />
              </View>
              <View style={styles.flex}>
                <Text variant="strong">{address.line1}</Text>
                <Text variant="caption">{address.line2}</Text>
              </View>
              <Tap label={copy.checkout.change} onPress={() => router.push("/address")} style={styles.change}>
                <Text variant="label" color={palette.primaryText}>
                  {copy.checkout.change}
                </Text>
              </Tap>
            </View>
            <View style={styles.dropoff}>
              {(["door", "hand"] as const).map((d) => (
                <Chip
                  key={d}
                  size="sm"
                  role="radio"
                  label={copy.checkout.dropoff[d]}
                  selected={dropoff === d}
                  onPress={() => setDropoff(d)}
                  style={styles.flex}
                  leading={
                    <View style={styles.chipIcon}>
                      <Icon name={d === "door" ? "door" : "hand"} size={16} color={dropoff === d ? "#FFFFFF" : palette.ink} />
                    </View>
                  }
                />
              ))}
            </View>
            <View style={styles.noteField}>
              <Icon name="note" size={18} color={palette.muted} />
              <TextInput
                value={courierNote}
                onChangeText={setCourierNote}
                placeholder={copy.checkout.notePlaceholder}
                placeholderTextColor={palette.faint}
                style={styles.noteInput}
                maxLength={120}
                accessibilityLabel={copy.checkout.notePlaceholder}
              />
            </View>
          </View>
        </Animated.View>

        {/* Delivery time */}
        <Animated.View entering={FadeInDown.delay(60).duration(380)} style={styles.section}>
          <Text variant="heading" style={styles.title}>
            {copy.checkout.time}
          </Text>
          <View style={[styles.card, styles.list]} accessibilityRole="radiogroup">
            {deliveryOptions.map((option, i) => {
              const on = optionId === option.id;
              return (
                <View key={option.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <Tap
                    label={option.title}
                    role="radio"
                    selected={on}
                    pressedScale={0.99}
                    onPress={() => setDelivery(option.id, option.id === "schedule" ? scheduleAt ?? slots[0] : null)}
                    style={styles.optionRow}
                  >
                    <View style={[styles.iconCircle, on ? styles.iconCircleOn : null]}>
                      <Icon name={OPTION_ICONS[option.id]} size={18} color={on ? palette.primary : palette.ink} />
                    </View>
                    <View style={styles.flex}>
                      <Text variant="strong">{option.title}</Text>
                      <Text variant="caption">{fill(option.detail, { eta: etaRange(restaurant) })}</Text>
                    </View>
                    {option.fee > 0 ? (
                      <Text variant="label" color={palette.muted}>
                        +{money(option.fee)}
                      </Text>
                    ) : null}
                    <SelectMark selected={on} />
                  </Tap>
                  {option.id === "schedule" && on ? (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slots}>
                        {slots.map((slot) => (
                          <Chip
                            key={slot}
                            size="sm"
                            role="radio"
                            label={`${clock(slot)}`}
                            selected={scheduleAt === slot}
                            onPress={() => setDelivery("schedule", slot)}
                          />
                        ))}
                      </ScrollView>
                    </Animated.View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Payment */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)} style={styles.section}>
          <Text variant="heading" style={styles.title}>
            {copy.checkout.payment}
          </Text>
          <View style={[styles.card, styles.list]} accessibilityRole="radiogroup">
            {paymentMethods.map((method, i) => {
              const on = paymentId === method.id;
              return (
                <View key={method.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <Tap
                    label={`${method.title}, ${method.detail}`}
                    role="radio"
                    selected={on}
                    pressedScale={0.99}
                    onPress={() => setPayment(method.id)}
                    style={styles.optionRow}
                  >
                    <View style={[styles.iconCircle, on ? styles.iconCircleOn : null]}>
                      <Icon name={PAYMENT_ICONS[method.icon] ?? "card"} size={18} color={on ? palette.primary : palette.ink} />
                    </View>
                    <View style={styles.flex}>
                      <Text variant="strong">{method.title}</Text>
                      <Text variant="caption">{method.detail}</Text>
                    </View>
                    <SelectMark selected={on} />
                  </Tap>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(180).duration(380)} style={styles.section}>
          <Text variant="heading" style={styles.title}>
            {copy.checkout.summary}
          </Text>
          <View style={[styles.card, styles.summary]}>
            <View style={styles.summaryHead}>
              <Mark restaurant={restaurant} size={36} />
              <Text variant="strong" style={styles.flex}>
                {restaurant.name}
              </Text>
              <Text variant="caption">{copy.common.items(count)}</Text>
            </View>
            {lines.map((line) => (
              <View key={line.id} style={styles.summaryLine}>
                <Text variant="label" color={palette.primaryText} style={styles.qty}>
                  {line.qty}×
                </Text>
                <Text variant="bodyMedium" style={styles.flex} numberOfLines={1}>
                  {line.dish.name}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <Totals totals={totals} />
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title={placing ? copy.checkout.placing : copy.checkout.place}
          trailing={placing ? undefined : money(totals.total)}
          loading={placing}
          onPress={place}
          testID="place-order"
        />
        <View style={styles.demo}>
          <Icon name="shield" size={14} color={palette.muted} />
          <Text variant="caption">{copy.checkout.demoNote}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  missing: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  flex: { flex: 1 },
  content: { paddingHorizontal: GUTTER, paddingTop: 4 },
  title: { marginBottom: 12 },
  section: { marginTop: 28 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(34, 27, 24, 0.05)",
  },
  map: { height: 120 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.sunken,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleOn: { backgroundColor: palette.primarySoft },
  change: { paddingVertical: 6, paddingLeft: 8 },
  dropoff: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  chipIcon: { width: 24, alignItems: "center" },
  noteField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: palette.sunken,
  },
  noteInput: { flex: 1, height: "100%", fontFamily: fonts.medium, fontSize: 15, color: palette.ink, outlineWidth: 0 },
  list: { paddingHorizontal: 16 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: palette.line },
  slots: { gap: 8, paddingBottom: 14, paddingLeft: 52 },
  summary: { padding: 16, gap: 10 },
  summaryHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 },
  summaryLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  qty: { width: 26 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: palette.canvas,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.line,
    gap: 8,
  },
  demo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
});
