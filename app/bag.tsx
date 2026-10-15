import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Totals } from "@/components/Totals";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Mark } from "@/components/ui/Mark";
import { Photo } from "@/components/ui/Photo";
import { Stepper } from "@/components/ui/Stepper";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, fonts, palette, radii, tipRates } from "@/constants/content";
import { addDishToBag } from "@/lib/actions";
import { suggestionsFor } from "@/lib/catalog";
import { etaRange, money } from "@/lib/format";
import { GUTTER } from "@/lib/layout";
import { EASE_OUT } from "@/lib/motion";
import { choiceSummary, findPromo, unitPrice } from "@/lib/pricing";
import { useBag, useBagTotals, useStore } from "@/lib/store";
import { toast, useUI } from "@/lib/ui";

export default function BagScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurant, lines } = useBag();
  const totals = useBagTotals();
  const setQty = useStore((s) => s.setQty);
  const clearBag = useStore((s) => s.clearBag);
  const tipRate = useStore((s) => s.tipRate);
  const setTipRate = useStore((s) => s.setTipRate);
  const promoCode = useStore((s) => s.promoCode);
  const setPromo = useStore((s) => s.setPromo);
  const confirm = useUI((s) => s.confirm);
  const [code, setCode] = useState("");
  const [promoError, setPromoError] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/home"));
  const promo = findPromo(promoCode);

  if (!restaurant || lines.length === 0)
    return (
      <View style={styles.screen}>
        <ScreenHeader title={copy.bag.title} onBack={close} backIcon="chevronDown" />
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="bag"
            title={copy.bag.emptyTitle}
            body={copy.bag.emptyBody}
            action={copy.bag.emptyCta}
            onAction={() => router.dismissTo("/home")}
          />
        </View>
      </View>
    );

  const suggestions = suggestionsFor(
    restaurant,
    lines.map((l) => l.dishId),
  );
  const threshold = restaurant.freeDeliveryOver;

  const applyCode = () => {
    const found = findPromo(code);
    if (!found) {
      setPromoError(true);
      return;
    }
    setPromo(found.code);
    setPromoError(false);
    setCode("");
    toast(copy.toasts.promoApplied(found.code), "tag");
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={copy.bag.title}
        onBack={close}
        backIcon="chevronDown"
        right={
          <Tap
            label={copy.bag.clear}
            onPress={() =>
              confirm({
                title: copy.dialogs.clearBag.title,
                body: copy.dialogs.clearBag.body,
                confirmLabel: copy.dialogs.clearBag.confirm,
                destructive: true,
                onConfirm: clearBag,
              })
            }
            style={styles.clear}
          >
            <Text variant="label" color={palette.primaryText}>
              {copy.bag.clear}
            </Text>
          </Tap>
        }
      />

      <KeyboardAwareScrollView
        bottomOffset={120}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Restaurant */}
        <View style={styles.restaurant}>
          <Mark restaurant={restaurant} size={48} />
          <View style={styles.flex}>
            <Text variant="subheading">{restaurant.name}</Text>
            <Text variant="caption">
              {etaRange(restaurant)} · {restaurant.distance}
            </Text>
          </View>
          <Button
            title={copy.bag.addItems}
            icon="plus"
            size="sm"
            variant="soft"
            onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id } })}
          />
        </View>

        {/* Free delivery progress */}
        {threshold ? (
          <View style={styles.progressCard}>
            <View style={styles.progressHead}>
              <Icon
                name={totals.deliveryWaived ? "checkCircle" : "bike"}
                size={18}
                color={totals.deliveryWaived ? palette.success : palette.butterInk}
                strokeWidth={2.3}
              />
              <Text variant="strong" color={totals.deliveryWaived ? palette.success : palette.butterInk} style={styles.flex}>
                {totals.deliveryWaived ? copy.bag.freeDeliveryUnlocked : copy.bag.freeDeliveryHint(money(totals.freeDeliveryGap))}
              </Text>
            </View>
            <View style={styles.track}>
              <Animated.View
                layout={LinearTransition.duration(400).easing(EASE_OUT)}
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(100, (totals.subtotal / threshold) * 100)}%`,
                    backgroundColor: totals.deliveryWaived ? palette.success : palette.primary,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

        {/* Items */}
        <View style={styles.items}>
          {lines.map((line) => (
            <Animated.View
              key={line.id}
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(180)}
              layout={LinearTransition.duration(260)}
              style={styles.line}
            >
              {line.dish.photo ? (
                <Photo name={line.dish.photo} style={styles.linePhoto} decorative />
              ) : (
                <View style={[styles.linePhoto, styles.linePlaceholder]}>
                  <Icon name="utensils" size={24} color={palette.primaryText} />
                </View>
              )}
              <View style={styles.flex}>
                <Text variant="strong" numberOfLines={2}>
                  {line.dish.name}
                </Text>
                {choiceSummary(line.dish, line.choices) ? (
                  <Text variant="caption" numberOfLines={2}>
                    {choiceSummary(line.dish, line.choices)}
                  </Text>
                ) : null}
                {line.note ? (
                  <Text variant="caption" color={palette.inkSoft} numberOfLines={1} style={styles.note}>
                    “{line.note}”
                  </Text>
                ) : null}
                <Text variant="price" style={styles.linePrice}>
                  {money(unitPrice(line.dish, line.choices) * line.qty)}
                </Text>
              </View>
              <Stepper value={line.qty} onChange={(n) => setQty(line.id, n)} canRemove min={0} name={line.dish.name} />
            </Animated.View>
          ))}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 ? (
          <View style={styles.block}>
            <Text variant="heading" style={styles.blockTitle}>
              {copy.bag.completeMeal}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
              {suggestions.map((d) => (
                <View key={d.id} style={styles.suggestion}>
                  {d.photo ? <Photo name={d.photo} style={styles.suggestionPhoto} decorative /> : null}
                  <Text variant="strong" numberOfLines={2} style={styles.suggestionName}>
                    {d.name}
                  </Text>
                  {!d.photo ? (
                    <Text variant="caption" numberOfLines={2}>
                      {d.description}
                    </Text>
                  ) : null}
                  <View style={styles.suggestionFoot}>
                    <Text variant="price">{money(d.price)}</Text>
                    <Tap
                      label={`${copy.dish.add(1)}: ${d.name}`}
                      onPress={() => addDishToBag(restaurant.id, { dishId: d.id, qty: 1, choices: {} }, d.name)}
                      pressedScale={0.88}
                      style={styles.suggestionAdd}
                    >
                      <Icon name="plus" size={18} color="#FFFFFF" strokeWidth={2.6} />
                    </Tap>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Promo code */}
        <View style={styles.block}>
          <Text variant="heading" style={styles.blockTitle}>
            {copy.bag.promoTitle}
          </Text>
          {promo ? (
            <View style={styles.promoApplied}>
              <Icon name="percent" size={20} color={palette.success} strokeWidth={2.2} />
              <Text variant="strong" color={palette.success} style={styles.flex}>
                {copy.bag.promoApplied(promo.code, promo.label)}
              </Text>
              <Tap label={copy.bag.removePromo} onPress={() => setPromo(null)}>
                <Text variant="label" color={palette.muted}>
                  {copy.bag.removePromo}
                </Text>
              </Tap>
            </View>
          ) : (
            <>
              <View style={[styles.promoField, promoError ? styles.promoFieldError : null]}>
                <Icon name="tag" size={18} color={palette.muted} />
                <TextInput
                  value={code}
                  onChangeText={(t) => {
                    setCode(t.toUpperCase());
                    setPromoError(false);
                  }}
                  onSubmitEditing={applyCode}
                  placeholder={copy.bag.promoPlaceholder}
                  placeholderTextColor={palette.faint}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  style={styles.promoInput}
                  accessibilityLabel={copy.bag.promoTitle}
                />
                <Button title={copy.bag.apply} size="sm" variant="dark" onPress={applyCode} disabled={!code.trim()} />
              </View>
              {promoError ? (
                <Text variant="caption" color={palette.primaryText} style={styles.promoErrorText}>
                  {copy.bag.promoInvalid}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Tip */}
        <View style={styles.block}>
          <Text variant="heading">{copy.bag.tipTitle}</Text>
          <Text variant="caption" style={styles.tipNote}>
            {copy.bag.tipNote}
          </Text>
          <View style={styles.tips} accessibilityRole="radiogroup">
            {tipRates.map((rate) => {
              const on = rate === tipRate;
              return (
                <Tap
                  key={rate}
                  role="radio"
                  selected={on}
                  label={rate === 0 ? copy.bag.noTip : `${Math.round(rate * 100)}%, ${money(totals.subtotal * rate)}`}
                  onPress={() => setTipRate(rate)}
                  pressedScale={0.95}
                  style={[styles.tip, on ? styles.tipOn : null]}
                >
                  <Text variant="strong" color={on ? "#FFFFFF" : palette.ink}>
                    {rate === 0 ? copy.bag.noTip : `${Math.round(rate * 100)}%`}
                  </Text>
                  {rate > 0 ? (
                    <Text variant="caption" color={on ? "rgba(255,255,255,0.75)" : palette.muted} style={styles.tipAmount}>
                      {money(totals.subtotal * rate)}
                    </Text>
                  ) : null}
                </Tap>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.block, styles.summary]}>
          <Totals totals={totals} />
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Button
          title={copy.bag.checkout}
          trailing={money(totals.total)}
          onPress={() => router.push("/checkout")}
          testID="go-to-checkout"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  emptyWrap: { flex: 1, justifyContent: "center", paddingBottom: 80 },
  flex: { flex: 1 },
  clear: { paddingVertical: 8, paddingHorizontal: 4 },
  content: { paddingHorizontal: GUTTER, paddingTop: 6 },
  restaurant: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  progressCard: { marginTop: 12, padding: 14, borderRadius: radii.lg, backgroundColor: palette.butterSoft, gap: 10 },
  progressHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { height: 8, borderRadius: 4, backgroundColor: "rgba(90, 67, 0, 0.12)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  items: { marginTop: 8 },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  linePhoto: { width: 68, height: 68, borderRadius: 18 },
  linePlaceholder: { backgroundColor: palette.tint, alignItems: "center", justifyContent: "center" },
  note: { fontStyle: "italic" },
  linePrice: { marginTop: 4 },
  block: { marginTop: 28 },
  blockTitle: { marginBottom: 12 },
  suggestions: { gap: 12, paddingRight: 8 },
  suggestion: {
    width: 156,
    minHeight: 124,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    gap: 2,
  },
  suggestionPhoto: { width: "100%", height: 84, borderRadius: 14, marginBottom: 6 },
  suggestionName: { fontSize: 14, lineHeight: 18 },
  suggestionFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 },
  suggestionAdd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  promoField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 28,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  promoFieldError: { borderColor: palette.primary },
  promoInput: {
    flex: 1,
    height: "100%",
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: palette.ink,
    letterSpacing: 0.5,
    outlineWidth: 0,
  },
  promoErrorText: { marginTop: 8, marginLeft: 16 },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: palette.successSoft,
  },
  tipNote: { marginTop: 2 },
  tips: { flexDirection: "row", gap: 8, marginTop: 14 },
  tip: {
    flex: 1,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
  },
  tipOn: { backgroundColor: palette.ink, borderColor: palette.ink },
  tipAmount: { fontSize: 12, lineHeight: 15 },
  summary: {
    padding: 18,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
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
  },
});
