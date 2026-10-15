import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AddressPicker } from "@/components/AddressPicker";
import { MapIllustration } from "@/components/MapIllustration";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconButton } from "@/components/ui/IconButton";
import { Logo } from "@/components/ui/Logo";
import { Photo } from "@/components/ui/Photo";
import { Tap } from "@/components/ui/Tap";
import { Text } from "@/components/ui/Text";
import { addresses, copy, courier, palette, radii, type Address, type PhotoKey } from "@/constants/content";
import { haptics } from "@/lib/haptics";
import { GUTTER, useAppWidth } from "@/lib/layout";
import { useStore } from "@/lib/store";

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<0 | 1>(0);
  const setAddress = useStore((s) => s.setAddress);
  const finish = useStore((s) => s.finishOnboarding);

  const done = (address: Address) => {
    setAddress(address);
    finish();
    haptics.success();
    router.replace("/home");
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {step === 0 ? (
        <Welcome onStart={() => setStep(1)} onSkip={() => done(addresses.saved[0])} bottom={insets.bottom} />
      ) : (
        <Location onBack={() => setStep(0)} onPick={done} bottom={insets.bottom} />
      )}
    </View>
  );
}

function Welcome({ onStart, onSkip, bottom }: { onStart: () => void; onSkip: () => void; bottom: number }) {
  const width = useAppWidth();
  const o = copy.onboarding;
  // The collage fills whatever height the text leaves, so short phones still fit.
  const [stage, setStage] = useState(0);
  return (
    <Animated.View exiting={FadeOut.duration(160)} style={styles.flex}>
      <View style={styles.topRow}>
        <Logo size={34} />
        <Tap label={o.skip} onPress={onSkip} style={styles.skip}>
          <Text variant="label" color={palette.inkSoft}>
            {o.skip}
          </Text>
        </Tap>
      </View>

      <View
        style={styles.stage}
        onLayout={(e) => setStage(Math.min(width - 24, e.nativeEvent.layout.height - 8, 440))}
      >
        {stage > 120 ? <Collage size={stage} /> : null}
      </View>

      <View style={[styles.welcomeText, { paddingBottom: Math.max(bottom, 16) + 8 }]}>
        <Animated.View entering={FadeInDown.delay(250).duration(520)}>
          <Text variant="micro" color={palette.primaryText}>
            {o.eyebrow}
          </Text>
          <Text variant="display" style={styles.welcomeTitle} accessibilityRole="header">
            {o.title}
          </Text>
          <Text variant="body" color={palette.muted} style={styles.welcomeBody}>
            {o.body}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(380).duration(520)} style={styles.stats}>
          {o.stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text variant="subheading">{s.value}</Text>
              <Text variant="caption" numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          ))}
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(480).duration(520)}>
          <Button title={o.start} trailing="→" onPress={onStart} testID="get-started" />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/** Plates drifting around a soft tomato blob: the app's signature moment. */
function Collage({ size }: { size: number }) {
  const plates: { photo: PhotoKey; d: number; x: number; y: number; delay: number; drift: number; spin?: boolean }[] = [
    { photo: "ramen", d: 0.5, x: 0.25, y: 0.22, delay: 80, drift: 3400, spin: true },
    { photo: "pizza", d: 0.32, x: 0.02, y: 0.0, delay: 200, drift: 3000 },
    { photo: "burger", d: 0.3, x: 0.68, y: 0.06, delay: 300, drift: 3700 },
    { photo: "poke", d: 0.27, x: 0.05, y: 0.66, delay: 380, drift: 3200 },
    { photo: "dessert", d: 0.22, x: 0.72, y: 0.72, delay: 460, drift: 2800 },
  ];
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View entering={ZoomIn.duration(650)} style={StyleSheet.absoluteFill}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Path
            d="M101 18c26 0 52 9 67 30 16 22 17 52 8 77-9 26-31 48-58 56-27 8-59 3-80-15C18 148 8 118 14 90 20 62 38 37 61 26c12-6 26-8 40-8Z"
            fill={palette.primarySoft}
          />
          <Path d="M152 26a10 10 0 1 1 0 20a10 10 0 0 1 0-20Z" fill={palette.butter} />
          <Path d="M30 150a6 6 0 1 1 0 12a6 6 0 0 1 0-12Z" fill={palette.primary} />
        </Svg>
      </Animated.View>
      {plates.map((p) => (
        <FloatingPlate key={p.photo} {...p} size={size} />
      ))}
      <Animated.View entering={FadeInRight.delay(700).duration(500)} style={[styles.eta, { top: size * 0.5, right: 0 }]}>
        <Photo name={courier.photo} style={styles.etaPhoto} decorative />
        <View>
          <Text variant="label">{courier.name}</Text>
          <View style={styles.etaRow}>
            <Icon name="bike" size={12} color={palette.primary} strokeWidth={2.4} />
            <Text variant="caption" style={styles.etaText}>
              {copy.onboarding.courierBadge}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function FloatingPlate({
  photo,
  d,
  x,
  y,
  delay,
  drift,
  spin,
  size,
}: {
  photo: PhotoKey;
  d: number;
  x: number;
  y: number;
  delay: number;
  drift: number;
  spin?: boolean;
  size: number;
}) {
  const reduced = useReducedMotion();
  const float = useSharedValue(0);
  const turn = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    float.set(
      withDelay(
        delay + 600,
        withRepeat(withSequence(withTiming(1, { duration: drift, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: drift, easing: Easing.inOut(Easing.sin) })), -1),
      ),
    );
    if (spin) turn.set(withRepeat(withTiming(360, { duration: 60_000, easing: Easing.linear }), -1));
  }, [reduced, float, turn, delay, drift, spin]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -7 + float.get() * 14 }, { rotate: `${turn.get()}deg` }],
  }));
  const px = size * d;
  return (
    <Animated.View
      entering={ZoomIn.delay(delay).springify().damping(13).stiffness(150)}
      style={[styles.plate, { width: px, height: px, borderRadius: px / 2, left: size * x, top: size * y }]}
    >
      <Animated.View style={style}>
        <Photo name={photo} style={{ width: px, height: px, borderRadius: px / 2 }} decorative />
      </Animated.View>
    </Animated.View>
  );
}

function Location({ onBack, onPick, bottom }: { onBack: () => void; onPick: (a: Address) => void; bottom: number }) {
  const o = copy.onboarding;
  return (
    <Animated.View entering={FadeInRight.duration(380)} exiting={FadeOut.duration(150)} style={styles.flex}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.location, { paddingBottom: Math.max(bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.locationTop}>
          <IconButton icon="back" label={copy.common.back} onPress={onBack} />
          <Text variant="micro">{o.locationEyebrow}</Text>
          <View style={styles.spacer} />
        </View>
        <Animated.View entering={FadeInDown.delay(80).duration(420)}>
          <Text variant="title" accessibilityRole="header">
            {o.locationTitle}
          </Text>
          <Text variant="bodyMedium" color={palette.muted} style={styles.locationBody}>
            {o.locationBody}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(150).duration(400)}>
          <MapIllustration mode="pin" style={styles.map} />
        </Animated.View>
        <AddressPicker onPick={onPick} />
      </KeyboardAwareScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.canvas },
  flex: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingTop: 8 },
  skip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    justifyContent: "center",
    backgroundColor: palette.sunken,
  },
  stage: { flex: 1, minHeight: 0, alignItems: "center", justifyContent: "center", marginTop: 8 },
  plate: {
    position: "absolute",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 14px 30px rgba(34, 27, 24, 0.16)",
    overflow: "hidden",
  },
  eta: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 10px 24px rgba(34, 27, 24, 0.14)",
  },
  etaPhoto: { width: 32, height: 32, borderRadius: 16 },
  etaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  etaText: { fontSize: 12, lineHeight: 15 },
  welcomeText: { paddingHorizontal: GUTTER, gap: 18 },
  welcomeTitle: { marginTop: 8 },
  welcomeBody: { marginTop: 10 },
  stats: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.line,
  },
  location: { paddingHorizontal: GUTTER, paddingTop: 8, gap: 18 },
  locationTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  spacer: { width: 44 },
  locationBody: { marginTop: 6 },
  map: { height: 200, borderRadius: radii.xl, borderWidth: 1, borderColor: palette.line },
});
