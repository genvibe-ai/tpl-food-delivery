import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RestaurantRow } from "@/components/RestaurantCard";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Photo } from "@/components/ui/Photo";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { categories, copy, fonts, palette, radii } from "@/constants/content";
import { search } from "@/lib/catalog";
import { money } from "@/lib/format";
import { GUTTER, useAppWidth, useTabScreenPadding } from "@/lib/layout";
import { useStore } from "@/lib/store";

export default function SearchScreen() {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottom = useTabScreenPadding();
  const width = useAppWidth();
  const input = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const results = useMemo(() => search(query), [query]);
  const recent = useStore((s) => s.recentSearches);
  const addRecent = useStore((s) => s.addRecentSearch);
  const clearRecent = useStore((s) => s.clearRecentSearches);
  const tile = (width - GUTTER * 2 - 12) / 2;

  // Home's search field opens this tab with ?focus=1.
  useEffect(() => {
    if (focus !== "1") return;
    const timer = setTimeout(() => input.current?.focus(), 350);
    router.setParams({ focus: undefined });
    return () => clearTimeout(timer);
  }, [focus, router]);

  const pick = (term: string) => {
    setQuery(term);
    addRecent(term);
  };
  const s = copy.search;
  const nothing = query.trim() && results.restaurants.length === 0 && results.dishes.length === 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + 18 }]}>
        <Text variant="title" accessibilityRole="header">
          {s.title}
        </Text>
        <View style={styles.field}>
          <Icon name="search" size={20} color={palette.primary} strokeWidth={2.4} />
          <TextInput
            ref={input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => addRecent(query)}
            placeholder={s.placeholder}
            placeholderTextColor={palette.faint}
            returnKeyType="search"
            autoCorrect={false}
            style={styles.input}
            accessibilityLabel={s.placeholder}
            testID="search-input"
          />
          {query ? <IconButton icon="close" label={s.clear} variant="soft" size={34} onPress={() => setQuery("")} /> : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {!query.trim() ? (
          <Animated.View entering={FadeIn.duration(250)}>
            {recent.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text variant="subheading">{s.recent}</Text>
                  <Tap label={s.clearRecent} onPress={clearRecent}>
                    <Text variant="label" color={palette.primaryText}>
                      {s.clearRecent}
                    </Text>
                  </Tap>
                </View>
                <View style={styles.chips}>
                  {recent.map((term) => (
                    <Chip
                      key={term}
                      size="sm"
                      label={term}
                      onPress={() => pick(term)}
                      leading={<Icon name="history" size={15} color={palette.muted} />}
                      style={styles.chipLead}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text variant="subheading" style={styles.sectionTitle}>
                {s.popular}
              </Text>
              <View style={styles.chips}>
                {s.popularTerms.map((term) => (
                  <Chip
                    key={term}
                    size="sm"
                    label={term}
                    onPress={() => pick(term)}
                    leading={<Icon name="flame" size={15} color={palette.primary} />}
                    style={styles.chipLead}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="subheading" style={styles.sectionTitle}>
                {s.cuisines}
              </Text>
              <View style={styles.grid}>
                {categories.map((c, i) => (
                  <Animated.View key={c.id} entering={FadeInDown.delay(i * 40).duration(380)}>
                    <Tap label={c.label} onPress={() => pick(c.label)} pressedScale={0.97} style={[styles.tile, { width: tile }]}>
                      <Photo name={c.photo} style={StyleSheet.absoluteFill} decorative />
                      <LinearGradient
                        colors={["rgba(20,14,11,0)", "rgba(20,14,11,0.62)"]}
                        locations={[0.35, 1]}
                        style={StyleSheet.absoluteFill}
                      />
                      <Text variant="subheading" color="#FFFFFF" style={styles.tileLabel}>
                        {c.label}
                      </Text>
                    </Tap>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>
        ) : null}

        {results.restaurants.length > 0 ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.section}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {s.restaurants}
            </Text>
            <View style={styles.card}>
              {results.restaurants.map((r, i) => (
                <View key={r.id} style={i > 0 ? styles.divided : null}>
                  <RestaurantRow restaurant={r} />
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {results.dishes.length > 0 ? (
          <Animated.View entering={FadeIn.duration(200)} style={styles.section}>
            <Text variant="subheading" style={styles.sectionTitle}>
              {s.dishes}
            </Text>
            <View style={styles.card}>
              {results.dishes.map(({ dish, restaurant }, i) => (
                <Tap
                  key={`${restaurant.id}-${dish.id}`}
                  label={`${dish.name}, ${restaurant.name}, ${money(dish.price)}`}
                  onPress={() => {
                    addRecent(query);
                    router.push({ pathname: "/restaurant/[id]", params: { id: restaurant.id, dish: dish.id } });
                  }}
                  pressedScale={0.99}
                  style={[styles.dish, i > 0 ? styles.divided : null]}
                >
                  {dish.photo ? (
                    <Photo name={dish.photo} style={styles.dishPhoto} decorative />
                  ) : (
                    <View style={[styles.dishPhoto, styles.dishTint]}>
                      <Icon name="utensils" size={20} color={palette.primaryText} />
                    </View>
                  )}
                  <View style={styles.flex}>
                    <Text variant="strong" numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                  </View>
                  <Text variant="price">{money(dish.price)}</Text>
                </Tap>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {nothing ? (
          <View style={styles.nothing}>
            <View style={styles.nothingIcon}>
              <Icon name="search" size={28} color={palette.primary} />
            </View>
            <Text variant="heading" align="center">
              {s.noResultsTitle(query.trim())}
            </Text>
            <Text variant="caption" align="center">
              {s.noResultsBody}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  flex: { flex: 1 },
  top: { paddingHorizontal: GUTTER, paddingBottom: 8, gap: 14 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 56,
    paddingLeft: 18,
    paddingRight: 11,
    borderRadius: 28,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
    boxShadow: "0 8px 22px rgba(34, 27, 24, 0.07)",
  },
  input: { flex: 1, height: "100%", fontFamily: fonts.medium, fontSize: 16, color: palette.ink, outlineWidth: 0 },
  section: { marginTop: 22, paddingHorizontal: GUTTER },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chipLead: { paddingLeft: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { height: 112, borderRadius: radii.lg, overflow: "hidden", justifyContent: "flex-end", backgroundColor: palette.sunken },
  tileLabel: { margin: 14 },
  card: {
    paddingHorizontal: 14,
    borderRadius: radii.xl,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  divided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line },
  dish: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  dishPhoto: { width: 52, height: 52, borderRadius: 16 },
  dishTint: { backgroundColor: palette.tint, alignItems: "center", justifyContent: "center" },
  nothing: { alignItems: "center", gap: 8, paddingHorizontal: 40, paddingTop: 48 },
  nothingIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
});
