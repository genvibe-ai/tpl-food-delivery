import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { copy, palette, promos, radii } from "@/constants/content";
import { GUTTER, useAppWidth } from "@/lib/layout";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/ui";
import { Photo } from "./ui/Photo";
import { Tap } from "./ui/Tap";
import { Text } from "./ui/Text";

type Promo = (typeof promos)[number];

const TONES = {
  tomato: { bg: palette.primary, fg: "#FFFFFF", soft: "rgba(255,255,255,0.86)", ctaBg: "transparent", ctaFg: "#FFFFFF", dashed: true },
  butter: { bg: palette.butter, fg: palette.ink, soft: palette.butterInk, ctaBg: palette.ink, ctaFg: "#FFFFFF", dashed: false },
  ink: { bg: palette.ink, fg: "#FFFFFF", soft: "rgba(255,255,255,0.74)", ctaBg: palette.butter, ctaFg: palette.ink, dashed: false },
} as const;

const GAP = 12;

/** Swipeable offers on Home (content.ts `promos`). */
export function PromoCarousel() {
  const width = useAppWidth();
  const cardWidth = width - GUTTER * 2;
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
  });
  const router = useRouter();
  const setPromo = useStore((s) => s.setPromo);

  const open = (promo: Promo) => {
    const action = promo.action;
    if (action.kind === "code") {
      setPromo(action.code);
      toast(copy.toasts.promoSaved(action.code), "tag");
    } else if (action.kind === "restaurant") {
      router.push({ pathname: "/restaurant/[id]", params: { id: action.restaurantId } });
    } else {
      router.push({ pathname: "/restaurant/[id]", params: { id: action.restaurantId, dish: action.dishId } });
    }
  };

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={styles.row}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} width={cardWidth} onPress={() => open(promo)} />
        ))}
      </Animated.ScrollView>
      <View style={styles.dots}>
        {promos.map((promo, i) => (
          <Dot key={promo.id} index={i} x={x} interval={cardWidth + GAP} />
        ))}
      </View>
    </View>
  );
}

function PromoCard({ promo, width, onPress }: { promo: Promo; width: number; onPress: () => void }) {
  const tone = TONES[promo.tone];
  return (
    <Tap
      label={`${promo.eyebrow}. ${promo.title.replace("\n", " ")}. ${promo.body} ${promo.cta}`}
      onPress={onPress}
      pressedScale={0.98}
      style={[styles.card, { width, backgroundColor: tone.bg }]}
    >
      <View style={styles.photoWrap}>
        <View style={[styles.photoRing, { borderColor: promo.tone === "butter" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.16)" }]}>
          <Photo name={promo.photo} style={styles.photo} decorative />
        </View>
      </View>
      <View style={styles.copy}>
        <Text variant="micro" color={tone.soft}>
          {promo.eyebrow}
        </Text>
        <Text variant="title" color={tone.fg} style={styles.title}>
          {promo.title}
        </Text>
        <View style={styles.footer}>
          <Text variant="label" color={tone.soft} style={styles.body} numberOfLines={1}>
            {promo.body}
          </Text>
        </View>
        <View
          style={[
            styles.cta,
            { backgroundColor: tone.ctaBg },
            tone.dashed ? { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.85)" } : null,
          ]}
        >
          <Text variant="label" color={tone.ctaFg} style={styles.ctaText}>
            {promo.cta}
          </Text>
        </View>
      </View>
    </Tap>
  );
}

function Dot({ index, x, interval }: { index: number; x: SharedValue<number>; interval: number }) {
  const style = useAnimatedStyle(() => {
    const t = interpolate(x.get() / interval, [index - 1, index, index + 1], [0, 1, 0], "clamp");
    return {
      width: 6 + t * 14,
      backgroundColor: interpolateColor(t, [0, 1], [palette.lineStrong, palette.ink]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: GUTTER, gap: GAP },
  card: {
    height: 172,
    borderRadius: radii.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    padding: 20,
  },
  copy: { flex: 1, maxWidth: "62%" },
  title: { marginTop: 6, fontSize: 25, lineHeight: 28, letterSpacing: -0.7 },
  footer: { marginTop: "auto" },
  body: { fontSize: 13 },
  cta: { alignSelf: "flex-start", marginTop: 8, height: 30, paddingHorizontal: 12, borderRadius: 15, justifyContent: "center" },
  ctaText: { letterSpacing: 0.4 },
  photoWrap: { position: "absolute", right: -34, bottom: -38 },
  photoRing: { padding: 6, borderRadius: 999, borderWidth: 6, transform: [{ rotate: "-8deg" }] },
  photo: { width: 168, height: 168, borderRadius: 84 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { height: 6, borderRadius: 3 },
});
