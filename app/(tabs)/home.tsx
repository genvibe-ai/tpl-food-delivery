import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryChips, type CategoryFilter } from "@/components/CategoryChips";
import { OrderAgainCard } from "@/components/OrderAgainCard";
import { PromoCarousel } from "@/components/PromoCarousel";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Photo } from "@/components/ui/Photo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, palette, restaurants, user, type PhotoKey } from "@/constants/content";
import { categoryLabel } from "@/lib/catalog";
import { initials } from "@/lib/format";
import { GUTTER, useAppWidth, useTabScreenPadding } from "@/lib/layout";
import { useStore, type Order } from "@/lib/store";

type Filters = { fast: boolean; free: boolean; top: boolean };
const NO_FILTERS: Filters = { fast: false, free: false, top: false };

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const width = useAppWidth();
  const bottom = useTabScreenPadding();
  const address = useStore((s) => s.address);
  const orders = useStore((s) => s.orders);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const hour = new Date().getHours();
  const browsing = category === "all" && !filters.fast && !filters.free && !filters.top;

  const list = useMemo(
    () =>
      restaurants.filter(
        (r) =>
          (category === "all" || r.categories.includes(category)) &&
          (!filters.fast || r.etaMax <= 25) &&
          (!filters.free || r.freeDeliveryOver !== undefined || r.deliveryFee < 1) &&
          (!filters.top || r.rating >= 4.8),
      ),
    [category, filters],
  );

  // The latest order from each restaurant, for "Order again".
  const again = useMemo(() => {
    const seen = new Set<string>();
    const result: Order[] = [];
    for (const o of orders) {
      if (seen.has(o.restaurantId) || o.deliveredAt > Date.now()) continue;
      seen.add(o.restaurantId);
      result.push(o);
    }
    return result.slice(0, 4);
  }, [orders]);

  const featured = restaurants.filter((r) => r.featured);
  const heroDish: PhotoKey = hour >= 5 && hour < 11 ? "toast" : hour >= 11 && hour < 16 ? "poke" : "ramen";

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address and avatar */}
        <View style={styles.topBar}>
          <Tap label={`${copy.home.deliverTo} ${address.line1}`} onPress={() => router.push("/address")} style={styles.address}>
            <View style={styles.pin}>
              <Icon name="pin" size={18} color={palette.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.addressText}>
              <Text variant="micro">{copy.home.deliverTo}</Text>
              <View style={styles.addressRow}>
                <Text variant="strong" numberOfLines={1} style={styles.addressLine}>
                  {address.line1}
                </Text>
                <Icon name="chevronDown" size={16} color={palette.ink} strokeWidth={2.6} />
              </View>
            </View>
          </Tap>
          <Tap label={copy.tabs.profile} onPress={() => router.navigate("/profile")} pressedScale={0.92} style={styles.avatar}>
            <Text variant="strong" color={palette.butterInk}>
              {initials(user.firstName, user.lastName)}
            </Text>
          </Tap>
        </View>

        {/* Greeting with a slowly turning plate */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <View style={styles.heroText}>
            <Text variant="bodyMedium" color={palette.muted}>
              {copy.home.greeting(user.firstName, hour)}
            </Text>
            <Text variant="display" style={styles.heroTitle} accessibilityRole="header">
              {copy.home.title(hour)}
            </Text>
          </View>
          <TurningPlate photo={heroDish} size={Math.min(124, width * 0.31)} />
        </Animated.View>

        {/* Search */}
        <Tap
          label={copy.home.searchPlaceholder}
          onPress={() => router.navigate({ pathname: "/search", params: { focus: "1" } })}
          pressedScale={0.985}
          style={styles.search}
        >
          <Icon name="search" size={20} color={palette.primary} strokeWidth={2.4} />
          <Text variant="bodyMedium" color={palette.muted} style={styles.searchText} numberOfLines={1}>
            {copy.home.searchPlaceholder}
          </Text>
          <View style={styles.searchButton}>
            <Icon name="filter" size={18} color="#FFFFFF" strokeWidth={2.2} />
          </View>
        </Tap>

        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <CategoryChips value={category} onChange={setCategory} />
        </Animated.View>

        {browsing ? (
          <>
            <Animated.View entering={FadeInDown.delay(140).duration(520)} style={styles.block}>
              <PromoCarousel />
            </Animated.View>

            {again.length > 0 ? (
              <Animated.View entering={FadeInDown.delay(200).duration(520)} style={styles.block}>
                <SectionHeader title={copy.home.orderAgain} style={styles.gutter} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                  {again.map((order) => (
                    <OrderAgainCard key={order.id} order={order} />
                  ))}
                </ScrollView>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(260).duration(520)} style={styles.block}>
              <SectionHeader title={copy.home.featured} style={styles.gutter} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
                {featured.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} width={Math.min(300, width - 64)} coverHeight={172} />
                ))}
              </ScrollView>
            </Animated.View>
          </>
        ) : null}

        {/* All restaurants, filterable */}
        <View style={styles.block}>
          <SectionHeader
            title={category === "all" ? copy.home.allRestaurants : categoryLabel(category)}
            detail={copy.home.openNow(list.length)}
            style={styles.gutter}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.hRow, styles.filters]}>
            {(Object.keys(copy.home.filters) as (keyof Filters)[]).map((key) => (
              <Chip
                key={key}
                size="sm"
                role="checkbox"
                label={copy.home.filters[key]}
                selected={filters[key]}
                onPress={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              />
            ))}
          </ScrollView>
          <View style={styles.list}>
            {list.map((r, i) => (
              <Animated.View
                key={`${category}-${r.id}`}
                entering={FadeInDown.delay(Math.min(i, 4) * 60).duration(420)}
                layout={LinearTransition.duration(240)}
              >
                <RestaurantCard restaurant={r} coverHeight={Math.round((width - GUTTER * 2) * 0.5)} />
              </Animated.View>
            ))}
            {list.length === 0 ? (
              <View style={styles.empty}>
                <Text variant="subheading" align="center">
                  {copy.home.noMatchTitle}
                </Text>
                <Text variant="caption" align="center">
                  {copy.home.noMatchBody}
                </Text>
                <Button
                  title={copy.home.clearFilters}
                  variant="soft"
                  size="sm"
                  onPress={() => {
                    setFilters(NO_FILTERS);
                    setCategory("all");
                  }}
                  style={styles.emptyButton}
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** A dish photo on a plate that turns very slowly (still with Reduce Motion). */
function TurningPlate({ photo, size }: { photo: PhotoKey; size: number }) {
  const reduced = useReducedMotion();
  const turn = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    turn.set(withRepeat(withTiming(360, { duration: 90_000, easing: Easing.linear }), -1, false));
  }, [reduced, turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get()}deg` }] }));
  return (
    <View style={[styles.plateWrap, { width: size, height: size }]}>
      <View style={[styles.plateGlow, { width: size, height: size, borderRadius: size / 2 }]} />
      <Animated.View style={style}>
        <Photo name={photo} style={{ width: size, height: size, borderRadius: size / 2 }} decorative />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  gutter: { paddingHorizontal: GUTTER },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, gap: 12 },
  address: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  pin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: { flexShrink: 1 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  addressLine: { flexShrink: 1, fontSize: 16 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(34, 27, 24, 0.10)",
  },
  hero: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, marginTop: 22, gap: 12 },
  heroText: { flex: 1 },
  heroTitle: { marginTop: 4 },
  plateWrap: { alignItems: "center", justifyContent: "center", marginRight: -8 },
  plateGlow: { position: "absolute", backgroundColor: palette.primarySoft, transform: [{ scale: 1.12 }] },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    marginHorizontal: GUTTER,
    marginTop: 20,
    marginBottom: 16,
    paddingLeft: 18,
    paddingRight: 7,
    borderRadius: 28,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 8px 22px rgba(34, 27, 24, 0.07)",
  },
  searchText: { flex: 1 },
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  block: { marginTop: 26 },
  hRow: { paddingHorizontal: GUTTER, gap: 14, paddingTop: 14, paddingBottom: 4 },
  filters: { gap: 8, paddingTop: 12 },
  list: { paddingHorizontal: GUTTER, gap: 22, marginTop: 14 },
  empty: { alignItems: "center", gap: 6, paddingVertical: 28 },
  emptyButton: { marginTop: 10 },
});
