import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BagBar } from "@/components/BagBar";
import { DishRow } from "@/components/DishRow";
import { DishSheet } from "@/components/DishSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Mark } from "@/components/ui/Mark";
import { Photo } from "@/components/ui/Photo";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { copy, palette, radii, type Dish } from "@/constants/content";
import { addDishToBag } from "@/lib/actions";
import { getRestaurant } from "@/lib/catalog";
import { etaRange, money } from "@/lib/format";
import { BAG_BAR_HEIGHT, GUTTER } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui";

const COVER = 290;
const TABS = 56;

export default function RestaurantScreen() {
  const { id, dish } = useLocalSearchParams<{ id: string; dish?: string }>();
  const restaurant = getRestaurant(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const header = insets.top + 60;

  const [openDish, setOpenDish] = useState<string | null>(dish ?? null);
  const [active, setActive] = useState(0);
  const [lightStatus, setLightStatus] = useState(true);
  const [stuck, setStuck] = useState(false);
  const favourite = useStore((s) => s.favourites.includes(id));
  const toggleFavourite = useStore((s) => s.toggleFavourite);
  const bag = useStore((s) => s.bag);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const tabsY = useSharedValue(10_000);
  const offsets = useSharedValue<number[]>([]);
  const offsetsJS = useRef<number[]>([]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

  // Highlight the section in view; flip the status bar once the header turns solid.
  useAnimatedReaction(
    () => {
      const y = scrollY.get() + header + TABS + 8;
      let index = 0;
      const list = offsets.get();
      for (let i = 0; i < list.length; i++) if (y >= list[i]) index = i;
      return index;
    },
    (index, previous) => {
      if (index !== previous) scheduleOnRN(setActive, index);
    },
  );
  useAnimatedReaction(
    () => scrollY.get() + header >= tabsY.get(),
    (on, previous) => {
      if (on !== previous) scheduleOnRN(setStuck, on);
    },
  );
  useAnimatedReaction(
    () => scrollY.get() < COVER - header - 40,
    (light, previous) => {
      if (light !== previous) scheduleOnRN(setLightStatus, light);
    },
  );

  const coverStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    return {
      transform: [
        { translateY: y < 0 ? y / 2 : -y * 0.45 },
        { scale: y < 0 ? 1 + -y / COVER : 1 },
      ],
    };
  });
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [COVER - header - 70, COVER - header - 20], [0, 1], Extrapolation.CLAMP),
  }));
  const stickyStyle = useAnimatedStyle(() => {
    const shown = scrollY.get() + header >= tabsY.get();
    return { opacity: shown ? 1 : 0, transform: [{ translateY: shown ? 0 : -8 }] };
  });

  const jumpTo = useCallback(
    (index: number) => {
      const y = offsetsJS.current[index];
      if (y === undefined) return;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - header - TABS + 2), animated: true });
    },
    [scrollRef, header],
  );

  if (!restaurant)
    return (
      <View style={[styles.screen, styles.missing]}>
        <Text variant="heading" align="center">
          {copy.restaurant.notFound}
        </Text>
        <Button title={copy.common.back} variant="soft" size="md" onPress={() => router.back()} />
      </View>
    );

  const inBag = (d: Dish) =>
    bag.restaurantId === restaurant.id ? bag.lines.filter((l) => l.dishId === d.id).reduce((n, l) => n + l.qty, 0) : 0;
  const quickAdd = (d: Dish) => {
    if ((d.groups ?? []).length > 0) setOpenDish(d.id);
    else addDishToBag(restaurant.id, { dishId: d.id, qty: 1, choices: {} }, d.name);
  };
  const hasBag = bag.lines.length > 0;

  const tabs = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {restaurant.sections.map((section, i) => (
        <Tap
          key={section.id}
          label={section.title}
          role="tab"
          selected={i === active}
          pressedScale={0.95}
          onPress={() => jumpTo(i)}
          style={[styles.tab, i === active ? styles.tabActive : null]}
        >
          <Text variant="strong" color={i === active ? "#FFFFFF" : palette.inkSoft}>
            {section.title}
          </Text>
        </Tap>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style={lightStatus ? "light" : "dark"} animated />

      {/* Cover photo behind the scroll view */}
      <Animated.View style={[styles.cover, coverStyle]}>
        <Photo name={restaurant.cover} style={StyleSheet.absoluteFill} priority="high" />
        <LinearGradient
          colors={["rgba(20,14,11,0.45)", "rgba(20,14,11,0)", "rgba(20,14,11,0.2)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (hasBag ? BAG_BAR_HEIGHT + 40 : 32) }}
      >
        <View style={{ height: COVER - 32 }} />
        <View style={styles.sheet}>
          <View style={styles.markRow}>
            <Mark restaurant={restaurant} size={72} ring />
          </View>
          <Text variant="title" accessibilityRole="header">
            {restaurant.name}
          </Text>
          <Text variant="bodyMedium" color={palette.muted} style={styles.cuisine}>
            {restaurant.cuisine} · {restaurant.priceLevel} · {restaurant.distance}
          </Text>

          <View style={styles.stats}>
            <Stat icon="star" value={restaurant.rating.toFixed(1)} label={copy.restaurant.ratings(restaurant.ratingCount)} star />
            <View style={styles.statDivider} />
            <Stat icon="clock" value={etaRange(restaurant)} label={copy.restaurant.statTime} />
            <View style={styles.statDivider} />
            <Stat icon="bike" value={money(restaurant.deliveryFee)} label={copy.restaurant.statFee} />
          </View>

          {restaurant.freeDeliveryOver ? (
            <View style={styles.offer}>
              <View style={styles.offerIcon}>
                <Icon name="tag" size={16} color={palette.butterInk} strokeWidth={2.4} />
              </View>
              <Text variant="strong" color={palette.butterInk} style={styles.offerText}>
                {copy.restaurant.freeOver(money(restaurant.freeDeliveryOver, true))}
              </Text>
            </View>
          ) : null}

          <Text variant="body" color={palette.inkSoft} style={styles.about}>
            {restaurant.about}
          </Text>
        </View>

        <View
          style={styles.tabsInline}
          onLayout={(e: LayoutChangeEvent) => tabsY.set(e.nativeEvent.layout.y)}
        >
          {tabs}
        </View>

        {restaurant.sections.map((section, i) => (
          <View
            key={section.id}
            style={styles.section}
            onLayout={(e: LayoutChangeEvent) => {
              const next = [...offsetsJS.current];
              next[i] = e.nativeEvent.layout.y;
              offsetsJS.current = next;
              offsets.set(next);
            }}
          >
            <Text variant="heading" accessibilityRole="header" style={styles.sectionTitle}>
              {section.title}
            </Text>
            {section.dishes.map((d) => (
              <DishRow key={d.id} dish={d} inBag={inBag(d)} onOpen={() => setOpenDish(d.id)} onAdd={() => quickAdd(d)} />
            ))}
          </View>
        ))}
      </Animated.ScrollView>

      {/* Solid header that fades in, with sticky section tabs under it */}
      <Animated.View style={[styles.header, { height: header }, headerStyle]} pointerEvents="none">
        <Text variant="subheading" numberOfLines={1} style={[styles.headerTitle, { marginTop: insets.top }]}>
          {restaurant.name}
        </Text>
      </Animated.View>
      <Animated.View
        style={[styles.sticky, { top: header }, stickyStyle]}
        pointerEvents={stuck ? "auto" : "none"}
        accessibilityElementsHidden={!stuck}
        importantForAccessibility={stuck ? "auto" : "no-hide-descendants"}
      >
        {tabs}
      </Animated.View>

      <View style={[styles.topButtons, { top: insets.top + 8 }]}>
        <IconButton icon="back" label={copy.common.back} onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))} />
        <View style={styles.topRight}>
          <IconButton icon="share" label={copy.restaurant.share} onPress={() => toast(copy.toasts.shared, "share")} />
          <IconButton
            icon="heart"
            label={copy.restaurant.favourite}
            iconColor={favourite ? palette.primary : palette.ink}
            fill={favourite ? palette.primary : "none"}
            onPress={() => toast(toggleFavourite(restaurant.id) ? copy.toasts.favourited : copy.toasts.unfavourited, "heart")}
          />
        </View>
      </View>

      <BagBar style={[styles.bagBar, { bottom: Math.max(insets.bottom, 14) }]} />

      <DishSheet restaurant={restaurant} dishId={openDish} onClose={() => setOpenDish(null)} />
    </View>
  );
}

function Stat({ icon, value, label, star }: { icon: "star" | "clock" | "bike"; value: string; label: string; star?: boolean }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statValue}>
        <Icon
          name={icon}
          size={15}
          color={star ? palette.butterDeep : palette.ink}
          fill={star ? palette.butterDeep : "none"}
          strokeWidth={star ? 1.6 : 2.3}
        />
        <Text variant="strong">{value}</Text>
      </View>
      <Text variant="caption" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  missing: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  cover: { position: "absolute", top: 0, left: 0, right: 0, height: COVER, backgroundColor: palette.sunken },
  sheet: {
    backgroundColor: palette.canvas,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderCurve: "continuous",
    paddingHorizontal: GUTTER,
    paddingBottom: 8,
  },
  markRow: { marginTop: -40, marginBottom: 12 },
  cuisine: { marginTop: 4 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 6px 18px rgba(34, 27, 24, 0.05)",
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { flexDirection: "row", alignItems: "center", gap: 5 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: palette.lineStrong },
  offer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 10,
    borderRadius: radii.md,
    backgroundColor: palette.butterSoft,
  },
  offerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.butter,
    alignItems: "center",
    justifyContent: "center",
  },
  offerText: { flex: 1, fontSize: 14 },
  about: { marginTop: 14 },
  tabsInline: { marginTop: 10, backgroundColor: palette.canvas },
  tabs: { paddingHorizontal: GUTTER, gap: 8, height: TABS, alignItems: "center" },
  tab: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: "center",
    backgroundColor: palette.sunken,
  },
  tabActive: { backgroundColor: palette.ink },
  section: { paddingHorizontal: GUTTER, paddingTop: 18 },
  sectionTitle: { marginBottom: 2 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: palette.canvas,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 120,
  },
  headerTitle: { textAlign: "center" },
  sticky: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: palette.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
    boxShadow: "0 8px 16px rgba(34, 27, 24, 0.05)",
  },
  topButtons: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topRight: { flexDirection: "row", gap: 10 },
  bagBar: { position: "absolute", left: 14, right: 14 },
});
